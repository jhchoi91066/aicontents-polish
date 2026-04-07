import { enLocale } from "../locales/en";
import { koLocale } from "../locales/ko";
import { claudePreset } from "../presets/claude";
import { geminiPreset } from "../presets/gemini";
import { gptPreset } from "../presets/gpt";
import { llamaPreset } from "../presets/llama";
import type {
	AnalysisReport,
	Issue,
	Locale,
	LocaleInput,
	PolisherOptions,
	PolishResult,
	Preset,
	PresetInput,
	QualityMetrics,
} from "../types";
import { analyzeSentenceVariance, BANNED_TOKENS, detectBannedTokens } from "./analyzer";
import { detectDuplicateContent, detectPhantomReferences, validateMdxSyntax } from "./detector";
import { applySmellPatterns, removeEmojis } from "./fixer";
import {
	enforceHeadingHierarchy,
	removeBrokenInternalLinks,
	removeFakeImages,
	removeKeywordStuffingSections,
	removePostSourcesContent,
} from "./html";
import { humanizeGeneratedHTML } from "./humanizer";

const SCORE_ERROR_PENALTY = 15;
const SCORE_WARNING_PENALTY = 5;
const SCORE_INFO_PENALTY = 1;
const SCORE_MAX = 100;
const SCORE_MIN = 0;
const DEFAULT_MIN_STD_DEV = 2.5;

const PRESET_REGISTRY: Record<string, Preset> = {
	gemini: geminiPreset,
	gpt: gptPreset,
	claude: claudePreset,
	llama: llamaPreset,
};

const LOCALE_REGISTRY: Record<string, Locale> = {
	ko: koLocale,
	en: enLocale,
};

function mergePresets(presets: Preset[]): Preset {
	return {
		name: presets.map((p) => p.name).join("+"),
		bannedTokens: [...new Set(presets.flatMap((p) => p.bannedTokens))],
		patterns: presets.flatMap((p) => p.patterns),
	};
}

function detectBestFromRegistry<T extends { detect?: (text: string) => number }>(
	registry: Record<string, T>,
	text: string,
	fallback: T,
): T {
	let best = fallback;
	let bestScore = -1;

	for (const item of Object.values(registry)) {
		if (item.detect) {
			const score = item.detect(text);
			if (score > bestScore) {
				bestScore = score;
				best = item;
			}
		}
	}

	return best;
}

function resolvePresets(input: PresetInput, html?: string): Preset {
	if (input === "auto") {
		return detectBestFromRegistry(PRESET_REGISTRY, html ?? "", geminiPreset);
	}

	if (typeof input === "string") {
		const preset = PRESET_REGISTRY[input];
		if (!preset) throw new Error(`Unknown preset: "${input}"`);
		return preset;
	}

	if (Array.isArray(input)) {
		const resolved = input.map((item) => (typeof item === "string" ? resolvePresets(item) : item));
		return mergePresets(resolved);
	}

	return input as Preset;
}

function resolveLocale(input: LocaleInput, html?: string): Locale {
	if (input === "auto") {
		return detectBestFromRegistry(LOCALE_REGISTRY, html ?? "", enLocale);
	}

	if (typeof input === "string") {
		const locale = LOCALE_REGISTRY[input];
		if (!locale) throw new Error(`Unknown locale: "${input}"`);
		return locale;
	}

	return input as Locale;
}

function computeScore(issues: Issue[]): number {
	const penalty = issues.reduce((sum, issue) => {
		if (issue.severity === "error") return sum + SCORE_ERROR_PENALTY;
		if (issue.severity === "warning") return sum + SCORE_WARNING_PENALTY;
		return sum + SCORE_INFO_PENALTY;
	}, 0);

	return Math.max(SCORE_MIN, Math.min(SCORE_MAX, SCORE_MAX - penalty));
}

function collectBannedTokenIssues(html: string, preset: Preset, extra: string[]): Issue[] {
	const bannedResult = detectBannedTokens(html);
	const allTokens = [...BANNED_TOKENS, ...preset.bannedTokens, ...extra];
	const extraFound = allTokens.filter((token) => html.toLowerCase().includes(token.toLowerCase()));
	const uniqueFound = [...new Set([...bannedResult.found, ...extraFound])];

	return uniqueFound.map((token) => ({
		rule: "banned-token",
		severity: "warning" as const,
		message: `Banned token found: "${token}"`,
		suggestion: `Remove or rephrase "${token}"`,
	}));
}

function collectVarianceIssues(
	variance: { stdDev: number; sentenceCount: number },
	minStdDev: number,
): Issue[] {
	if (variance.stdDev < minStdDev && variance.sentenceCount > 1) {
		return [
			{
				rule: "sentence-variance",
				severity: "warning",
				message: `Low sentence variance (stdDev: ${variance.stdDev.toFixed(2)}, threshold: ${minStdDev})`,
				suggestion: "Vary sentence lengths to improve readability",
			},
		];
	}
	return [];
}

function collectDetectorIssues(html: string, isEnglish: boolean): Issue[] {
	const issues: Issue[] = [];

	for (const ref of detectPhantomReferences(html, isEnglish).found) {
		issues.push({
			rule: "phantom-reference",
			severity: "error",
			message: `Phantom reference detected: "${ref}"`,
			suggestion: "Remove references to external videos/posts",
		});
	}

	for (const dup of detectDuplicateContent(html)) {
		issues.push({ rule: "duplicate-content", severity: "warning", message: dup.description });
	}

	for (const mdxIssue of validateMdxSyntax(html).issues) {
		issues.push({
			rule: "mdx-syntax",
			severity: "error",
			message: mdxIssue,
			suggestion: "Fix MDX syntax to ensure proper rendering",
		});
	}

	return issues;
}

function buildMetrics(issues: Issue[], varianceStdDev: number): QualityMetrics {
	return {
		sentenceVariance: varianceStdDev,
		bannedTokenCount: issues.filter((i) => i.rule === "banned-token").length,
		phantomRefCount: issues.filter((i) => i.rule === "phantom-reference").length,
		duplicateCount: issues.filter((i) => i.rule === "duplicate-content").length,
		structuralRatio: 0,
	};
}

function applyHtmlFixes(html: string, disabledRules: Set<string>): string {
	let result = html;

	if (!disabledRules.has("headingHierarchy")) {
		result = enforceHeadingHierarchy(result);
	}

	result = removeKeywordStuffingSections(result);
	result = removeFakeImages(result);
	result = removeBrokenInternalLinks(result);
	result = removePostSourcesContent(result);

	if (!disabledRules.has("humanize")) {
		result = humanizeGeneratedHTML(result).html;
	}

	return result;
}

export function createPolisher(options: PolisherOptions) {
	const { rules = {} } = options;
	const disabledRules = new Set(rules.disable ?? []);
	const extraBannedTokens = rules.bannedTokens?.extra ?? [];
	const minStdDev = rules.sentenceVariance?.minStdDev ?? DEFAULT_MIN_STD_DEV;

	function analyzeWithResolved(html: string, preset: Preset, locale: Locale): AnalysisReport {
		const isEnglish = locale.name === "en";
		const variance = analyzeSentenceVariance(html);

		const issues: Issue[] = [
			...collectBannedTokenIssues(html, preset, extraBannedTokens),
			...collectVarianceIssues(variance, minStdDev),
			...collectDetectorIssues(html, isEnglish),
		];

		return {
			score: computeScore(issues),
			passed: issues.every((i) => i.severity !== "error"),
			issues,
			fixes: [],
			metrics: buildMetrics(issues, variance.stdDev),
		};
	}

	function analyze(html: string): AnalysisReport {
		const preset = resolvePresets(options.preset, html);
		const locale = resolveLocale(options.locale ?? "auto", html);
		return analyzeWithResolved(html, preset, locale);
	}

	function process(html: string): PolishResult {
		const preset = resolvePresets(options.preset, html);
		const locale = resolveLocale(options.locale ?? "auto", html);
		const report = analyzeWithResolved(html, preset, locale);

		const mergedPatterns = [...preset.patterns, ...locale.hedgingPatterns];
		const { text: afterSmells, fixes: smellFixes } = applySmellPatterns(html, mergedPatterns);

		let afterEmojis = afterSmells;
		if (!disabledRules.has("emojiRemoval")) {
			afterEmojis = removeEmojis(afterSmells, "none").text;
		}

		const processedHtml = applyHtmlFixes(afterEmojis, disabledRules);

		return {
			html: processedHtml,
			report: { ...report, fixes: [...report.fixes, ...smellFixes] },
		};
	}

	return { process, analyze };
}
