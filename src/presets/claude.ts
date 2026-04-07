import { definePreset } from "./types";

const CLAUDE_BANNED_TOKENS = [
	"straightforward",
	"I'd be happy to",
	"certainly",
	"absolutely",
	"great question",
];

const CLAUDE_SIGNAL_PATTERNS = [
	"I'd be happy to help",
	"That's a great question",
	"Certainly!",
	"Absolutely!",
	"Let me help you with",
	"I understand you want",
	"Here's what I can tell you",
	"It's important to understand that",
	"Keep in mind that",
];

const HIGH_CONFIDENCE_TOKEN_THRESHOLD = 2;

export const claudePreset = definePreset({
	name: "claude",
	bannedTokens: CLAUDE_BANNED_TOKENS,
	patterns: [
		// P1: Sycophantic openers
		{
			match: "I'd be happy to help",
			replace: "",
			priority: "p1",
			description: "sycophantic-opener",
		},
		{
			match: "That's a great question",
			replace: "",
			priority: "p1",
			description: "sycophantic-opener",
		},
		{
			match: "Certainly!",
			replace: "",
			priority: "p1",
			description: "sycophantic-opener",
		},
		{
			match: "Absolutely!",
			replace: "",
			priority: "p1",
			description: "sycophantic-opener",
		},

		// P1: Context-restating meta phrases
		{
			match: "Let me help you with",
			replace: "",
			priority: "p1",
			description: "context-restate",
		},
		{
			match: "I understand you want",
			replace: "",
			priority: "p1",
			description: "context-restate",
		},
		{
			match: "Here's what I can tell you",
			replace: "",
			priority: "p1",
			description: "context-restate",
		},

		// P1: Hedging qualifiers
		{
			match: "It's important to understand that",
			replace: "",
			priority: "p1",
			description: "hedging-qualifier",
		},
		{
			match: "Keep in mind that",
			replace: "",
			priority: "p1",
			description: "hedging-qualifier",
		},
	],
	detect(text: string): number {
		const bannedCount = CLAUDE_BANNED_TOKENS.filter((token) =>
			text.toLowerCase().includes(token.toLowerCase()),
		).length;

		const signalCount = CLAUDE_SIGNAL_PATTERNS.filter((pattern) => text.includes(pattern)).length;

		const totalScore = bannedCount + signalCount;

		if (totalScore >= HIGH_CONFIDENCE_TOKEN_THRESHOLD) {
			return Math.min(1, 0.4 + totalScore * 0.15);
		}

		if (totalScore === 1) {
			return 0.3;
		}

		return 0;
	},
});
