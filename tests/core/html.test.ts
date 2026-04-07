import { describe, expect, it } from "vitest";
import {
	addMicrodataAttributes,
	addSemanticClasses,
	detectSchemaType,
	enforceHeadingHierarchy,
	normalizeBooleanAttributes,
	removeBrokenInternalLinks,
	removeFakeImages,
	removeKeywordStuffingSections,
	removePostSourcesContent,
	unwrapHtmlWrapper,
} from "../../src/core/html";
import {
	BAD_HEADING_HIERARCHY,
	FAKE_IMAGES,
	FULL_HTML_DOC,
	KEYWORD_STUFFING,
	MICRODATA_ARTICLE,
	MICRODATA_FAQ,
	WP_ARTIFACTS,
} from "../fixtures/samples";

describe("core/html", () => {
	describe("normalizeBooleanAttributes", () => {
		it('should convert itemscope="" to itemscope', () => {
			const input = '<div itemscope="">Content</div>';
			const result = normalizeBooleanAttributes(input);
			expect(result).toContain("itemscope");
			expect(result).not.toContain('itemscope=""');
			expect(result).not.toContain("itemscope=''");
		});

		it("should handle multiple boolean attributes", () => {
			const input = '<input checked="" disabled="" readonly="">';
			const result = normalizeBooleanAttributes(input);
			expect(result).toContain("checked");
			expect(result).toContain("disabled");
			expect(result).toContain("readonly");
			expect(result).not.toContain('checked=""');
			expect(result).not.toContain('disabled=""');
			expect(result).not.toContain('readonly=""');
		});

		it("should handle media attributes", () => {
			const input = '<video autoplay="" controls="" loop="" muted=""></video>';
			const result = normalizeBooleanAttributes(input);
			expect(result).toContain("autoplay");
			expect(result).toContain("controls");
			expect(result).toContain("loop");
			expect(result).toContain("muted");
			expect(result).not.toContain('autoplay=""');
			expect(result).not.toContain('controls=""');
		});
	});

	describe("unwrapHtmlWrapper", () => {
		it("should extract body content from full HTML document", () => {
			const result = unwrapHtmlWrapper(FULL_HTML_DOC);
			expect(result).toContain("<h1>Content</h1>");
			expect(result).toContain("<p>Text</p>");
			expect(result).not.toContain("<!DOCTYPE");
			expect(result).not.toContain("<html");
			expect(result).not.toContain("<head");
			expect(result).not.toContain("<body");
		});

		it("should handle body with attributes", () => {
			const input = '<html><body class="dark"><p>Text</p></body></html>';
			const result = unwrapHtmlWrapper(input);
			expect(result).toContain("<p>Text</p>");
			expect(result).not.toContain("<body");
		});

		it("should handle content without body tag", () => {
			const input = "<p>Just content</p>";
			const result = unwrapHtmlWrapper(input);
			expect(result).toBe(input);
		});
	});

	describe("removeBrokenInternalLinks", () => {
		it("should remove WordPress plugin scripts", () => {
			const result = removeBrokenInternalLinks(WP_ARTIFACTS);
			expect(result).not.toContain("/wp-content/plugins/");
		});

		it("should remove wp-admin links", () => {
			const result = removeBrokenInternalLinks(WP_ARTIFACTS);
			expect(result).not.toContain("/wp-admin/");
			expect(result).toContain("Admin Link");
		});

		it("should keep normal links", () => {
			const input = '<a href="https://example.com">Link</a>';
			const result = removeBrokenInternalLinks(input);
			expect(result).toContain('href="https://example.com"');
		});
	});

	describe("removeFakeImages", () => {
		it("should remove example.com images with figure", () => {
			const result = removeFakeImages(FAKE_IMAGES);
			expect(result).not.toContain("example.com/placeholder.jpg");
			expect(result).not.toContain("Figure 1");
		});

		it("should remove placeholder images", () => {
			const result = removeFakeImages(FAKE_IMAGES);
			expect(result).not.toContain("placeholder.png");
		});

		it("should keep real images", () => {
			const result = removeFakeImages(FAKE_IMAGES);
			expect(result).toContain("cdn.realsite.com/actual-photo.webp");
		});
	});

	describe("enforceHeadingHierarchy", () => {
		it("should convert multiple H1s to H2", () => {
			const result = enforceHeadingHierarchy(BAD_HEADING_HIERARCHY);
			const h1Matches = result.match(/<h1/gi) ?? [];
			expect(h1Matches.length).toBe(1);
			expect(result).toContain("<h2>Second H1 Should Be H2</h2>");
		});

		it("should fix skipped heading levels", () => {
			const input = "<h1>Title</h1><h3>Skipped</h3>";
			const result = enforceHeadingHierarchy(input);
			expect(result).toContain("<h2>Skipped</h2>");
		});

		it("should not change correct hierarchy", () => {
			const input = "<h1>Title</h1><h2>Section</h2><h3>Sub</h3>";
			const result = enforceHeadingHierarchy(input);
			expect(result).toContain("<h1>Title</h1>");
			expect(result).toContain("<h2>Section</h2>");
			expect(result).toContain("<h3>Sub</h3>");
		});
	});

	describe("removeKeywordStuffingSections", () => {
		it("should remove Related Topics with 4+ short items", () => {
			const result = removeKeywordStuffingSections(KEYWORD_STUFFING);
			expect(result).not.toContain("Related Topics");
			expect(result).not.toContain("<li>Topic 1</li>");
		});

		it("should remove See Also with 4+ short items", () => {
			const result = removeKeywordStuffingSections(KEYWORD_STUFFING);
			expect(result).not.toContain("See Also");
			expect(result).not.toContain("<li>Link A</li>");
		});

		it("should keep lists with long items", () => {
			const input = `<h2>Related Topics</h2><ul>
<li>This is a very long item that exceeds the 80 character limit and should be kept as is in the output</li>
<li>Another very long item that should not be removed because it contains real meaningful content</li>
<li>Yet another long item to ensure the list is preserved when items have substantial text content</li>
<li>Fourth long item here</li>
</ul>`;
			const result = removeKeywordStuffingSections(input);
			expect(result).toContain("Related Topics");
		});

		it("should keep lists with fewer than 4 items", () => {
			const input = `<h2>Related Topics</h2><ul>
<li>Topic A</li>
<li>Topic B</li>
<li>Topic C</li>
</ul>`;
			const result = removeKeywordStuffingSections(input);
			expect(result).toContain("Related Topics");
			expect(result).toContain("Topic A");
		});
	});

	describe("removePostSourcesContent", () => {
		it("should remove content after sources section", () => {
			const input = `<h2>Article</h2><p>Content</p><section class="sources"><h2>Sources</h2></section><p>Should be removed</p>`;
			const result = removePostSourcesContent(input);
			expect(result).toContain("Article");
			expect(result).not.toContain("Should be removed");
		});

		it("should not change content without sources", () => {
			const input = "<h1>Title</h1><p>Content</p>";
			const result = removePostSourcesContent(input);
			expect(result).toContain("Title");
			expect(result).toContain("Content");
		});
	});

	describe("addSemanticClasses", () => {
		it("should add data-table to tables", () => {
			const input = "<table><tr><td>Data</td></tr></table>";
			const result = addSemanticClasses(input);
			expect(result).toContain('class="data-table"');
		});

		it("should add quote-block to blockquotes", () => {
			const input = "<blockquote>Quote text</blockquote>";
			const result = addSemanticClasses(input);
			expect(result).toContain('class="quote-block"');
		});
	});

	describe("addMicrodataAttributes", () => {
		it("should add headline microdata to first H1", () => {
			const result = addMicrodataAttributes(MICRODATA_ARTICLE);
			expect(result).toContain('itemprop="headline"');
		});

		it("should add FAQ microdata to details elements", () => {
			const result = addMicrodataAttributes(MICRODATA_FAQ);
			expect(result).toContain('itemtype="https://schema.org/Question"');
			expect(result).toContain('itemprop="name"');
		});

		it("should add lazy loading to images", () => {
			const result = addMicrodataAttributes(MICRODATA_ARTICLE);
			expect(result).toContain('loading="lazy"');
		});
	});

	describe("detectSchemaType", () => {
		it("should detect Review for 후기/리뷰 titles", () => {
			expect(detectSchemaType("<p>Content</p>", "카페 방문기")).toBe("Review");
			expect(detectSchemaType("<p>Content</p>", "맛집 리뷰")).toBe("Review");
		});

		it("should detect FAQPage for 3+ question headings", () => {
			const html = "<h2>What is A?</h2><h2>Why B?</h2><h2>How C?</h2>";
			expect(detectSchemaType(html, "Questions")).toBe("FAQPage");
		});

		it("should detect HowTo for how-to titles with ol", () => {
			const html = "<ol><li>Step 1</li><li>Step 2</li></ol>";
			expect(detectSchemaType(html, "How to Bake a Cake")).toBe("HowTo");
		});

		it("should default to Article", () => {
			expect(detectSchemaType("<p>Content</p>", "News Story")).toBe("Article");
		});
	});
});
