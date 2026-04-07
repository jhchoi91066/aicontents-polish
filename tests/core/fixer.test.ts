import { describe, expect, it } from "vitest";
import {
	adjustHashtags,
	applyAllFixes,
	applySmellPatterns,
	containsKorean,
	fixExcessiveMarkdownBold,
	getKoreanRatio,
	removeEmojis,
} from "../../src/core/fixer";
import type { SmellPattern } from "../../src/types";
import { CLEAN_HTML } from "../fixtures/samples";

// ---------------------------------------------------------------------------
// Test patterns
// ---------------------------------------------------------------------------

const KO_PATTERNS: SmellPattern[] = [
	// P0: meta-opening (conclusion intro)
	{
		match: /결론부터 말씀드리면[,，、]?\s*/g,
		replace: "",
		priority: "p0",
		description: "ko-conclusion-intro",
	},
	// P0: meta-narrative
	{
		match: /이번 글에서는\s*/g,
		replace: "",
		priority: "p0",
		description: "ko-meta-narrative",
	},
	{
		match: /살펴보겠습니다/g,
		replace: "",
		priority: "p0",
		description: "ko-meta-verb",
	},
	// P1: exaggeration
	{
		match: /정말 최고의/g,
		replace: "좋은",
		priority: "p1",
		description: "ko-exaggeration",
	},
	// P1: fake authority
	{
		match: /IT직장인으로서\s*/g,
		replace: "",
		priority: "p1",
		description: "ko-fake-authority",
	},
	{
		match: /\d+년 동안/g,
		replace: "오랜 기간",
		priority: "p1",
		description: "ko-time-specificity",
	},
	// P1: hedging unverified statistics
	{
		match: /\d+%\s*이상의 여행자가 만족/g,
		replace: "많은 여행자들이 만족하는 편",
		priority: "p1",
		description: "ko-unverified-stat",
	},
	{
		match: /100%\s*환불 보장/g,
		replace: "환불이 지원되는 경우가 많습니다",
		priority: "p1",
		description: "ko-guarantee-claim",
	},
];

const EN_PATTERNS: SmellPattern[] = [
	// English AI buzzwords
	{
		match: /\bElevate\b/gi,
		replace: "improve",
		priority: "p1",
		description: "en-elevate",
	},
	{
		match: /\bDelve\b/gi,
		replace: "explore",
		priority: "p1",
		description: "en-delve",
	},
	{
		match: /\bGame-changer\b/gi,
		replace: "significant change",
		priority: "p1",
		description: "en-game-changer",
	},
	// English conclusion phrases (P0)
	{
		match: /In conclusion[,，]?\s*/gi,
		replace: "",
		priority: "p0",
		description: "en-conclusion",
	},
	{
		match: /All in all[,，]?\s*/gi,
		replace: "",
		priority: "p0",
		description: "en-all-in-all",
	},
	{
		match: /At the end of the day[,，]?\s*/gi,
		replace: "",
		priority: "p0",
		description: "en-end-of-day",
	},
];

// ---------------------------------------------------------------------------

describe("core/fixer", () => {
	describe("applySmellPatterns", () => {
		it("should remove P0 conclusion intro patterns (Korean)", () => {
			const input = "결론부터 말씀드리면, 서울 맛집 10곳 추천";
			const { text } = applySmellPatterns(input, KO_PATTERNS);
			expect(text).toBe("서울 맛집 10곳 추천");
		});

		it("should replace exaggeration patterns", () => {
			const input = "정말 최고의 선택이었어요";
			const { text } = applySmellPatterns(input, KO_PATTERNS);
			expect(text).toBe("좋은 선택이었어요");
		});

		it("should remove meta-narrative patterns", () => {
			const input = "이번 글에서는 서울의 맛집을 종합적으로 살펴보겠습니다.";
			const { text } = applySmellPatterns(input, KO_PATTERNS);
			expect(text).not.toContain("이번 글에서는");
			expect(text).not.toContain("살펴보겠습니다");
		});

		it("should neutralize fake authority patterns", () => {
			const input = "IT직장인으로서 3년 동안 다니면서 정리한 곳들입니다.";
			const { text } = applySmellPatterns(input, KO_PATTERNS);
			expect(text).not.toContain("IT직장인으로서");
			expect(text).toContain("오랜 기간");
		});

		it("should hedge unverified statistics", () => {
			const input1 = "90% 이상의 여행자가 만족하는 곳이에요.";
			const { text: text1 } = applySmellPatterns(input1, KO_PATTERNS);
			expect(text1).toContain("많은 여행자들이 만족하는 편");

			const input2 = "100% 환불 보장으로 안심하세요.";
			const { text: text2 } = applySmellPatterns(input2, KO_PATTERNS);
			expect(text2).toContain("환불이 지원되는 경우가 많습니다");
		});

		it("should remove English AI tokens", () => {
			const input = "Elevate your game with this game-changer. Let me Delve in.";
			const { text } = applySmellPatterns(input, EN_PATTERNS);
			expect(text).not.toMatch(/\bElevate\b/i);
			expect(text).not.toMatch(/\bDelve\b/i);
			expect(text).not.toMatch(/\bGame-changer\b/i);
			expect(text).toContain("improve");
			expect(text).toContain("explore");
			expect(text).toContain("significant change");
		});

		it("should remove English conclusion patterns", () => {
			const input = "In conclusion, all in all, at the end of the day, great coffee.";
			const { text } = applySmellPatterns(input, EN_PATTERNS);
			expect(text).not.toMatch(/In conclusion/i);
			expect(text).not.toMatch(/All in all/i);
			expect(text).not.toMatch(/At the end of the day/i);
		});

		it("should not modify clean content", () => {
			const { text, fixes } = applySmellPatterns(CLEAN_HTML, [...KO_PATTERNS, ...EN_PATTERNS]);
			expect(text).toBe(CLEAN_HTML);
			expect(fixes).toHaveLength(0);
		});

		it("should handle empty string", () => {
			const { text, fixes } = applySmellPatterns("", KO_PATTERNS);
			expect(text).toBe("");
			expect(fixes).toHaveLength(0);
		});
	});

	describe("removeEmojis", () => {
		it("should remove all emojis when frequency is 'none'", () => {
			const input = "Great tip 🎉🎨";
			const { text, removedCount } = removeEmojis(input, "none");
			expect(text).toBe("Great tip ");
			expect(removedCount).toBe(2);
		});

		it("should keep limited emojis when frequency is 'minimal'", () => {
			const input = "A🎉 B🎨 C🎯 D🎵";
			const { text, removedCount } = removeEmojis(input, "minimal");
			// Keep first 2 emojis only
			expect(text).toContain("🎉");
			expect(text).toContain("🎨");
			expect(text).not.toContain("🎯");
			expect(text).not.toContain("🎵");
			expect(removedCount).toBe(2);
		});

		it("should handle text without emojis", () => {
			const input = "No emojis here";
			const { text, removedCount } = removeEmojis(input, "none");
			expect(text).toBe("No emojis here");
			expect(removedCount).toBe(0);
		});

		it("should keep all emojis when frequency is 'heavy'", () => {
			const input = "🎉🎨🎯🎵🎶🎷🎸";
			const { text, removedCount } = removeEmojis(input, "heavy");
			expect(text).toBe(input);
			expect(removedCount).toBe(0);
		});

		it("should keep up to 5 emojis when frequency is 'moderate'", () => {
			const input = "A🎉 B🎨 C🎯 D🎵 E🎶 F🎷";
			const { text, removedCount } = removeEmojis(input, "moderate");
			const remaining = [...text.matchAll(/[\u{1F300}-\u{1F9FF}]/gu)];
			expect(remaining.length).toBeLessThanOrEqual(5);
			expect(removedCount).toBe(1);
		});
	});

	describe("adjustHashtags", () => {
		it("should trim excess hashtags from end", () => {
			const input = "Post content #tag1 #tag2 #tag3 #tag4 #tag5 #tag6 #tag7 #tag8";
			const { text, adjusted } = adjustHashtags(input, 0, 5);
			const remaining = text.match(/#[\w가-힣]+/g) ?? [];
			expect(remaining.length).toBe(5);
			expect(remaining[0]).toBe("#tag1");
			expect(remaining[4]).toBe("#tag5");
			expect(adjusted).toBe(true);
		});

		it("should not add hashtags when below minimum", () => {
			const input = "Post content #tag1";
			const { text, adjusted } = adjustHashtags(input, 3, 10);
			expect(text).toContain("#tag1");
			expect(adjusted).toBe(false);
		});

		it("should handle Korean and English hashtags", () => {
			const input = "여행 포스트 #travel #코리아 #가이드";
			const { text, adjusted } = adjustHashtags(input, 0, 5);
			expect(text).toContain("#travel");
			expect(text).toContain("#코리아");
			expect(text).toContain("#가이드");
			expect(adjusted).toBe(false);
		});

		it("should not modify when count equals max", () => {
			const input = "#tag1 #tag2 #tag3";
			const { text, adjusted } = adjustHashtags(input, 0, 3);
			expect(adjusted).toBe(false);
			expect(text).toBe(input);
		});
	});

	describe("fixExcessiveMarkdownBold", () => {
		it("should reduce bold density when excessive", () => {
			// 50 words, 4 bold phrases → threshold = floor(50/100) = 0, but max(1, 0) = 1
			// So only 1 bold should remain
			const words = Array.from({ length: 50 }, (_, i) => `word${i}`).join(" ");
			const input = `**bold1** ${words} **bold2** **bold3** **bold4**`;
			const { text, removedCount } = fixExcessiveMarkdownBold(input);
			const remaining = text.match(/\*\*[^*]+\*\*/g) ?? [];
			expect(remaining.length).toBe(1);
			expect(removedCount).toBe(3);
		});

		it("should preserve bold in FAQ sections (details tag uses different threshold)", () => {
			// Bold inside <details> is not counted toward density
			const detailsContent = "<details><summary>Q</summary><p>**answer bold** text</p></details>";
			const mainContent = "Main **important** text here.";
			const input = `${mainContent} ${detailsContent}`;
			const { text } = fixExcessiveMarkdownBold(input);
			// Bold in <details> should still be in output
			expect(text).toContain("**answer bold**");
		});

		it("should not change text with acceptable bold density", () => {
			// 200+ words, 2 bold → threshold = 2
			const words = Array.from({ length: 200 }, (_, i) => `word${i}`).join(" ");
			const input = `**bold1** ${words} **bold2**`;
			const { text, removedCount } = fixExcessiveMarkdownBold(input);
			expect(removedCount).toBe(0);
			expect(text).toBe(input);
		});
	});

	describe("containsKorean", () => {
		it("should return true for Korean text", () => {
			expect(containsKorean("한글 테스트")).toBe(true);
		});

		it("should return false for English text", () => {
			expect(containsKorean("English only")).toBe(false);
		});

		it("should return true for mixed text", () => {
			expect(containsKorean("Mixed 한글")).toBe(true);
		});

		it("should return false for empty string", () => {
			expect(containsKorean("")).toBe(false);
		});
	});

	describe("getKoreanRatio", () => {
		it("should return ~1.0 for pure Korean text", () => {
			const ratio = getKoreanRatio("한글테스트");
			expect(ratio).toBeCloseTo(1.0, 1);
		});

		it("should return 0 for English text", () => {
			expect(getKoreanRatio("English only")).toBe(0);
		});

		it("should return partial ratio for mixed text", () => {
			const ratio = getKoreanRatio("Mixed 한글");
			expect(ratio).toBeGreaterThan(0);
			expect(ratio).toBeLessThan(1);
		});

		it("should return 0 for empty string", () => {
			expect(getKoreanRatio("")).toBe(0);
		});
	});

	describe("applyAllFixes", () => {
		it("should apply patterns, remove emojis, and adjust hashtags in pipeline", () => {
			const input = "결론부터 말씀드리면, 좋은 곳 🎉🎨🎯 #tag1 #tag2 #tag3 #tag4 #tag5 #tag6";
			const { text, report } = applyAllFixes(input, {
				patterns: KO_PATTERNS,
				emojiFrequency: "none",
				hashtagLimits: { min: 0, max: 4 },
			});
			expect(text).not.toContain("결론부터 말씀드리면");
			expect(text).not.toContain("🎉");
			const remaining = text.match(/#[\w가-힣]+/g) ?? [];
			expect(remaining.length).toBeLessThanOrEqual(4);
			expect(report.emojisRemoved).toBe(3);
			expect(report.hashtagsAdjusted).toBe(true);
		});
	});
});
