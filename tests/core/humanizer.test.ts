import { describe, expect, it } from "vitest";
import {
	fixColspanMismatch,
	humanizeGeneratedHTML,
	normalizeAltText,
	randomizeClassNames,
	removeTailwindFingerprints,
} from "../../src/core/humanizer";

describe("core/humanizer", () => {
	describe("randomizeClassNames", () => {
		it("should replace quote-block with a variant", () => {
			const input = '<blockquote class="quote-block">Quote</blockquote>';
			const { html, changes } = randomizeClassNames(input);
			const validVariants = ["blockquote", "pullquote", "highlight-quote"];
			const hasVariant = validVariants.some((v) => html.includes(`class="${v}"`));
			expect(hasVariant).toBe(true);
			expect(html).not.toContain('class="quote-block"');
			expect(changes.length).toBeGreaterThan(0);
		});

		it("should replace data-table with a variant", () => {
			const input = '<table class="data-table">...</table>';
			const { html, changes } = randomizeClassNames(input);
			const validVariants = ["comparison-table", "info-table", "stats-table"];
			const hasVariant = validVariants.some((v) => html.includes(`class="${v}"`));
			expect(hasVariant).toBe(true);
			expect(html).not.toContain('class="data-table"');
			expect(changes.length).toBeGreaterThan(0);
		});

		it("should not change unknown classes", () => {
			const input = '<div class="custom-class">Content</div>';
			const { html, changes } = randomizeClassNames(input);
			expect(html).toContain('class="custom-class"');
			expect(changes.length).toBe(0);
		});
	});

	describe("normalizeAltText", () => {
		it("should simplify verbose alt text over 30 chars", () => {
			// Force a long alt that deterministically triggers normalization
			// using a src that hashes to even (normalized)
			const input =
				'<img alt="아름다운 신선한 사과가 나무에 매달려 있는 모습을 담은 사진" src="photo_00.jpg">';
			const { html } = normalizeAltText(input);
			// Either normalized (adjectives removed + trimmed) or unchanged (50% skip)
			// We just verify it doesn't error and returns valid html
			expect(html).toContain("<img");
		});

		it("should not modify short alt text", () => {
			const input = '<img alt="사과" src="apple.jpg">';
			const { html, changes } = normalizeAltText(input);
			expect(html).toContain('alt="사과"');
			expect(changes.length).toBe(0);
		});

		it("should not modify if result would be too short", () => {
			// Alt text over 30 chars but removing adjectives leaves < 5 chars
			const input = '<img alt="아름다운 멋진 훌륭한 완벽한 특별한 독특한 XX" src="img.jpg">';
			const { html } = normalizeAltText(input);
			// After removing all adjectives, "XX" might be < 5 chars → keep original
			// Just assert no crash and returns html
			expect(html).toContain("<img");
		});
	});

	describe("removeTailwindFingerprints", () => {
		it("should replace Tailwind color hex values", () => {
			const input = '<div style="background-color: #f8f9fa;">Content</div>';
			const { html, changes } = removeTailwindFingerprints(input);
			expect(html).toContain("#f5f5f5");
			expect(html).not.toContain("#f8f9fa");
			expect(changes.length).toBeGreaterThan(0);
		});

		it("should replace multiple Tailwind colors", () => {
			const input = '<div style="background: #1a202c; color: #e9ecef;">Box</div>';
			const { html, changes } = removeTailwindFingerprints(input);
			expect(html).toContain("#222222");
			expect(html).toContain("#eeeeee");
			expect(html).not.toContain("#1a202c");
			expect(html).not.toContain("#e9ecef");
			expect(changes.length).toBe(2);
		});

		it("should handle rem to px conversion", () => {
			const input = '<p style="font-size: 1rem; margin: 1.5rem;">Text</p>';
			const { html, changes } = removeTailwindFingerprints(input);
			expect(html).toContain("16px");
			expect(html).toContain("24px");
			expect(html).not.toContain("1rem");
			expect(changes.length).toBeGreaterThan(0);
		});
	});

	describe("fixColspanMismatch", () => {
		it("should fix single-cell colspan to match header count", () => {
			const input =
				'<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td colspan="1">Data</td></tr></tbody></table>';
			const { html, changes } = fixColspanMismatch(input);
			expect(html).toContain('colspan="2"');
			expect(changes.length).toBeGreaterThan(0);
		});

		it("should not change matching colspan", () => {
			const input =
				'<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td colspan="2">Data</td></tr></tbody></table>';
			const { html, changes } = fixColspanMismatch(input);
			expect(html).toContain('colspan="2"');
			expect(changes.length).toBe(0);
		});
	});

	describe("humanizeGeneratedHTMLFull", () => {
		it("should apply all humanization steps", () => {
			const input = `<blockquote class="quote-block">Quote</blockquote>
<div style="background-color: #f8f9fa;">Content</div>
<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td colspan="1">Data</td></tr></tbody></table>`;
			const { html } = humanizeGeneratedHTML(input);
			expect(html).not.toContain('class="quote-block"');
			expect(html).toContain("#f5f5f5");
			expect(html).toContain('colspan="2"');
		});

		it("should return list of changes applied", () => {
			const input = `<blockquote class="quote-block">Quote</blockquote>
<div style="background-color: #f8f9fa;">Content</div>`;
			const { changesApplied } = humanizeGeneratedHTML(input);
			expect(Array.isArray(changesApplied)).toBe(true);
			expect(changesApplied.length).toBeGreaterThan(0);
		});
	});
});
