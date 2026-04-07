import { definePreset } from "./types";

const GPT_BANNED_TOKENS = [
	"delve",
	"nuanced",
	"landscape",
	"navigate",
	"comprehensive",
	"leverage",
	"robust",
	"streamline",
	"cutting-edge",
	"paradigm",
];

const HIGH_CONFIDENCE_THRESHOLD = 3;
const MIN_CONFIDENCE_THRESHOLD = 1;

export const gptPreset = definePreset({
	name: "gpt",
	bannedTokens: GPT_BANNED_TOKENS,
	patterns: [
		// P0: Opening filler phrases
		{
			match: "Let's dive in",
			replace: "",
			priority: "p0",
			description: "opening-filler",
		},
		{
			match: "In this article, we'll",
			replace: "",
			priority: "p0",
			description: "opening-filler",
		},
		{
			match: "Without further ado",
			replace: "",
			priority: "p0",
			description: "opening-filler",
		},

		// P1: Opinion qualifier patterns (from original editor.ts lines 148-150)
		{
			match: /I personally think/gi,
			replace: "I think",
			priority: "p1",
			description: "opinion-qualifier",
		},
		{
			match: /In my opinion,?\s*/gi,
			replace: "",
			priority: "p1",
			description: "opinion-qualifier",
		},
		{
			match: /Basically,?\s*/gi,
			replace: "",
			priority: "p1",
			description: "opinion-qualifier",
		},

		// P0: Banned AI tokens (from original editor.ts lines 153-158)
		{
			match: /\bElevate\b/gi,
			replace: "improve",
			priority: "p0",
			description: "banned-ai-token",
		},
		{
			match: /\bDelve\b/gi,
			replace: "explore",
			priority: "p0",
			description: "banned-ai-token",
		},
		{
			match: /\bTapestry\b/gi,
			replace: "",
			priority: "p0",
			description: "banned-ai-token",
		},
		{
			match: /\bRealm\b/gi,
			replace: "area",
			priority: "p0",
			description: "banned-ai-token",
		},
		{
			match: /\bGame-changer\b/gi,
			replace: "significant change",
			priority: "p0",
			description: "banned-ai-token",
		},
		{
			match: /\bUnleash\b/gi,
			replace: "release",
			priority: "p0",
			description: "banned-ai-token",
		},

		// P1: Hedging meta-commentary (from original editor.ts lines 159-170)
		{
			match: /It is worth noting that\s*/gi,
			replace: "",
			priority: "p1",
			description: "hedging-meta",
		},
		{
			match: /It's worth noting that\s*/gi,
			replace: "",
			priority: "p1",
			description: "hedging-meta",
		},
		{
			match: /It should be noted that\s*/gi,
			replace: "",
			priority: "p1",
			description: "hedging-meta",
		},
		{
			match: /It's important to note that\s*/gi,
			replace: "",
			priority: "p1",
			description: "hedging-meta",
		},
		{
			match: /As mentioned earlier,?\s*/gi,
			replace: "",
			priority: "p1",
			description: "hedging-meta",
		},
		{
			match: /As previously stated,?\s*/gi,
			replace: "",
			priority: "p1",
			description: "hedging-meta",
		},

		// P1: Conclusion filler phrases (from original editor.ts lines 161-167)
		{
			match: /In conclusion,?\s*/gi,
			replace: "",
			priority: "p1",
			description: "conclusion-filler",
		},
		{
			match: /To summarize,?\s*/gi,
			replace: "",
			priority: "p1",
			description: "conclusion-filler",
		},
		{
			match: /All in all,?\s*/gi,
			replace: "",
			priority: "p1",
			description: "conclusion-filler",
		},
		{
			match: /In summary,?\s*/gi,
			replace: "",
			priority: "p1",
			description: "conclusion-filler",
		},
		{
			match: /Overall,?\s*/gi,
			replace: "",
			priority: "p1",
			description: "conclusion-filler",
		},
		{
			match: /Ultimately,?\s*/gi,
			replace: "",
			priority: "p1",
			description: "conclusion-filler",
		},
		{
			match: /At the end of the day,?\s*/gi,
			replace: "",
			priority: "p1",
			description: "conclusion-filler",
		},
	],
	detect(text: string): number {
		const bannedCount = GPT_BANNED_TOKENS.filter((token) =>
			text.toLowerCase().includes(token.toLowerCase()),
		).length;

		if (bannedCount >= HIGH_CONFIDENCE_THRESHOLD) {
			return Math.min(1, 0.5 + (bannedCount / GPT_BANNED_TOKENS.length) * 2);
		}

		if (bannedCount >= MIN_CONFIDENCE_THRESHOLD) {
			return 0.3 + (bannedCount / GPT_BANNED_TOKENS.length) * 0.5;
		}

		return 0;
	},
});
