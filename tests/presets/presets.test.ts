import { describe, expect, it } from "vitest";
import { applySmellPatterns } from "../../src/core/fixer";
import { claudePreset } from "../../src/presets/claude";
import { gptPreset } from "../../src/presets/gpt";
import { llamaPreset } from "../../src/presets/llama";

describe("presets/gpt", () => {
	describe("structure", () => {
		it("should have banned tokens", () => {
			expect(gptPreset.bannedTokens.length).toBeGreaterThan(0);
			expect(gptPreset.bannedTokens).toContain("delve");
			expect(gptPreset.bannedTokens).toContain("nuanced");
			expect(gptPreset.bannedTokens).toContain("leverage");
			expect(gptPreset.bannedTokens).toContain("comprehensive");
		});

		it("should have patterns", () => {
			expect(gptPreset.patterns.length).toBeGreaterThan(0);
		});

		it("should have P0 opening filler patterns", () => {
			const p0Patterns = gptPreset.patterns.filter((p) => p.priority === "p0");
			expect(p0Patterns.length).toBeGreaterThanOrEqual(3);
		});
	});

	describe("pattern transformation", () => {
		it("should remove Let's dive in", () => {
			const { text } = applySmellPatterns("Let's dive in to the topic.", gptPreset.patterns);
			expect(text).not.toContain("Let's dive in");
		});

		it("should remove In this article, we'll", () => {
			const { text } = applySmellPatterns(
				"In this article, we'll cover the basics.",
				gptPreset.patterns,
			);
			expect(text).not.toContain("In this article, we'll");
		});

		it("should remove Without further ado", () => {
			const { text } = applySmellPatterns("Without further ado, here it is.", gptPreset.patterns);
			expect(text).not.toContain("Without further ado");
		});

		it("should remove It's worth noting that", () => {
			const { text } = applySmellPatterns(
				"It's worth noting that this is important.",
				gptPreset.patterns,
			);
			expect(text).not.toContain("It's worth noting that");
		});

		it("should remove It should be noted that", () => {
			const { text } = applySmellPatterns(
				"It should be noted that the results vary.",
				gptPreset.patterns,
			);
			expect(text).not.toContain("It should be noted that");
		});

		it("should remove As mentioned earlier", () => {
			const { text } = applySmellPatterns("As mentioned earlier, this is key.", gptPreset.patterns);
			expect(text).not.toContain("As mentioned earlier");
		});

		it("should transform I personally think to I think", () => {
			const { text } = applySmellPatterns(
				"I personally think this approach works.",
				gptPreset.patterns,
			);
			expect(text).toContain("I think");
			expect(text).not.toContain("I personally think");
		});

		it("should remove In my opinion,", () => {
			const { text } = applySmellPatterns("In my opinion, this is correct.", gptPreset.patterns);
			expect(text).not.toContain("In my opinion,");
		});

		it("should remove Basically,", () => {
			const { text } = applySmellPatterns("Basically, the idea is simple.", gptPreset.patterns);
			expect(text).not.toContain("Basically,");
		});

		it("should remove In conclusion,", () => {
			const { text } = applySmellPatterns("In conclusion, this works well.", gptPreset.patterns);
			expect(text).not.toContain("In conclusion,");
		});

		it("should remove To summarize,", () => {
			const { text } = applySmellPatterns(
				"To summarize, here are the key points.",
				gptPreset.patterns,
			);
			expect(text).not.toContain("To summarize,");
		});

		it("should remove All in all,", () => {
			const { text } = applySmellPatterns("All in all, it was successful.", gptPreset.patterns);
			expect(text).not.toContain("All in all,");
		});

		it("should remove In summary,", () => {
			const { text } = applySmellPatterns("In summary, the results are clear.", gptPreset.patterns);
			expect(text).not.toContain("In summary,");
		});

		it("should remove Overall,", () => {
			const { text } = applySmellPatterns(
				"Overall, the project was a success.",
				gptPreset.patterns,
			);
			expect(text).not.toContain("Overall,");
		});

		it("should remove Ultimately,", () => {
			const { text } = applySmellPatterns("Ultimately, the choice is yours.", gptPreset.patterns);
			expect(text).not.toContain("Ultimately,");
		});

		it("should remove At the end of the day,", () => {
			const { text } = applySmellPatterns(
				"At the end of the day, results matter.",
				gptPreset.patterns,
			);
			expect(text).not.toContain("At the end of the day,");
		});
	});

	describe("detect", () => {
		it("should return high confidence for text with many banned tokens", () => {
			const gptText =
				"Let's delve into the nuanced landscape of comprehensive solutions that leverage robust paradigms.";
			const confidence = gptPreset.detect?.(gptText);
			expect(confidence).toBeGreaterThan(0.5);
		});

		it("should return moderate confidence for text with some banned tokens", () => {
			const text = "This comprehensive guide will help you navigate the process.";
			const confidence = gptPreset.detect?.(text);
			expect(confidence).toBeGreaterThan(0);
		});

		it("should return zero confidence for clean text", () => {
			const cleanText = "The weather is nice today. I went for a walk.";
			const confidence = gptPreset.detect?.(cleanText);
			expect(confidence).toBe(0);
		});

		it("should return zero confidence for empty string", () => {
			expect(gptPreset.detect?.("")).toBe(0);
		});
	});
});

describe("presets/claude", () => {
	describe("structure", () => {
		it("should have banned tokens", () => {
			expect(claudePreset.bannedTokens.length).toBeGreaterThan(0);
			expect(claudePreset.bannedTokens).toContain("straightforward");
			expect(claudePreset.bannedTokens).toContain("I'd be happy to");
			expect(claudePreset.bannedTokens).toContain("certainly");
			expect(claudePreset.bannedTokens).toContain("great question");
		});

		it("should have patterns", () => {
			expect(claudePreset.patterns.length).toBeGreaterThan(0);
		});
	});

	describe("pattern transformation", () => {
		it("should remove I'd be happy to help", () => {
			const { text } = applySmellPatterns(
				"I'd be happy to help you with this.",
				claudePreset.patterns,
			);
			expect(text).not.toContain("I'd be happy to help");
		});

		it("should remove That's a great question", () => {
			const { text } = applySmellPatterns(
				"That's a great question! Let me explain.",
				claudePreset.patterns,
			);
			expect(text).not.toContain("That's a great question");
		});

		it("should remove Certainly!", () => {
			const { text } = applySmellPatterns("Certainly! Here is the answer.", claudePreset.patterns);
			expect(text).not.toContain("Certainly!");
		});

		it("should remove Absolutely!", () => {
			const { text } = applySmellPatterns(
				"Absolutely! That is the right approach.",
				claudePreset.patterns,
			);
			expect(text).not.toContain("Absolutely!");
		});

		it("should remove Let me help you with", () => {
			const { text } = applySmellPatterns("Let me help you with that task.", claudePreset.patterns);
			expect(text).not.toContain("Let me help you with");
		});

		it("should remove I understand you want", () => {
			const { text } = applySmellPatterns(
				"I understand you want a quick answer.",
				claudePreset.patterns,
			);
			expect(text).not.toContain("I understand you want");
		});

		it("should remove Here's what I can tell you", () => {
			const { text } = applySmellPatterns(
				"Here's what I can tell you about this topic.",
				claudePreset.patterns,
			);
			expect(text).not.toContain("Here's what I can tell you");
		});

		it("should remove It's important to understand that", () => {
			const { text } = applySmellPatterns(
				"It's important to understand that context matters.",
				claudePreset.patterns,
			);
			expect(text).not.toContain("It's important to understand that");
		});

		it("should remove Keep in mind that", () => {
			const { text } = applySmellPatterns(
				"Keep in mind that results may vary.",
				claudePreset.patterns,
			);
			expect(text).not.toContain("Keep in mind that");
		});
	});

	describe("detect", () => {
		it("should return high confidence for text with Claude patterns", () => {
			const claudeText =
				"Certainly! That's a great question. I'd be happy to help you. It's important to understand that this is straightforward.";
			const confidence = claudePreset.detect?.(claudeText);
			expect(confidence).toBeGreaterThan(0.5);
		});

		it("should return moderate confidence for text with one Claude pattern", () => {
			const text = "Certainly! Here is the information you need.";
			const confidence = claudePreset.detect?.(text);
			expect(confidence).toBeGreaterThan(0);
		});

		it("should return zero confidence for clean text", () => {
			const cleanText = "The report shows a 15% increase in revenue for Q3.";
			const confidence = claudePreset.detect?.(cleanText);
			expect(confidence).toBe(0);
		});

		it("should return zero confidence for empty string", () => {
			expect(claudePreset.detect?.("")).toBe(0);
		});
	});
});

describe("presets/llama", () => {
	describe("structure", () => {
		it("should have banned tokens", () => {
			expect(llamaPreset.bannedTokens.length).toBeGreaterThan(0);
			expect(llamaPreset.bannedTokens).toContain("as an AI language model");
			expect(llamaPreset.bannedTokens).toContain("I don't have personal");
			expect(llamaPreset.bannedTokens).toContain("I cannot provide");
			expect(llamaPreset.bannedTokens).toContain("I must emphasize");
		});

		it("should have patterns", () => {
			expect(llamaPreset.patterns.length).toBeGreaterThan(0);
		});

		it("should have P0 AI identity disclaimer patterns", () => {
			const p0Patterns = llamaPreset.patterns.filter((p) => p.priority === "p0");
			expect(p0Patterns.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe("pattern transformation", () => {
		it("should remove As an AI language model,", () => {
			const { text } = applySmellPatterns(
				"As an AI language model, I can help you.",
				llamaPreset.patterns,
			);
			expect(text).not.toContain("As an AI language model,");
		});

		it("should remove As a large language model,", () => {
			const { text } = applySmellPatterns(
				"As a large language model, I understand.",
				llamaPreset.patterns,
			);
			expect(text).not.toContain("As a large language model,");
		});

		it("should remove I don't have personal experiences", () => {
			const { text } = applySmellPatterns(
				"I don't have personal experiences or opinions.",
				llamaPreset.patterns,
			);
			expect(text).not.toContain("I don't have personal experiences");
		});

		it("should remove I cannot provide medical/legal advice", () => {
			const { text } = applySmellPatterns(
				"I cannot provide medical/legal advice for your situation.",
				llamaPreset.patterns,
			);
			expect(text).not.toContain("I cannot provide medical/legal advice");
		});

		it("should remove Please note that", () => {
			const { text } = applySmellPatterns(
				"Please note that this is not professional advice.",
				llamaPreset.patterns,
			);
			expect(text).not.toContain("Please note that");
		});

		it("should remove I must emphasize that", () => {
			const { text } = applySmellPatterns(
				"I must emphasize that safety is paramount.",
				llamaPreset.patterns,
			);
			expect(text).not.toContain("I must emphasize that");
		});

		it("should remove It's crucial to", () => {
			const { text } = applySmellPatterns(
				"It's crucial to follow the guidelines carefully.",
				llamaPreset.patterns,
			);
			expect(text).not.toContain("It's crucial to");
		});
	});

	describe("detect", () => {
		it("should return high confidence for text with multiple Llama banned tokens", () => {
			const llamaText =
				"As an AI language model, I must emphasize that I don't have personal experiences and I cannot provide medical advice.";
			const confidence = llamaPreset.detect?.(llamaText);
			expect(confidence).toBeGreaterThan(0.5);
		});

		it("should return moderate confidence for text with one banned token", () => {
			const text = "As an AI language model, I will try to help.";
			const confidence = llamaPreset.detect?.(text);
			expect(confidence).toBeGreaterThan(0.3);
		});

		it("should return positive confidence for AI phrase pattern", () => {
			const text = "As an AI assistant, I can answer that.";
			const confidence = llamaPreset.detect?.(text);
			expect(confidence).toBeGreaterThan(0);
		});

		it("should return zero confidence for clean text", () => {
			const cleanText = "The sun rises in the east and sets in the west.";
			const confidence = llamaPreset.detect?.(cleanText);
			expect(confidence).toBe(0);
		});

		it("should return zero confidence for empty string", () => {
			expect(llamaPreset.detect?.("")).toBe(0);
		});
	});
});
