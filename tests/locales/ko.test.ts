import { describe, expect, it } from "vitest";
import { koLocale } from "../../src/locales/ko";

describe("locales/ko", () => {
	describe("hedging patterns", () => {
		it("should have the correct number of hedging patterns", () => {
			expect(koLocale.hedgingPatterns).toHaveLength(22);
		});

		it("should match Korean hedging expressions", () => {
			const pattern = koLocale.hedgingPatterns.find((p) => p.match === "종합적으로 고려했을 때");
			expect(pattern).toBeDefined();
			expect(pattern?.replace).toBe("정리하면");
		});

		it("should match Korean filler patterns", () => {
			const fillerPatterns = ["기본적으로", "일반적으로", "전반적으로"];
			for (const filler of fillerPatterns) {
				const pattern = koLocale.hedgingPatterns.find((p) => p.match === filler);
				expect(pattern).toBeDefined();
				expect(pattern?.replace).toBe("");
			}
		});

		it("should match conclusion patterns", () => {
			const conclusionPatterns = ["결론적으로", "종합하면", "요약하자면"];
			for (const conclusion of conclusionPatterns) {
				const pattern = koLocale.hedgingPatterns.find((p) => p.match === conclusion);
				expect(pattern).toBeDefined();
				expect(pattern?.replace).toBe("");
			}
		});
	});

	describe("particle rules", () => {
		it("should have particle rules defined", () => {
			expect(koLocale.particleRules).toBeDefined();
			expect(koLocale.particleRules).toHaveLength(1);
		});

		it("should detect orphaned particles", () => {
			const rule = koLocale.particleRules?.[0];
			expect(rule).toBeDefined();
			expect(rule?.description).toBe("Orphaned Korean particles");
			// "은 의" is two consecutive particles with space between
			const match = "단어 은 의 다른단어".match(rule?.pattern);
			expect(match).not.toBeNull();
		});

		it("should pass for correct particle usage", () => {
			const rule = koLocale.particleRules?.[0];
			expect(rule).toBeDefined();
			// "단어의" — particle attached directly, no double-particle pattern
			const match = "단어의 뜻".match(rule?.pattern);
			expect(match).toBeNull();
		});
	});

	describe("detector rules", () => {
		it("should expose phantom reference patterns", () => {
			expect(koLocale.phantomReferencePatterns).toBeDefined();
			expect(koLocale.phantomReferencePatterns?.length).toBeGreaterThan(0);
		});

		it("should expose downside patterns", () => {
			expect(koLocale.downsidePatterns).toBeDefined();
			expect(koLocale.downsidePatterns?.length).toBeGreaterThan(0);
		});
	});

	describe("detect (auto mode)", () => {
		it("should return high confidence for Korean text", () => {
			const koreanText = "안녕하세요. 오늘은 날씨가 매우 좋습니다. 한국어 텍스트입니다.";
			const confidence = koLocale.detect?.(koreanText) ?? 0;
			expect(confidence).toBeGreaterThan(0.8);
		});

		it("should return low confidence for English text", () => {
			const englishText = "Hello, this is a sample English text for testing purposes.";
			const confidence = koLocale.detect?.(englishText) ?? 0;
			expect(confidence).toBeLessThan(0.1);
		});
	});
});
