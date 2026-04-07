import type { SmellPattern } from "../types";
import { defineLocale } from "./types";

const ASCII_RATIO_THRESHOLD = 0.7;

const hedgingPatterns: SmellPattern[] = [
	{ match: "In conclusion,", replace: "" },
	{ match: "To summarize,", replace: "" },
	{ match: "All in all,", replace: "" },
	{ match: "In summary,", replace: "" },
	{ match: "Overall,", replace: "" },
	{ match: "Ultimately,", replace: "" },
	{ match: "At the end of the day,", replace: "" },
	{ match: "It's important to note that", replace: "" },
	{ match: "It should be noted that", replace: "" },
	{ match: "Interestingly,", replace: "" },
	{ match: "Needless to say,", replace: "" },
	{ match: "As a matter of fact,", replace: "" },
	{ match: "For what it's worth,", replace: "" },
	{ match: "By and large,", replace: "" },
];

function isAsciiLetter(code: number): boolean {
	return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

function detect(text: string): number {
	const nonWhitespace = text.replace(/\s/g, "");
	if (nonWhitespace.length === 0) return 0;

	let asciiCount = 0;
	for (const char of nonWhitespace) {
		if (isAsciiLetter(char.charCodeAt(0))) {
			asciiCount++;
		}
	}

	const ratio = asciiCount / nonWhitespace.length;
	if (ratio > ASCII_RATIO_THRESHOLD) {
		return ratio;
	}
	return 0;
}

export const enLocale = defineLocale({
	name: "en",
	hedgingPatterns,
	detect,
});
