import { describe, expect, it } from "vitest";
import {
	analyzeSentenceVariance,
	analyzeTextQuality,
	detectBannedTokens,
	detectPunctuationIssues,
	fixPunctuationIssues,
} from "../../src/core/analyzer";
import {
	AI_SMELL_KO,
	BANNED_TOKENS_MIXED,
	CLEAN_HTML,
	HIGH_VARIANCE,
	LOW_VARIANCE,
	PUNCTUATION_ISSUES,
} from "../fixtures/samples";

describe("core/analyzer", () => {
	describe("detectBannedTokens", () => {
		it("should detect English banned tokens", () => {
			// BANNED_TOKENS_MIXED contains: holistic, pivotal, multifaceted, harness, meticulous, foster, deep dive, dive into
			const result = detectBannedTokens(BANNED_TOKENS_MIXED);
			expect(result.passed).toBe(false);
			expect(result.found).toContain("holistic");
			expect(result.found).toContain("pivotal");
			expect(result.found).toContain("multifaceted");
			expect(result.found).toContain("harness");
			expect(result.found).toContain("meticulous");
			expect(result.found).toContain("foster");
			expect(result.found).toContain("deep dive");
		});

		it("should detect Korean banned tokens", () => {
			// BANNED_TOKENS_MIXED contains: 획기적인, 필수불가결, 다각적으로, 알아보겠습니다, 에 대해 알아보았습니다, 마무리하겠습니다
			const result = detectBannedTokens(BANNED_TOKENS_MIXED);
			expect(result.found).toContain("획기적인");
			expect(result.found).toContain("필수불가결");
			expect(result.found).toContain("다각적으로");
			expect(result.found).toContain("알아보겠습니다");
			expect(result.found).toContain("에 대해 알아보았습니다");
			expect(result.found).toContain("마무리하겠습니다");
		});

		it("should return empty for clean content", () => {
			const result = detectBannedTokens(CLEAN_HTML);
			expect(result.count).toBe(0);
			expect(result.found).toHaveLength(0);
			expect(result.passed).toBe(true);
		});

		it("should be case-insensitive for English tokens", () => {
			const text = "DELVE into Holistic approaches seamlessly.";
			const result = detectBannedTokens(text);
			expect(result.found).toContain("delve");
			expect(result.found).toContain("holistic");
			expect(result.found).toContain("seamless");
			expect(result.passed).toBe(false);
		});
	});

	describe("analyzeSentenceVariance", () => {
		it("should detect low variance (uniform sentence lengths)", () => {
			// LOW_VARIANCE: all ~3 word sentences → stdDev < 2.5
			const result = analyzeSentenceVariance(LOW_VARIANCE);
			expect(result.meetsThreshold).toBe(false);
			expect(result.stdDev).toBeLessThan(2.5);
			expect(result.sentenceCount).toBeGreaterThan(0);
		});

		it("should pass for high variance content", () => {
			// HIGH_VARIANCE: mixed lengths → stdDev >= 2.5
			const result = analyzeSentenceVariance(HIGH_VARIANCE);
			expect(result.meetsThreshold).toBe(true);
			expect(result.stdDev).toBeGreaterThanOrEqual(2.5);
		});

		it("should handle empty input", () => {
			const result = analyzeSentenceVariance("");
			expect(result.stdDev).toBe(0);
			expect(result.sentenceCount).toBe(0);
			expect(result.meetsThreshold).toBe(false);
		});

		it("should handle single sentence", () => {
			const result = analyzeSentenceVariance("This is one sentence only.");
			expect(result.stdDev).toBe(0);
			expect(result.sentenceCount).toBe(1);
			expect(result.meetsThreshold).toBe(false);
		});

		it("should respect a custom variance threshold", () => {
			const result = analyzeSentenceVariance(HIGH_VARIANCE, 10);
			expect(result.stdDev).toBeLessThan(10);
			expect(result.meetsThreshold).toBe(false);
		});
	});

	describe("detectPunctuationIssues", () => {
		it("should detect orphaned comma after period", () => {
			const result = detectPunctuationIssues("bad. , This");
			expect(result).toHaveLength(1);
			expect(result[0].pattern).toBe(". ,");
			expect(result[0].description).toBe("orphaned comma after period");
		});

		it("should detect double commas", () => {
			// "comma,, appears" and "there,, too" → 2 issues
			const result = detectPunctuationIssues("comma,, appears here and there,, too.");
			expect(result.length).toBe(2);
			expect(result[0].pattern).toBe(",,");
		});

		it("should detect double periods", () => {
			const result = detectPunctuationIssues("period. . Like");
			expect(result).toHaveLength(1);
			expect(result[0].pattern).toBe(". .");
		});

		it("should return empty for clean text", () => {
			const result = detectPunctuationIssues("This is clean text. No issues here.");
			expect(result).toHaveLength(0);
		});
	});

	describe("fixPunctuationIssues", () => {
		it("should fix orphaned comma after period", () => {
			const result = fixPunctuationIssues("Text. , Continue");
			expect(result).toBe("Text. Continue");
		});

		it("should fix double commas", () => {
			const result = fixPunctuationIssues("Word,, again");
			expect(result).toBe("Word, again");
		});

		it("should fix double periods", () => {
			const result = fixPunctuationIssues("Sentence. . Next");
			expect(result).toBe("Sentence. Next");
		});

		it("should fix multiple issues in one pass", () => {
			const result = fixPunctuationIssues(PUNCTUATION_ISSUES);
			expect(result).not.toContain(". ,");
			expect(result).not.toContain(",,");
			expect(result).not.toContain(". .");
			expect(result).not.toContain(", .");
			expect(result).not.toContain("? ,");
		});
	});

	describe("analyzeTextQuality (integration)", () => {
		it("should produce comprehensive report for clean content", () => {
			const result = analyzeTextQuality(CLEAN_HTML);
			expect(result.bannedTokens.passed).toBe(true);
			expect(result.bannedTokens.count).toBe(0);
			expect(result.punctuationIssues).toHaveLength(0);
		});

		it("should flag AI smell content", () => {
			const result = analyzeTextQuality(AI_SMELL_KO);
			expect(result.bannedTokens.passed).toBe(false);
			expect(result.bannedTokens.count).toBeGreaterThan(0);
			expect(result.passed).toBe(false);
		});

		it("should handle empty input gracefully", () => {
			const result = analyzeTextQuality("");
			expect(result.bannedTokens.count).toBe(0);
			expect(result.sentenceVariance.sentenceCount).toBe(0);
			expect(result.punctuationIssues).toHaveLength(0);
		});

		it("should pass through a custom sentence variance threshold", () => {
			const result = analyzeTextQuality(HIGH_VARIANCE, 10);
			expect(result.sentenceVariance.meetsThreshold).toBe(false);
			expect(result.passed).toBe(false);
		});
	});
});
