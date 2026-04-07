import * as cheerio from "cheerio";
import { normalizeBooleanAttributes } from "./html.js";

const CLASS_VARIANTS: Record<string, string[]> = {
	"quote-block": ["quote-block", "blockquote", "pullquote", "highlight-quote"],
	"data-table": ["data-table", "comparison-table", "info-table", "stats-table"],
	"content-image": ["content-image", "article-image", "featured-img", "post-image"],
	"list-ordered": ["list-ordered", "numbered-list", "step-list", "ol-list"],
	"list-unordered": ["list-unordered", "bullet-list", "item-list", "ul-list"],
};

const VERBOSE_ADJECTIVES: string[] = [
	"먹음직스러운",
	"환하게",
	"신선한",
	"압도적인",
	"화려한",
	"아름다운",
	"멋진",
	"훌륭한",
	"완벽한",
	"최고의",
	"특별한",
	"인상적인",
	"놀라운",
	"매력적인",
	"독특한",
];

const TAILWIND_COLORS: Record<string, string> = {
	"#f8f9fa": "#f5f5f5",
	"#e9ecef": "#eeeeee",
	"#4a5568": "#555555",
	"#2d3748": "#333333",
	"#1a202c": "#222222",
};

const COMPILED_TAILWIND_COLORS = Object.entries(TAILWIND_COLORS).map(([original, replacement]) => ({
	regex: new RegExp(original.replace("#", "\\#"), "gi"),
	replacement,
	original,
}));

const REM_TO_PX: Record<string, string> = {
	"0.75rem": "12px",
	"1rem": "16px",
	"1.5rem": "24px",
	"2rem": "32px",
};

const ALT_TEXT_MAX_LENGTH = 25;
const ALT_TEXT_TRIGGER_LENGTH = 30;
const ALT_TEXT_MIN_LENGTH = 5;

function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const COMPILED_ADJECTIVE_PATTERNS = VERBOSE_ADJECTIVES.map(
	(adj) => new RegExp(escapeRegExp(adj), "g"),
);

function hashString(s: string): number {
	let hash = 0;
	for (let i = 0; i < s.length; i++) {
		hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
	}
	return hash;
}

function pickVariant(original: string, variants: string[]): string {
	const alternatives = variants.filter((v) => v !== original);
	if (alternatives.length === 0) return original;
	const index = hashString(original) % alternatives.length;
	return alternatives[index];
}

function isDeterministicNormalize(src: string): boolean {
	return hashString(src) % 2 === 0;
}

export function randomizeClassNames(html: string): { html: string; changes: string[] } {
	const $ = cheerio.load(html, { xmlMode: false }, false);
	const changes: string[] = [];

	for (const [canonical, variants] of Object.entries(CLASS_VARIANTS)) {
		$(`[class]`).each((_, el) => {
			const element = $(el);
			const classes = (element.attr("class") ?? "").split(/\s+/);
			if (!classes.includes(canonical)) return;

			const replacement = pickVariant(canonical, variants);
			const newClasses = classes.map((c) => (c === canonical ? replacement : c)).join(" ");
			element.attr("class", newClasses);
			changes.push(`${canonical} → ${replacement}`);
		});
	}

	return { html: $.html(), changes };
}

export function normalizeAltText(html: string): { html: string; changes: string[] } {
	const $ = cheerio.load(html, { xmlMode: false }, false);
	const changes: string[] = [];

	$("img[alt]").each((_, el) => {
		const element = $(el);
		const alt = element.attr("alt") ?? "";

		if (alt.length <= ALT_TEXT_TRIGGER_LENGTH) return;

		const src = element.attr("src") ?? alt;
		if (!isDeterministicNormalize(src)) return;

		let cleaned = alt;
		for (const regex of COMPILED_ADJECTIVE_PATTERNS) {
			cleaned = cleaned.replace(regex, "").trim();
		}

		cleaned = cleaned.replace(/\s+/g, " ").trim();

		if (cleaned.length < ALT_TEXT_MIN_LENGTH) return;

		const trimmed =
			cleaned.length > ALT_TEXT_MAX_LENGTH ? cleaned.slice(0, ALT_TEXT_MAX_LENGTH) : cleaned;

		element.attr("alt", trimmed);
		changes.push(`alt normalized: "${alt}" → "${trimmed}"`);
	});

	return { html: $.html(), changes };
}

export function removeTailwindFingerprints(html: string): { html: string; changes: string[] } {
	const changes: string[] = [];
	let result = html;

	for (const { regex, replacement, original } of COMPILED_TAILWIND_COLORS) {
		if (regex.test(result)) {
			// Reset lastIndex after test() since regex has /g flag
			regex.lastIndex = 0;
			result = result.replace(regex, replacement);
			changes.push(`color ${original} → ${replacement}`);
		}
	}

	for (const [original, replacement] of Object.entries(REM_TO_PX)) {
		if (result.includes(original)) {
			result = result.split(original).join(replacement);
			changes.push(`${original} → ${replacement}`);
		}
	}

	return { html: result, changes };
}

export function fixColspanMismatch(html: string): { html: string; changes: string[] } {
	const $ = cheerio.load(html, { xmlMode: false }, false);
	const changes: string[] = [];

	$("table").each((_, tableEl) => {
		const table = $(tableEl);
		const headerRow = table.find("thead tr").first();
		if (headerRow.length === 0) return;

		const columnCount = headerRow.children("th, td").length;
		if (columnCount === 0) return;

		table.find("tbody tr").each((_, rowEl) => {
			const row = $(rowEl);
			const cells = row.children("td, th");
			if (cells.length !== 1) return;

			const cell = cells.first();
			const currentColspan = parseInt(cell.attr("colspan") ?? "1", 10);
			if (currentColspan !== columnCount) {
				cell.attr("colspan", String(columnCount));
				changes.push(`colspan fixed: ${currentColspan} → ${columnCount}`);
			}
		});
	});

	return { html: $.html(), changes };
}

export function humanizeGeneratedHTML(html: string): { html: string; changesApplied: string[] } {
	const allChanges: string[] = [];

	const step1 = randomizeClassNames(html);
	allChanges.push(...step1.changes);

	const step2 = normalizeAltText(step1.html);
	allChanges.push(...step2.changes);

	const step3 = removeTailwindFingerprints(step2.html);
	allChanges.push(...step3.changes);

	const step4 = fixColspanMismatch(step3.html);
	allChanges.push(...step4.changes);

	const finalHtml = normalizeBooleanAttributes(step4.html);

	return { html: finalHtml, changesApplied: allChanges };
}
