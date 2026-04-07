import { definePreset } from "./types";

const LLAMA_BANNED_TOKENS = [
	"as an AI language model",
	"I don't have personal",
	"I cannot provide",
	"I must emphasize",
];

const HIGH_CONFIDENCE_THRESHOLD = 2;

export const llamaPreset = definePreset({
	name: "llama",
	bannedTokens: LLAMA_BANNED_TOKENS,
	patterns: [
		// P0: AI identity disclaimers
		{
			match: "As an AI language model,",
			replace: "",
			priority: "p0",
			description: "ai-identity-disclaimer",
		},
		{
			match: "As a large language model,",
			replace: "",
			priority: "p0",
			description: "ai-identity-disclaimer",
		},

		// P1: Capability disclaimers
		{
			match: "I don't have personal experiences",
			replace: "",
			priority: "p1",
			description: "capability-disclaimer",
		},
		{
			match: "I cannot provide medical/legal advice",
			replace: "",
			priority: "p1",
			description: "capability-disclaimer",
		},
		{
			match: "Please note that",
			replace: "",
			priority: "p1",
			description: "capability-disclaimer",
		},
		{
			match: "I must emphasize that",
			replace: "",
			priority: "p1",
			description: "capability-disclaimer",
		},
		{
			match: "It's crucial to",
			replace: "",
			priority: "p1",
			description: "capability-disclaimer",
		},
	],
	detect(text: string): number {
		const bannedCount = LLAMA_BANNED_TOKENS.filter((token) =>
			text.toLowerCase().includes(token.toLowerCase()),
		).length;

		if (bannedCount >= HIGH_CONFIDENCE_THRESHOLD) {
			return Math.min(1, 0.5 + (bannedCount / LLAMA_BANNED_TOKENS.length) * 2);
		}

		if (bannedCount === 1) {
			return 0.4;
		}

		const hasAiPhrase = /as an? (AI|artificial intelligence|language model)/i.test(text);
		if (hasAiPhrase) return 0.35;

		return 0;
	},
});
