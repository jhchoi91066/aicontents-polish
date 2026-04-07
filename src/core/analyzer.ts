export interface PunctuationIssue {
	pattern: string;
	position: number;
	description: string;
}

export interface OrphanedPunctuationPattern {
	pattern: string;
	fix: string;
	description: string;
}

const VARIANCE_THRESHOLD = 2.5;

export const BANNED_TOKENS: string[] = [
	// English (23)
	"elevate",
	"delve",
	"tapestry",
	"realm",
	"game-changer",
	"unleash",
	"landscape",
	"leverage",
	"robust",
	"seamless",
	"holistic",
	"pivotal",
	"meticulous",
	"multifaceted",
	"paramount",
	"underpinned",
	"foster",
	"harness",
	"deep dive",
	"dive into",
	"shed light",
	"it's worth noting",
	"it's important to note",
	// Korean (19)
	"혁신적인",
	"획기적인",
	"필수불가결",
	"종합적으로",
	"다각적으로",
	"살펴보겠습니다",
	"알아보겠습니다",
	"마무리하겠습니다",
	"에 대해 알아보았습니다",
	"결론적으로",
	"전반적으로",
	"기본적으로",
	"일반적으로",
	"효율적으로",
	"효과적으로",
	"체계적으로",
	"다양한 측면에서",
	"이러한 점에서",
	"이러한 측면에서",
];

export const ORPHANED_PUNCTUATION_PATTERNS: OrphanedPunctuationPattern[] = [
	{ pattern: ". ,", fix: ". ", description: "orphaned comma after period" },
	{ pattern: ",,", fix: ",", description: "double comma" },
	{ pattern: ". .", fix: ". ", description: "double period with space" },
	{ pattern: ", .", fix: ". ", description: "comma before period" },
	{ pattern: ": ,", fix: ": ", description: "orphaned comma after colon" },
	{ pattern: "; ,", fix: "; ", description: "orphaned comma after semicolon" },
	{ pattern: "? ,", fix: "? ", description: "orphaned comma after question mark" },
	{ pattern: "! ,", fix: "! ", description: "orphaned comma after exclamation mark" },
];

export function detectBannedTokens(text: string): {
	found: string[];
	count: number;
	passed: boolean;
} {
	const lowerText = text.toLowerCase();
	const found = BANNED_TOKENS.filter((token) => {
		const lowerToken = token.toLowerCase();
		return lowerText.includes(lowerToken);
	});

	return {
		found,
		count: found.length,
		passed: found.length === 0,
	};
}

function splitIntoSentences(text: string): string[] {
	return text
		.split(/[.!?]+/)
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
}

function countWords(sentence: string): number {
	return sentence.split(/\s+/).filter((w) => w.length > 0).length;
}

function computeStdDev(values: number[]): number {
	if (values.length === 0) return 0;
	const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
	const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
	return Math.sqrt(variance);
}

export function analyzeSentenceVariance(text: string): {
	stdDev: number;
	sentenceCount: number;
	meetsThreshold: boolean;
} {
	const sentences = splitIntoSentences(text);
	if (sentences.length === 0) {
		return { stdDev: 0, sentenceCount: 0, meetsThreshold: false };
	}

	const wordCounts = sentences.map(countWords);
	const stdDev = computeStdDev(wordCounts);

	return {
		stdDev,
		sentenceCount: sentences.length,
		meetsThreshold: stdDev >= VARIANCE_THRESHOLD,
	};
}

export function detectPunctuationIssues(text: string): PunctuationIssue[] {
	const issues: PunctuationIssue[] = [];

	for (const { pattern, description } of ORPHANED_PUNCTUATION_PATTERNS) {
		let searchStart = 0;
		while (true) {
			const position = text.indexOf(pattern, searchStart);
			if (position === -1) break;
			issues.push({ pattern, position, description });
			searchStart = position + 1;
		}
	}

	return issues;
}

export function fixPunctuationIssues(text: string): string {
	let result = text;
	for (const { pattern, fix } of ORPHANED_PUNCTUATION_PATTERNS) {
		while (result.includes(pattern)) {
			result = result.split(pattern).join(fix);
		}
	}
	return result.replace(/ {2,}/g, " ");
}

export function analyzeTextQuality(html: string): {
	bannedTokens: ReturnType<typeof detectBannedTokens>;
	sentenceVariance: ReturnType<typeof analyzeSentenceVariance>;
	punctuationIssues: PunctuationIssue[];
	passed: boolean;
} {
	const bannedTokens = detectBannedTokens(html);
	const sentenceVariance = analyzeSentenceVariance(html);
	const punctuationIssues = detectPunctuationIssues(html);

	const passed =
		bannedTokens.passed && sentenceVariance.meetsThreshold && punctuationIssues.length === 0;

	return { bannedTokens, sentenceVariance, punctuationIssues, passed };
}
