import * as cheerio from "cheerio";
import type { Locale, ParticleRule } from "../types";
import { KOREAN_SYLLABLE_REGEX } from "./utils.js";

export interface DuplicateContentIssue {
	type: "duplicate-heading" | "duplicate-sources";
	description: string;
	value?: string;
}

const KOREAN_CHAR_THRESHOLD = 20;

function ensureGlobalRegex(pattern: RegExp): RegExp {
	const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
	return new RegExp(pattern.source, flags);
}

function collectPatternMatches(text: string, patterns: RegExp[]): string[] {
	return patterns.flatMap((pattern) => {
		const regex = ensureGlobalRegex(pattern);
		return Array.from(text.matchAll(regex), (match) => match[0]);
	});
}

export const TITLE_NUMBER_PATTERNS: Array<{
	pattern: RegExp;
	description: string;
}> = [
	{ pattern: /(\d+)곳/, description: "Korean location count (곳)" },
	{ pattern: /(\d+)가지/, description: "Korean item count (가지)" },
	{ pattern: /(\d+)개/, description: "Korean item count (개)" },
	{
		pattern: /(\d+)\s*(best|top|ways|tips|tricks|things|ideas|steps)/i,
		description: "English numbered list",
	},
	{ pattern: /^(\d+)\s/, description: "Leading number" },
];

export function detectPhantomReferences(
	text: string,
	locale: Pick<Locale, "phantomReferencePatterns">,
): { found: string[]; count: number; passed: boolean } {
	const patterns = locale.phantomReferencePatterns ?? [];
	const found = collectPatternMatches(text, patterns);

	return {
		found,
		count: found.length,
		passed: found.length === 0,
	};
}

export function detectDuplicateContent(html: string): DuplicateContentIssue[] {
	const $ = cheerio.load(html, { xmlMode: false }, false);
	const issues: DuplicateContentIssue[] = [];

	const headingTexts = new Map<string, number>();
	$("h2, h3").each((_, el) => {
		const text = $(el).text().trim();
		const count = headingTexts.get(text) ?? 0;
		headingTexts.set(text, count + 1);
	});

	for (const [text, count] of headingTexts) {
		if (count > 1) {
			issues.push({
				type: "duplicate-heading",
				description: `Heading "${text}" appears ${count} times`,
				value: text,
			});
		}
	}

	const sourcesCount = $("section.sources").length;
	if (sourcesCount > 1) {
		issues.push({
			type: "duplicate-sources",
			description: `Sources section appears ${sourcesCount} times`,
		});
	}

	return issues;
}

export function detectKoreanInEnglish(text: string): {
	koreanCharCount: number;
	passed: boolean;
} {
	const matches = text.match(KOREAN_SYLLABLE_REGEX) ?? [];
	const koreanCharCount = matches.length;
	return {
		koreanCharCount,
		passed: koreanCharCount < KOREAN_CHAR_THRESHOLD,
	};
}

export function detectOrphanedParticles(
	text: string,
	particleRules: ParticleRule[] = [],
): {
	count: number;
	samples: string[];
	passed: boolean;
} {
	const matches = particleRules.flatMap((rule) => {
		const regex = ensureGlobalRegex(rule.pattern);
		return Array.from(text.matchAll(regex), (match) => match[0]);
	});
	const samples = [...new Set(matches)];

	return {
		count: matches.length,
		samples,
		passed: matches.length === 0,
	};
}

/** passed = true means content includes honest downsides (balanced). passed = false means purely positive (suspicious). */
export function checkForDownsides(
	text: string,
	locale: Pick<Locale, "downsidePatterns">,
): { hasDownside: boolean; found: string[]; passed: boolean } {
	const patterns = locale.downsidePatterns ?? [];
	const found = collectPatternMatches(text, patterns);

	return {
		hasDownside: found.length > 0,
		found,
		passed: found.length > 0,
	};
}

export function validateMdxSyntax(text: string): {
	codeBlocksBalanced: boolean;
	issues: string[];
	passed: boolean;
} {
	const issues: string[] = [];

	const codeBlockMatches = text.match(/```/g) ?? [];
	const codeBlocksBalanced = codeBlockMatches.length % 2 === 0;
	if (!codeBlocksBalanced) {
		issues.push("Unbalanced code blocks (odd number of ``` markers)");
	}

	const codeBlockRegex = /```[\s\S]*?```/g;
	const textWithoutCode = text.replace(codeBlockRegex, "");
	const curlyBraceMatches = textWithoutCode.match(/\{[^}]*\}/g) ?? [];
	if (curlyBraceMatches.length > 0) {
		issues.push(`Curly braces outside code blocks: ${curlyBraceMatches.join(", ")}`);
	}

	return {
		codeBlocksBalanced,
		issues,
		passed: codeBlocksBalanced && curlyBraceMatches.length === 0,
	};
}

export function extractTitleNumber(title: string): number | null {
	for (const { pattern } of TITLE_NUMBER_PATTERNS) {
		const match = title.match(pattern);
		if (match) {
			const num = parseInt(match[1], 10);
			if (!Number.isNaN(num)) return num;
		}
	}
	return null;
}

export function validateTitleBodyConsistency(
	title: string,
	html: string,
): { valid: boolean; titleNumber: number | null; bodyCount: number } {
	const titleNumber = extractTitleNumber(title);
	const $ = cheerio.load(html, { xmlMode: false }, false);
	const bodyCount = $("h2").length;

	if (titleNumber === null) {
		return { valid: true, titleNumber: null, bodyCount };
	}

	return {
		valid: bodyCount === titleNumber,
		titleNumber,
		bodyCount,
	};
}
