import * as cheerio from "cheerio";
import { KOREAN_SYLLABLE_REGEX } from "./utils.js";

export interface DuplicateContentIssue {
	type: "duplicate-heading" | "duplicate-sources";
	description: string;
	value?: string;
}

const KOREAN_CHAR_THRESHOLD = 20;

export const PHANTOM_REFERENCE_PATTERNS_KO: RegExp[] = [
	/제 영상에서/,
	/제 유튜브에서/,
	/이전 글에서/,
	/지난번에 리뷰했던/,
	/앞서 소개한/,
	/이전 포스팅에서/,
	/저번에 말씀드린/,
	/예전 글에서/,
	/지난 글에서/,
	/제 채널에서/,
];

export const PHANTOM_REFERENCE_PATTERNS_EN: RegExp[] = [
	/in my (previous|last) (video|post|article)/i,
	/as i (mentioned|discussed|covered) (before|earlier|previously)/i,
	/if you (saw|watched) my (last|previous)/i,
	/in my youtube/i,
	/on my channel/i,
];

export const DOWNSIDE_PATTERNS_KO: RegExp[] = [
	/단점/,
	/불편한 점/,
	/아쉬운 점/,
	/문제점/,
	/단점이/,
	/부족한 점/,
	/개선이 필요/,
];

export const DOWNSIDE_PATTERNS_EN: RegExp[] = [
	/drawback/i,
	/downside/i,
	/could be better/i,
	/disadvantage/i,
	/weakness/i,
	/con[s]?\b/i,
	/not perfect/i,
];

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
	isEnglish = false,
): { found: string[]; count: number; passed: boolean } {
	const patterns = isEnglish ? PHANTOM_REFERENCE_PATTERNS_EN : PHANTOM_REFERENCE_PATTERNS_KO;

	const found: string[] = [];
	for (const pattern of patterns) {
		const match = text.match(pattern);
		if (match) {
			found.push(match[0]);
		}
	}

	return {
		found,
		count: found.length,
		passed: found.length === 0,
	};
}

export function detectDuplicateContent(html: string): DuplicateContentIssue[] {
	const $ = cheerio.load(html);
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

export function detectOrphanedParticles(text: string): {
	count: number;
	samples: string[];
	passed: boolean;
} {
	const ORPHANED_PARTICLE_PATTERN = /([은는이가을를의에서도만]\s+[은는이가을를의에서도만])/g;
	const matches = text.match(ORPHANED_PARTICLE_PATTERN) ?? [];
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
	isEnglish = false,
): { hasDownside: boolean; found: string[]; passed: boolean } {
	const patterns = isEnglish ? DOWNSIDE_PATTERNS_EN : DOWNSIDE_PATTERNS_KO;

	const found: string[] = [];
	for (const pattern of patterns) {
		const match = text.match(pattern);
		if (match) {
			found.push(match[0]);
		}
	}

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
	const $ = cheerio.load(html);
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
