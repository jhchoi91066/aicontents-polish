import { describe, expect, it } from "vitest";
import { enLocale } from "../../src/locales/en";

describe("locales/en", () => {
	describe("hedging patterns", () => {
		it("should have the correct number of hedging patterns", () => {
			expect(enLocale.hedgingPatterns).toHaveLength(14);
		});

		it("should match conclusion filler patterns", () => {
			const conclusionPatterns = [
				"In conclusion,",
				"To summarize,",
				"All in all,",
				"In summary,",
				"Overall,",
			];
			for (const phrase of conclusionPatterns) {
				const pattern = enLocale.hedgingPatterns.find((p) => p.match === phrase);
				expect(pattern).toBeDefined();
				expect(pattern?.replace).toBe("");
			}
		});

		it("should match meta-commentary patterns", () => {
			const metaPatterns = [
				"It's important to note that",
				"It should be noted that",
				"Needless to say,",
			];
			for (const phrase of metaPatterns) {
				const pattern = enLocale.hedgingPatterns.find((p) => p.match === phrase);
				expect(pattern).toBeDefined();
				expect(pattern?.replace).toBe("");
			}
		});

		it("should match filler adverb patterns", () => {
			const fillerPatterns = [
				"Ultimately,",
				"Interestingly,",
				"By and large,",
				"At the end of the day,",
				"As a matter of fact,",
				"For what it's worth,",
			];
			for (const phrase of fillerPatterns) {
				const pattern = enLocale.hedgingPatterns.find((p) => p.match === phrase);
				expect(pattern).toBeDefined();
				expect(pattern?.replace).toBe("");
			}
		});
	});

	describe("detector rules", () => {
		it("should expose phantom reference patterns", () => {
			expect(enLocale.phantomReferencePatterns).toBeDefined();
			expect(enLocale.phantomReferencePatterns?.length).toBeGreaterThan(0);
		});

		it("should expose downside patterns", () => {
			expect(enLocale.downsidePatterns).toBeDefined();
			expect(enLocale.downsidePatterns?.length).toBeGreaterThan(0);
		});
	});

	describe("detect (auto mode)", () => {
		it("should return high confidence for English text", () => {
			const englishText = "Hello, this is a sample English text for testing purposes.";
			const confidence = enLocale.detect?.(englishText) ?? 0;
			expect(confidence).toBeGreaterThan(0.7);
		});

		it("should return low confidence for Korean text", () => {
			const koreanText = "안녕하세요. 오늘은 날씨가 매우 좋습니다. 한국어 텍스트입니다.";
			const confidence = enLocale.detect?.(koreanText) ?? 0;
			expect(confidence).toBe(0);
		});
	});
});
