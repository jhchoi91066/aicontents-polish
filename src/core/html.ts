import * as cheerio from "cheerio";

interface TextNode {
	type: "text";
	data: string;
}
function asTextNode(node: { type: string }): TextNode | null {
	return node.type === "text" ? (node as TextNode) : null;
}

const KEYWORD_STUFFING_HEADINGS: RegExp =
	/^(related|추천|keywords?|topics?|관련|참고|see also|further reading|추천\s*리소스)/i;

const BOOLEAN_ATTRIBUTES: string[] = [
	"itemscope",
	"disabled",
	"checked",
	"readonly",
	"required",
	"autofocus",
	"autoplay",
	"controls",
	"loop",
	"muted",
	"open",
];

const COMPILED_BOOLEAN_PATTERNS = BOOLEAN_ATTRIBUTES.flatMap((attr) => [
	{ regex: new RegExp(`${attr}=""`, "g"), replacement: attr },
	{ regex: new RegExp(`${attr}=''`, "g"), replacement: attr },
	{ regex: new RegExp(`${attr}="${attr}"`, "g"), replacement: attr },
]);

const FAKE_IMAGE_PATTERNS: RegExp[] = [
	/example\.com/i,
	/placeholder\./i,
	/lorem ipsum/i,
	/dummy/i,
	/test\.jpg/i,
	/sample\.(jpg|png|gif|webp)/i,
];

const BROKEN_LINK_PATTERNS: RegExp[] = [
	/\/wp-content\/plugins\//,
	/\/wp-content\/themes\//,
	/\/wp-admin\//,
	/\/wp-includes\//,
];

const SEMANTIC_CLASS_MAP: Record<string, string> = {
	table: "data-table",
	blockquote: "quote-block",
	ul: "list-unordered",
	ol: "list-ordered",
};

const MIN_STRONG_RATIO = 1000;
const MAX_STRONG_COUNT = 3;
const MIN_STRONG_COUNT = 1;
const KEYWORD_STUFFING_MIN_ITEMS = 4;
const KEYWORD_STUFFING_MAX_ITEM_LENGTH = 80;

function isFakeImageUrl(src: string): boolean {
	return FAKE_IMAGE_PATTERNS.some((pattern) => pattern.test(src));
}

function isBrokenUrl(url: string): boolean {
	return BROKEN_LINK_PATTERNS.some((pattern) => pattern.test(url));
}

export function normalizeBooleanAttributes(html: string): string {
	let result = html;
	for (const { regex, replacement } of COMPILED_BOOLEAN_PATTERNS) {
		result = result.replace(regex, replacement);
	}
	return result;
}

export function unwrapHtmlWrapper(html: string): string {
	const trimmed = html.trim();
	if (!/<html[\s>]/i.test(trimmed) && !/<body[\s>]/i.test(trimmed)) {
		return html;
	}

	const $ = cheerio.load(trimmed, { xmlMode: false });
	return $("body").html() ?? html;
}

export function removeBrokenInternalLinks(html: string): string {
	const $ = cheerio.load(html, { xmlMode: false }, false);

	$("script[src], link[href]").each((_, el) => {
		const element = $(el);
		const url = element.attr("src") ?? element.attr("href") ?? "";
		if (isBrokenUrl(url)) {
			element.remove();
		}
	});

	$("a[href]").each((_, el) => {
		const element = $(el);
		const href = element.attr("href") ?? "";
		if (isBrokenUrl(href)) {
			element.replaceWith(element.text());
		}
	});

	$("img[src]").each((_, el) => {
		const element = $(el);
		const src = element.attr("src") ?? "";
		if (isBrokenUrl(src)) {
			element.remove();
		}
	});

	return $.html();
}

export function removeFakeImages(html: string): string {
	const $ = cheerio.load(html, { xmlMode: false }, false);

	$("img").each((_, el) => {
		const element = $(el);
		const src = element.attr("src") ?? "";
		if (isFakeImageUrl(src)) {
			const parent = element.parent();
			if (parent.is("figure")) {
				parent.remove();
			} else {
				element.remove();
			}
		}
	});

	return $.html();
}

export function reduceExcessiveStrongTags(html: string): string {
	const $ = cheerio.load(html, { xmlMode: false }, false);

	const textLength = $("body").text().length;
	const maxStrong = Math.min(
		MAX_STRONG_COUNT,
		Math.max(MIN_STRONG_COUNT, Math.floor(textLength / MIN_STRONG_RATIO)),
	);

	const seen = new Set<string>();
	let kept = 0;

	$("strong").each((_, el) => {
		const element = $(el);
		const text = element.text().trim();

		if (seen.has(text) || kept >= maxStrong) {
			element.replaceWith(text);
		} else {
			seen.add(text);
			kept++;
		}
	});

	return $.html();
}

export function fixDoubleBrackets(html: string): string {
	const $ = cheerio.load(html, { xmlMode: false }, false);

	const skipSelectors = "pre, code, script, style";

	$("*")
		.contents()
		.each((_, node) => {
			const textNode = asTextNode(node as { type: string });
			if (!textNode) return;

			const parent = $(node).parent();
			if (parent.is(skipSelectors) || parent.closest(skipSelectors).length > 0) {
				return;
			}

			const replaced = textNode.data.replace(/\[\[(\d+)\]\]/g, "[$1]");
			if (replaced !== textNode.data) {
				textNode.data = replaced;
			}
		});

	return $.html();
}

export function removePostSourcesContent(html: string): string {
	const $ = cheerio.load(html, { xmlMode: false }, false);

	const sources = $("section.sources");
	if (sources.length === 0) return html;

	const lastSource = sources.last();
	let next = lastSource.next();
	while (next.length > 0) {
		const toRemove = next;
		next = next.next();
		toRemove.remove();
	}

	return $.html();
}

export function removeKeywordStuffingSections(html: string): string {
	const $ = cheerio.load(html, { xmlMode: false }, false);

	$("h2, h3").each((_, el) => {
		const heading = $(el);
		const headingText = heading.text().trim();

		if (!KEYWORD_STUFFING_HEADINGS.test(headingText)) return;

		const nextEl = heading.next();
		if (!nextEl.is("ul, ol")) return;

		const items = nextEl.children("li");
		if (items.length < KEYWORD_STUFFING_MIN_ITEMS) return;

		const allShort = items
			.toArray()
			.every((li) => $(li).text().trim().length < KEYWORD_STUFFING_MAX_ITEM_LENGTH);

		if (allShort) {
			nextEl.remove();
			heading.remove();
		}
	});

	return $.html();
}

export function fixParagraphLeadingPunctuation(html: string): string {
	const $ = cheerio.load(html, { xmlMode: false }, false);

	$("p").each((_, el) => {
		const p = $(el);
		const firstNode = p.contents().first();
		if (firstNode.length === 0) return;
		const textNode = asTextNode(firstNode[0] as { type: string });
		if (!textNode) return;
		textNode.data = textNode.data.replace(/^[\s,;:]+/, "");
	});

	return $.html();
}

export function enforceHeadingHierarchy(html: string): string {
	const $ = cheerio.load(html, { xmlMode: false }, false);
	let h1Count = 0;
	let prevLevel = 0;

	$("h1, h2, h3, h4, h5, h6").each((_, el) => {
		const element = $(el);
		const tagName = el.tagName.toLowerCase();
		const level = parseInt(tagName[1], 10);

		let newLevel = level;

		if (level === 1) {
			h1Count++;
			if (h1Count > 1) {
				newLevel = 2;
			}
		} else if (prevLevel > 0 && level > prevLevel + 1) {
			newLevel = prevLevel + 1;
		}

		if (newLevel !== level) {
			const newTag = `h${newLevel}`;
			const inner = element.html() ?? "";
			const attrs = el.attribs;
			const attrStr = Object.entries(attrs)
				.map(([k, v]) => (v === "" ? k : `${k}="${v}"`))
				.join(" ");
			const attrPart = attrStr ? ` ${attrStr}` : "";
			element.replaceWith(`<${newTag}${attrPart}>${inner}</${newTag}>`);
		}

		prevLevel = newLevel;
	});

	return $.html();
}

export function addSemanticClasses(html: string): string {
	const $ = cheerio.load(html, { xmlMode: false }, false);

	for (const [selector, className] of Object.entries(SEMANTIC_CLASS_MAP)) {
		$(selector).each((_, el) => {
			const element = $(el);
			const existing = element.attr("class");
			if (!existing) {
				element.addClass(className);
			}
		});
	}

	return $.html();
}

export function addMicrodataAttributes(html: string): string {
	const $ = cheerio.load(html, { xmlMode: false }, false);

	const firstH1 = $("h1").first();
	if (firstH1.length > 0) {
		firstH1.attr("itemprop", "headline");
	}

	const firstP = firstH1.nextAll("p").first();
	if (firstP.length > 0) {
		firstP.attr("itemprop", "description");
	}

	const firstImg = $("img").first();
	if (firstImg.length > 0) {
		firstImg.attr("itemprop", "image");
		firstImg.attr("loading", "lazy");
	}

	$("details").each((_, el) => {
		const details = $(el);
		details.attr("itemscope", "");
		details.attr("itemprop", "mainEntity");
		details.attr("itemtype", "https://schema.org/Question");

		const summary = details.find("summary").first();
		if (summary.length > 0) {
			summary.attr("itemprop", "name");
		}

		const answer = details.find("p").first();
		if (answer.length > 0) {
			answer.attr("itemscope", "");
			answer.attr("itemprop", "acceptedAnswer");
			answer.attr("itemtype", "https://schema.org/Answer");
		}
	});

	$("time[datetime]").each((_, el) => {
		$(el).attr("itemprop", "datePublished");
	});

	return $.html();
}

export function detectSchemaType(
	html: string,
	title: string,
): "Article" | "FAQPage" | "HowTo" | "Review" {
	const REVIEW_PATTERN = /후기|리뷰|체험|다녀온|다녀왔|방문기|이용기|review|experience/i;
	const HOW_TO_PATTERN = /how[\s-]?to|guide|steps?/i;

	if (REVIEW_PATTERN.test(title)) return "Review";

	const $ = cheerio.load(html, { xmlMode: false }, false);

	const questionHeadings = $("h1, h2, h3, h4, h5, h6")
		.toArray()
		.filter((el) => $(el).text().trim().endsWith("?")).length;

	const detailsCount = $("details").length;

	if (questionHeadings >= 3 || detailsCount >= 3) return "FAQPage";

	if (HOW_TO_PATTERN.test(title) && $("ol").length > 0) return "HowTo";

	return "Article";
}
