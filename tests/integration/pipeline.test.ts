import { describe, expect, it } from "vitest";
import { createPolisher } from "../../src/core/polisher";
import { definePreset } from "../../src/presets/types";
import { AI_SMELL_EN, AI_SMELL_KO, CLEAN_HTML } from "../fixtures/samples";

describe("createPolisher (E2E)", () => {
	describe("process", () => {
		it("should clean AI smell from Korean content", () => {
			const polisher = createPolisher({ preset: "gemini", locale: "ko" });
			const result = polisher.process(AI_SMELL_KO);

			expect(result.html).toBeDefined();
			expect(typeof result.html).toBe("string");
			expect(result.report).toBeDefined();
		});

		it("should clean AI smell from English content", () => {
			const polisher = createPolisher({ preset: "gpt", locale: "en" });
			const result = polisher.process(AI_SMELL_EN);

			expect(result.html).toBeDefined();
			expect(typeof result.html).toBe("string");
			expect(result.report).toBeDefined();
		});

		it("should not modify clean content significantly", () => {
			const polisher = createPolisher({ preset: "gemini", locale: "ko" });
			const result = polisher.process(CLEAN_HTML);

			expect(result.html).toBeDefined();
			expect(result.report.fixes.length).toBeGreaterThanOrEqual(0);
		});

		it("should return score 0-100", () => {
			const polisher = createPolisher({ preset: "gemini", locale: "ko" });
			const result = polisher.process(AI_SMELL_KO);

			expect(result.report.score).toBeGreaterThanOrEqual(0);
			expect(result.report.score).toBeLessThanOrEqual(100);
		});
	});

	describe("analyze (read-only)", () => {
		it("should return analysis without modifying content", () => {
			const polisher = createPolisher({ preset: "gemini", locale: "ko" });
			const report = polisher.analyze(AI_SMELL_KO);

			expect(report.issues).toBeDefined();
			expect(Array.isArray(report.issues)).toBe(true);
			expect(report.score).toBeGreaterThanOrEqual(0);
			expect(report.score).toBeLessThanOrEqual(100);
			expect(report.metrics).toBeDefined();
			expect(typeof report.metrics.bannedTokenCount).toBe("number");
			expect(typeof report.metrics.sentenceVariance).toBe("number");
			expect(typeof report.metrics.phantomRefCount).toBe("number");
		});

		it("should detect phantom references in Korean content", () => {
			const polisher = createPolisher({ preset: "gemini", locale: "ko" });
			const report = polisher.analyze(AI_SMELL_KO);

			const phantomIssues = report.issues.filter((i) => i.rule === "phantom-reference");
			expect(phantomIssues.length).toBeGreaterThan(0);
		});
	});

	describe("preset composition", () => {
		it("should merge multiple presets", () => {
			const polisher = createPolisher({ preset: ["gemini", "gpt"], locale: "ko" });
			const result = polisher.process(AI_SMELL_KO);

			expect(result.html).toBeDefined();
			expect(result.report).toBeDefined();
		});

		it("should merge bannedTokens from multiple presets", () => {
			const presetA = definePreset({
				name: "a",
				bannedTokens: ["tokenA"],
				patterns: [],
			});
			const presetB = definePreset({
				name: "b",
				bannedTokens: ["tokenB"],
				patterns: [],
			});

			const polisher = createPolisher({ preset: [presetA, presetB], locale: "en" });
			const report = polisher.analyze("<p>tokenA tokenB</p>");

			const bannedIssues = report.issues.filter((i) => i.rule === "banned-token");
			const foundMessages = bannedIssues.map((i) => i.message);
			expect(foundMessages.some((m) => m.includes("tokenA"))).toBe(true);
			expect(foundMessages.some((m) => m.includes("tokenB"))).toBe(true);
		});
	});

	describe("custom preset", () => {
		it("should accept user-defined patterns", () => {
			const customPreset = definePreset({
				name: "custom",
				bannedTokens: ["synergize"],
				patterns: [
					{
						match: /synergize/gi,
						replace: "",
						description: "remove synergize",
					},
				],
			});

			const polisher = createPolisher({ preset: customPreset, locale: "en" });
			const result = polisher.process("<p>Let's synergize our efforts.</p>");

			expect(result.html).not.toMatch(/synergize/i);
		});

		it("should detect custom banned tokens in analyze", () => {
			const customPreset = definePreset({
				name: "custom",
				bannedTokens: ["synergize"],
				patterns: [],
			});

			const polisher = createPolisher({ preset: customPreset, locale: "en" });
			const report = polisher.analyze("<p>Let's synergize our efforts.</p>");

			const bannedIssues = report.issues.filter((i) => i.rule === "banned-token");
			expect(bannedIssues.some((i) => i.message.includes("synergize"))).toBe(true);
		});
	});

	describe("auto detection", () => {
		it("should auto-detect Korean locale from text patterns", () => {
			const polisher = createPolisher({ preset: "gemini", locale: "auto" });
			const result = polisher.process(AI_SMELL_KO);

			expect(result.html).toBeDefined();
			expect(result.report).toBeDefined();
		});

		it("should auto-detect LLM preset from text patterns", () => {
			const polisher = createPolisher({ preset: "auto", locale: "auto" });
			const result = polisher.process(AI_SMELL_KO);

			expect(result.html).toBeDefined();
			expect(result.report).toBeDefined();
		});

		it("should fall back to en locale for English content", () => {
			const polisher = createPolisher({ preset: "gpt", locale: "auto" });
			const result = polisher.process(AI_SMELL_EN);

			expect(result.html).toBeDefined();
		});
	});

	describe("rules override", () => {
		it("should respect disabled emojiRemoval rule", () => {
			const htmlWithEmoji = "<p>Hello 🎉 World 🚀 Check 😊 this</p>";
			const polisher = createPolisher({
				preset: "gemini",
				locale: "en",
				rules: { disable: ["emojiRemoval"] },
			});
			const result = polisher.process(htmlWithEmoji);

			expect(result.html).toMatch(/🎉/);
			expect(result.html).toMatch(/🚀/);
		});

		it("should remove emojis when emojiRemoval is NOT disabled", () => {
			const htmlWithEmoji = "<p>Hello 🎉 World 🚀 Check 😊 this out 🌟</p>";
			const polisher = createPolisher({ preset: "gemini", locale: "en" });
			const result = polisher.process(htmlWithEmoji);

			const emojiCount = (result.html.match(/[\u{1F300}-\u{1F9FF}]/gu) ?? []).length;
			expect(emojiCount).toBe(0);
		});

		it("should accept custom sentenceVariance threshold", () => {
			const polisher = createPolisher({
				preset: "gemini",
				locale: "en",
				rules: { sentenceVariance: { minStdDev: 3.0 } },
			});
			const report = polisher.analyze(AI_SMELL_EN);

			expect(report.score).toBeGreaterThanOrEqual(0);
			expect(report.score).toBeLessThanOrEqual(100);
		});

		it("should add extra banned tokens from rules", () => {
			const polisher = createPolisher({
				preset: "gemini",
				locale: "en",
				rules: { bannedTokens: { extra: ["customToken"] } },
			});
			const report = polisher.analyze("<p>This uses customToken in the text.</p>");

			const bannedIssues = report.issues.filter((i) => i.rule === "banned-token");
			expect(bannedIssues.some((i) => i.message.includes("customToken"))).toBe(true);
		});

		it("should skip headingHierarchy when disabled", () => {
			const htmlWithBadHierarchy = "<h1>Title</h1><h1>Second H1</h1><h3>Skipped H2</h3>";
			const polisher = createPolisher({
				preset: "gemini",
				locale: "en",
				rules: { disable: ["headingHierarchy"] },
			});
			const result = polisher.process(htmlWithBadHierarchy);

			expect(result.html).toContain("<h1>Second H1</h1>");
			expect(result.html).toContain("<h3>Skipped H2</h3>");
		});

		it("should skip humanize step when disabled", () => {
			const polisher = createPolisher({
				preset: "gemini",
				locale: "en",
				rules: { disable: ["humanize"] },
			});
			const result = polisher.process(CLEAN_HTML);

			expect(result.html).toBeDefined();
		});
	});

	describe("AnalysisReport shape", () => {
		it("should return all required fields", () => {
			const polisher = createPolisher({ preset: "gemini", locale: "ko" });
			const report = polisher.analyze(AI_SMELL_KO);

			expect(typeof report.score).toBe("number");
			expect(typeof report.passed).toBe("boolean");
			expect(Array.isArray(report.issues)).toBe(true);
			expect(Array.isArray(report.fixes)).toBe(true);
			expect(typeof report.metrics.sentenceVariance).toBe("number");
			expect(typeof report.metrics.bannedTokenCount).toBe("number");
			expect(typeof report.metrics.phantomRefCount).toBe("number");
			expect(typeof report.metrics.duplicateCount).toBe("number");
			expect(typeof report.metrics.structuralRatio).toBe("number");
		});
	});
});
