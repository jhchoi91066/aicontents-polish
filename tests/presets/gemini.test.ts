import { describe, expect, it } from "vitest";
import { applySmellPatterns } from "../../src/core/fixer";
import { geminiPreset } from "../../src/presets/gemini";

describe("presets/gemini", () => {
	describe("patterns", () => {
		it("should contain 47+ AI smell patterns", () => {
			expect(geminiPreset.patterns.length).toBeGreaterThanOrEqual(47);
		});

		it("should include P0 conclusion intro patterns (10 from original)", () => {
			const p0Patterns = geminiPreset.patterns.filter((p) => p.priority === "p0");
			expect(p0Patterns.length).toBeGreaterThanOrEqual(10);
		});

		it("should remove 결론부터 말씀드리면 (with optional comma/trailing space)", () => {
			const { text: t1 } = applySmellPatterns(
				"결론부터 말씀드리면, 이 방법이 좋습니다.",
				geminiPreset.patterns,
			);
			expect(t1).not.toMatch(/결론부터 말씀드리면/);

			const { text: t2 } = applySmellPatterns(
				"결론부터 말씀드리면 이 방법이 좋습니다.",
				geminiPreset.patterns,
			);
			expect(t2).not.toMatch(/결론부터 말씀드리면/);
		});

		it("should remove 결론부터 말하자면", () => {
			const { text } = applySmellPatterns("결론부터 말하자면, 좋습니다.", geminiPreset.patterns);
			expect(text).not.toMatch(/결론부터 말하자면/);
		});

		it("should remove 핵심부터 말씀드리면", () => {
			const { text } = applySmellPatterns("핵심부터 말씀드리면 이렇습니다.", geminiPreset.patterns);
			expect(text).not.toMatch(/핵심부터 말씀드리면/);
		});

		it("should remove 결론부터 공유하자면", () => {
			const { text } = applySmellPatterns("결론부터 공유하자면 좋아요.", geminiPreset.patterns);
			expect(text).not.toMatch(/결론부터 공유하자면/);
		});

		it("should include P1 exaggeration patterns", () => {
			const { text } = applySmellPatterns(
				"정말 최고의 선택이었어요, 이 제품은.",
				geminiPreset.patterns,
			);
			expect(text).toContain("좋은 선택이었어요");
			expect(text).not.toContain("정말 최고의 선택이었어요");
		});

		it("should transform 정말 특별했어요 to 인상적이었어요", () => {
			const { text } = applySmellPatterns("여행이 정말 특별했어요.", geminiPreset.patterns);
			expect(text).toContain("인상적이었어요");
			expect(text).not.toContain("정말 특별했어요");
		});

		it("should transform 대성공이었죠 to 잘 됐어요", () => {
			const { text } = applySmellPatterns("프로젝트가 대성공이었죠.", geminiPreset.patterns);
			expect(text).toContain("잘 됐어요");
		});

		it("should remove 기대해 주세요", () => {
			const { text } = applySmellPatterns("많은 기대해 주세요!", geminiPreset.patterns);
			expect(text).not.toContain("기대해 주세요");
		});

		it("should include P1 meta-narrative patterns", () => {
			const { text } = applySmellPatterns(
				"이번 글에서는 여행 팁을 정리해 드릴게요.",
				geminiPreset.patterns,
			);
			expect(text).not.toContain("이번 글에서는");
			expect(text).not.toContain("정리해 드릴게요");
		});

		it("should transform 이번 포스팅에서는 to empty string", () => {
			const { text } = applySmellPatterns(
				"이번 포스팅에서는 최고의 여행지를 소개해 드릴게요.",
				geminiPreset.patterns,
			);
			expect(text).not.toContain("이번 포스팅에서는");
		});

		it("should transform 알려드릴게요 to 알려줄게요", () => {
			const { text } = applySmellPatterns("방법을 알려드릴게요.", geminiPreset.patterns);
			expect(text).toContain("알려줄게요");
		});

		it("should remove 알아보겠습니다", () => {
			const { text } = applySmellPatterns("함께 알아보겠습니다.", geminiPreset.patterns);
			expect(text).not.toContain("알아보겠습니다");
		});

		it("should include fake authority patterns — IT 직장인으로서 with optional space", () => {
			const { text: t1 } = applySmellPatterns(
				"IT직장인으로서 이 도구를 추천합니다.",
				geminiPreset.patterns,
			);
			expect(t1).not.toMatch(/IT ?직장인으로서/);

			const { text: t2 } = applySmellPatterns(
				"IT 직장인으로서 이 도구를 추천합니다.",
				geminiPreset.patterns,
			);
			expect(t2).not.toMatch(/IT ?직장인으로서/);
		});

		it("should remove 개발자로서", () => {
			const { text } = applySmellPatterns("개발자로서 말씀드리면,", geminiPreset.patterns);
			expect(text).not.toContain("개발자로서");
		});

		it("should remove 전문가로서", () => {
			const { text } = applySmellPatterns("전문가로서 추천드립니다.", geminiPreset.patterns);
			expect(text).not.toContain("전문가로서");
		});

		it("should remove 정리 수납 전문가로서 (with optional spaces)", () => {
			const { text } = applySmellPatterns(
				"정리 수납 전문가로서 말씀드립니다.",
				geminiPreset.patterns,
			);
			expect(text).not.toMatch(/정리 ?수납 ?전문가로서/);
		});

		it("should transform 3년 전 to 예전에 (with optional space)", () => {
			const { text: t1 } = applySmellPatterns(
				"3년 전 방문했을 때도 좋았어요.",
				geminiPreset.patterns,
			);
			expect(t1).toContain("예전에");

			const { text: t2 } = applySmellPatterns(
				"3년전 방문했을 때도 좋았어요.",
				geminiPreset.patterns,
			);
			expect(t2).toContain("예전에");
		});

		it("should transform 수년간 to 오랫동안", () => {
			const { text } = applySmellPatterns("수년간 사용한 결과,", geminiPreset.patterns);
			expect(text).toContain("오랫동안");
		});

		it("should remove 제 경험상 (with optional space)", () => {
			const { text } = applySmellPatterns("제 경험상 이게 최선이에요.", geminiPreset.patterns);
			expect(text).not.toMatch(/제 ?경험상/);
		});

		it("should transform 솔직히 말씀드리면 to 솔직히 (with optional space)", () => {
			const { text } = applySmellPatterns("솔직히 말씀드리면 힘들었어요.", geminiPreset.patterns);
			expect(text).toContain("솔직히");
			expect(text).not.toMatch(/솔직히 ?말씀드리면/);
		});

		it("should include hedging patterns for unverified stats — 90% 이상의 여행자가 만족", () => {
			const { text } = applySmellPatterns(
				"90% 이상의 여행자가 만족했다고 합니다.",
				geminiPreset.patterns,
			);
			expect(text).toContain("많은 여행자들이 만족하는 편");
			expect(text).not.toContain("90% 이상의 여행자가 만족");
		});

		it("should transform 95% 이상의 to 대부분의", () => {
			const { text } = applySmellPatterns(
				"95% 이상의 사용자가 만족했습니다.",
				geminiPreset.patterns,
			);
			expect(text).toContain("대부분의");
		});

		it("should transform N% 이상의 (여행자|이용자|고객) using regex backreference", () => {
			const { text } = applySmellPatterns(
				"70% 이상의 이용자가 추천했습니다.",
				geminiPreset.patterns,
			);
			expect(text).toContain("많은 이용자들이");
		});

		it("should transform 100% 환불 보장 to softer phrasing", () => {
			const { text } = applySmellPatterns("100% 환불 보장 서비스입니다.", geminiPreset.patterns);
			expect(text).toContain("환불이 지원되는 경우가 많습니다");
		});

		it("should transform 100% 만족 to 높은 만족도", () => {
			const { text } = applySmellPatterns("100% 만족 보장합니다.", geminiPreset.patterns);
			expect(text).toContain("높은 만족도");
		});

		it("should transform 무조건 추천 to 추천드리는 편", () => {
			const { text } = applySmellPatterns("무조건 추천 드립니다.", geminiPreset.patterns);
			expect(text).toContain("추천드리는 편");
		});

		it("should transform N만 명 이상이 이용 using regex", () => {
			const { text } = applySmellPatterns("100만 명 이상이 이용했습니다.", geminiPreset.patterns);
			expect(text).toContain("많은 분들이 이용");
		});

		it("should transform 평점 N.N점 to 평점이 높은 편", () => {
			const { text } = applySmellPatterns("평점 4.8점으로 높습니다.", geminiPreset.patterns);
			expect(text).toContain("평점이 높은 편");
		});

		it("should transform 평균 N.N점 to 평점이 좋은 편", () => {
			const { text } = applySmellPatterns("평균 4.5점을 기록했습니다.", geminiPreset.patterns);
			expect(text).toContain("평점이 좋은 편");
		});

		it("should transform 반드시 보장 to softer phrasing", () => {
			const { text } = applySmellPatterns("반드시 보장됩니다.", geminiPreset.patterns);
			expect(text).toContain("보장되는 경우가 많음");
		});

		it("should have banned tokens as empty array", () => {
			expect(geminiPreset.bannedTokens).toEqual([]);
		});
	});

	describe("detect (auto mode)", () => {
		it("should return high confidence for Gemini-generated Korean text", () => {
			const geminiText =
				"결론부터 말씀드리면, 이번 글에서는 최고의 선택을 알려드릴게요. IT직장인으로서 제 경험상 무조건 추천합니다.";
			const confidence = geminiPreset.detect?.(geminiText);
			expect(confidence).toBeGreaterThan(0.5);
		});

		it("should return high confidence when multiple Gemini signals present", () => {
			const text =
				"결론부터 말하자면 좋습니다. 핵심부터 말씀드리면 95% 이상의 사용자가 만족했고, 100% 보장됩니다.";
			const confidence = geminiPreset.detect?.(text);
			expect(confidence).toBeGreaterThan(0.4);
		});

		it("should return low confidence for clean text", () => {
			const cleanText = "This is a clean English sentence with no AI smell patterns.";
			const confidence = geminiPreset.detect?.(cleanText);
			expect(confidence).toBeLessThan(0.2);
		});

		it("should return zero confidence for empty string", () => {
			const confidence = geminiPreset.detect?.("");
			expect(confidence).toBe(0);
		});

		it("should return positive confidence for text with single Gemini token", () => {
			const text = "결론부터 말씀드리면 이 방법이 좋습니다.";
			const confidence = geminiPreset.detect?.(text);
			expect(confidence).toBeGreaterThan(0);
		});
	});
});
