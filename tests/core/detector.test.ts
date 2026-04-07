import { describe, expect, it } from "vitest";
import {
	checkForDownsides,
	detectDuplicateContent,
	detectKoreanInEnglish,
	detectOrphanedParticles,
	detectPhantomReferences,
	validateMdxSyntax,
} from "../../src/core/detector";
import { enLocale } from "../../src/locales/en";
import { koLocale } from "../../src/locales/ko";
import { DUPLICATE_CONTENT, ORPHANED_PARTICLES } from "../fixtures/samples";

describe("core/detector", () => {
	describe("detectPhantomReferences (Korean)", () => {
		it("should detect '제 영상에서'", () => {
			const result = detectPhantomReferences(
				"제 영상에서 보셨듯이 이 방법이 최고입니다.",
				koLocale,
			);
			expect(result.passed).toBe(false);
			expect(result.count).toBeGreaterThan(0);
			expect(result.found.some((f) => f.includes("제 영상에서"))).toBe(true);
		});

		it("should detect '이전 글에서'", () => {
			const result = detectPhantomReferences(
				"이전 글에서 말씀드린 대로 진행하면 됩니다.",
				koLocale,
			);
			expect(result.passed).toBe(false);
			expect(result.found.some((f) => f.includes("이전 글에서"))).toBe(true);
		});

		it("should detect '저번에 말씀드린'", () => {
			const result = detectPhantomReferences("저번에 말씀드린 내용을 참고하세요.", koLocale);
			expect(result.passed).toBe(false);
			expect(result.found.some((f) => f.includes("저번에 말씀드린"))).toBe(true);
		});

		it("should detect '제 채널에서'", () => {
			const result = detectPhantomReferences("제 채널에서 확인하실 수 있습니다.", koLocale);
			expect(result.passed).toBe(false);
			expect(result.found.some((f) => f.includes("제 채널에서"))).toBe(true);
		});

		it("should pass for content with no phantom references", () => {
			const result = detectPhantomReferences("새로운 내용입니다", koLocale);
			expect(result.passed).toBe(true);
			expect(result.count).toBe(0);
		});
	});

	describe("detectPhantomReferences (English)", () => {
		it("should detect 'As I mentioned before'", () => {
			const result = detectPhantomReferences("As I mentioned before, this is important.", enLocale);
			expect(result.passed).toBe(false);
			expect(result.count).toBeGreaterThan(0);
		});

		it("should detect 'In my previous video'", () => {
			const result = detectPhantomReferences(
				"In my previous video, we covered this topic.",
				enLocale,
			);
			expect(result.passed).toBe(false);
			expect(result.count).toBeGreaterThan(0);
		});

		it("should detect 'on my channel'", () => {
			const result = detectPhantomReferences("On my channel, I explain this in detail.", enLocale);
			expect(result.passed).toBe(false);
			expect(result.count).toBeGreaterThan(0);
		});

		it("should pass for content with no phantom references", () => {
			const result = detectPhantomReferences("This is completely new content", enLocale);
			expect(result.passed).toBe(true);
			expect(result.count).toBe(0);
		});

		it("should count repeated phantom references", () => {
			const result = detectPhantomReferences(
				"As I mentioned before, this matters. As I mentioned before, on my channel I explain more.",
				enLocale,
			);
			expect(result.count).toBe(3);
			expect(result.found.filter((match) => /As I mentioned before/i.test(match))).toHaveLength(2);
			expect(result.found.some((match) => /my channel/i.test(match))).toBe(true);
		});
	});

	describe("detectDuplicateContent", () => {
		it("should detect duplicate headings", () => {
			const issues = detectDuplicateContent(DUPLICATE_CONTENT);
			const headingIssue = issues.find((i) => i.type === "duplicate-heading");
			expect(headingIssue).toBeDefined();
			expect(headingIssue?.value).toBe("Best Practices");
		});

		it("should detect duplicate sources sections", () => {
			const issues = detectDuplicateContent(DUPLICATE_CONTENT);
			const sourcesIssue = issues.find((i) => i.type === "duplicate-sources");
			expect(sourcesIssue).toBeDefined();
		});

		it("should return empty for unique content", () => {
			const issues = detectDuplicateContent(
				"<h2>Intro</h2><p>Content</p><h2>Conclusion</h2><p>End</p>",
			);
			expect(issues).toHaveLength(0);
		});
	});

	describe("detectKoreanInEnglish", () => {
		it("should pass for pure English", () => {
			const result = detectKoreanInEnglish("English only content here.");
			expect(result.passed).toBe(true);
			expect(result.koreanCharCount).toBe(0);
		});

		it("should pass for minor Korean (< 20 chars)", () => {
			// "김치" = 2 Korean chars → passed: true
			const result = detectKoreanInEnglish("This mentions 김치 as a food.");
			expect(result.passed).toBe(true);
			expect(result.koreanCharCount).toBeLessThan(20);
		});

		it("should fail for heavy Korean mixing", () => {
			const koreanText =
				"이것은 한국어로 작성된 긴 텍스트입니다 많은 한국어 문자가 포함되어 있습니다";
			const result = detectKoreanInEnglish(koreanText);
			expect(result.passed).toBe(false);
			expect(result.koreanCharCount).toBeGreaterThanOrEqual(20);
		});

		it("should handle empty string", () => {
			const result = detectKoreanInEnglish("");
			expect(result.passed).toBe(true);
			expect(result.koreanCharCount).toBe(0);
		});
	});

	describe("detectOrphanedParticles", () => {
		it("should detect '은 의' pattern", () => {
			const result = detectOrphanedParticles(ORPHANED_PARTICLES, koLocale.particleRules ?? []);
			expect(result.passed).toBe(false);
			expect(result.count).toBeGreaterThan(0);
		});

		it("should pass for normal Korean", () => {
			const result = detectOrphanedParticles(
				"정상적인 한국어 문장입니다.",
				koLocale.particleRules ?? [],
			);
			expect(result.passed).toBe(true);
			expect(result.count).toBe(0);
		});

		it("should handle empty string", () => {
			const result = detectOrphanedParticles("", koLocale.particleRules ?? []);
			expect(result.passed).toBe(true);
			expect(result.count).toBe(0);
		});

		it("should keep backward-compatible default behavior with no rules", () => {
			const result = detectOrphanedParticles(ORPHANED_PARTICLES);
			expect(result.passed).toBe(true);
			expect(result.count).toBe(0);
		});
	});

	describe("checkForDownsides (Korean)", () => {
		it("should detect '단점'", () => {
			const result = checkForDownsides("단점도 있습니다", koLocale);
			expect(result.hasDownside).toBe(true);
			expect(result.passed).toBe(true);
		});

		it("should detect '불편한 점'", () => {
			const result = checkForDownsides("불편한 점이 있습니다", koLocale);
			expect(result.hasDownside).toBe(true);
		});

		it("should fail for purely positive content", () => {
			const result = checkForDownsides("정말 좋습니다", koLocale);
			expect(result.hasDownside).toBe(false);
			expect(result.passed).toBe(false);
		});
	});

	describe("checkForDownsides (English)", () => {
		it("should detect 'drawback'", () => {
			const result = checkForDownsides("The main drawback is the price.", enLocale);
			expect(result.hasDownside).toBe(true);
		});

		it("should detect 'could be better'", () => {
			const result = checkForDownsides("The experience could be better.", enLocale);
			expect(result.hasDownside).toBe(true);
		});

		it("should fail for purely positive content", () => {
			const result = checkForDownsides("Everything is perfect and wonderful.", enLocale);
			expect(result.hasDownside).toBe(false);
		});

		it("should count repeated downside markers", () => {
			const result = checkForDownsides(
				"The drawback is price, and another drawback is availability.",
				enLocale,
			);
			expect(result.found.filter((match) => /drawback/i.test(match))).toHaveLength(2);
			expect(result.passed).toBe(true);
		});
	});

	describe("validateMdxSyntax", () => {
		it("should pass for balanced code blocks", () => {
			const result = validateMdxSyntax("```js\ncode\n```");
			expect(result.codeBlocksBalanced).toBe(true);
			expect(result.passed).toBe(true);
			expect(result.issues).toHaveLength(0);
		});

		it("should fail for unbalanced code blocks", () => {
			const result = validateMdxSyntax("```js\ncode\n");
			expect(result.codeBlocksBalanced).toBe(false);
			expect(result.passed).toBe(false);
			expect(result.issues.length).toBeGreaterThan(0);
		});

		it("should warn about curly braces outside code", () => {
			const result = validateMdxSyntax("{variable} and {another} outside code blocks");
			expect(result.issues.length).toBeGreaterThan(0);
			expect(result.passed).toBe(false);
		});
	});
});
