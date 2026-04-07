import type { Fix, SmellPattern } from "../types";
import { KOREAN_FULL_REGEX } from "./utils.js";

const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
const HASHTAG_REGEX = /#[\w가-힣]+/g;
const BOLD_PATTERN_REGEX = /\*\*[^*]+\*\*/g;
const DETAILS_BLOCK_REGEX = /<details[\s\S]*?<\/details>/gi;
const KOREAN_PRESENCE_REGEX = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/;

const EMOJI_LIMITS: Record<string, number> = {
	none: 0,
	minimal: 2,
	moderate: 5,
	heavy: Infinity,
};

const PRIORITY_ORDER: Array<"p0" | "p1" | "p2"> = ["p0", "p1", "p2"];

function sortPatternsByPriority(patterns: SmellPattern[]): SmellPattern[] {
	return [...patterns].sort((a, b) => {
		const pa = PRIORITY_ORDER.indexOf(a.priority ?? "p2");
		const pb = PRIORITY_ORDER.indexOf(b.priority ?? "p2");
		return pa - pb;
	});
}

function applyPattern(
	text: string,
	pattern: SmellPattern,
): { text: string; changed: boolean; original: string } {
	const original = text;
	let result: string;

	if (typeof pattern.replace === "string") {
		const replacement = pattern.replace;
		result =
			pattern.match instanceof RegExp
				? text.replace(pattern.match, replacement)
				: text.split(pattern.match).join(replacement);
	} else {
		const replaceFn = pattern.replace;
		result =
			pattern.match instanceof RegExp
				? text.replace(pattern.match, replaceFn)
				: text.split(pattern.match).join(replaceFn(pattern.match as string));
	}

	return { text: result, changed: result !== original, original };
}

export function applySmellPatterns(
	text: string,
	patterns: SmellPattern[],
): { text: string; fixes: Fix[] } {
	const sorted = sortPatternsByPriority(patterns);
	const fixes: Fix[] = [];
	let current = text;

	for (const pattern of sorted) {
		const { text: next, changed, original } = applyPattern(current, pattern);
		if (changed) {
			fixes.push({
				rule: pattern.description ?? "smell-pattern",
				original,
				replacement: next,
			});
			current = next;
		}
	}

	return { text: current, fixes };
}

export function removeEmojis(
	text: string,
	frequency: "none" | "minimal" | "moderate" | "heavy",
): { text: string; removedCount: number } {
	const limit = EMOJI_LIMITS[frequency];

	if (limit === Infinity) {
		return { text, removedCount: 0 };
	}

	// New RegExp instances are created from the source because /g flag regex is stateful (lastIndex).
	// Sharing a single /g instance across calls would cause incorrect behavior.
	const allEmojis = [...text.matchAll(new RegExp(EMOJI_REGEX.source, "gu"))];
	const total = allEmojis.length;

	if (total <= limit) {
		return { text, removedCount: 0 };
	}

	const keepCount = limit;
	let kept = 0;
	const result = text.replace(new RegExp(EMOJI_REGEX.source, "gu"), (match) => {
		if (kept < keepCount) {
			kept++;
			return match;
		}
		return "";
	});

	return { text: result, removedCount: total - keepCount };
}

export function adjustHashtags(
	text: string,
	_min: number,
	max: number,
): { text: string; adjusted: boolean } {
	const matches = text.match(HASHTAG_REGEX) ?? [];
	const count = matches.length;

	if (count <= max) {
		return { text, adjusted: false };
	}

	let kept = 0;
	// New RegExp from source: /g flag regex is stateful, must create a fresh instance per call.
	const resultFromEnd = text.replace(new RegExp(HASHTAG_REGEX.source, "g"), (match) => {
		kept++;
		if (kept > max) {
			return "";
		}
		return match;
	});

	return { text: resultFromEnd.replace(/\s{2,}/g, " ").trim(), adjusted: true };
}

function stripDetailsBlocks(text: string): string {
	return text.replace(DETAILS_BLOCK_REGEX, "");
}

function countWords(text: string): number {
	return text
		.trim()
		.split(/\s+/)
		.filter((w) => w.length > 0).length;
}

export function fixExcessiveMarkdownBold(text: string): {
	text: string;
	removedCount: number;
} {
	const textWithoutDetails = stripDetailsBlocks(text);
	const wordCount = countWords(textWithoutDetails);
	const boldMatches = textWithoutDetails.match(BOLD_PATTERN_REGEX) ?? [];
	const boldCount = boldMatches.length;

	const MAX_BOLD_PER_100_WORDS = 1;
	const allowedBold = Math.max(1, Math.floor(wordCount / 100) * MAX_BOLD_PER_100_WORDS);

	if (boldCount <= allowedBold) {
		return { text, removedCount: 0 };
	}

	let seen = 0;
	const result = text.replace(BOLD_PATTERN_REGEX, (match) => {
		seen++;
		if (seen > allowedBold) {
			return match.replace(/\*\*/g, "");
		}
		return match;
	});

	return { text: result, removedCount: boldCount - allowedBold };
}

export function containsKorean(text: string): boolean {
	return KOREAN_PRESENCE_REGEX.test(text);
}

export function getKoreanRatio(text: string): number {
	const nonWhitespace = text.replace(/\s/g, "");
	if (nonWhitespace.length === 0) return 0;

	const koreanChars = nonWhitespace.match(KOREAN_FULL_REGEX) ?? [];
	return koreanChars.length / nonWhitespace.length;
}

export function applyAllFixes(
	text: string,
	options: {
		patterns: SmellPattern[];
		emojiFrequency?: "none" | "minimal" | "moderate" | "heavy";
		hashtagLimits?: { min: number; max: number };
	},
): {
	text: string;
	report: {
		fixes: Fix[];
		emojisRemoved: number;
		hashtagsAdjusted: boolean;
	};
} {
	const { patterns, emojiFrequency = "none", hashtagLimits } = options;

	const { text: afterPatterns, fixes } = applySmellPatterns(text, patterns);

	const { text: afterEmojis, removedCount: emojisRemoved } = removeEmojis(
		afterPatterns,
		emojiFrequency,
	);

	let afterHashtags = afterEmojis;
	let hashtagsAdjusted = false;

	if (hashtagLimits) {
		const result = adjustHashtags(afterEmojis, hashtagLimits.min, hashtagLimits.max);
		afterHashtags = result.text;
		hashtagsAdjusted = result.adjusted;
	}

	const cleaned = afterHashtags.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n");

	return {
		text: cleaned,
		report: { fixes, emojisRemoved, hashtagsAdjusted },
	};
}
