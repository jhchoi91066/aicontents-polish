import type { ParticleRule, SmellPattern } from "../types";
import { defineLocale } from "./types";

const KOREAN_CHAR_RATIO_THRESHOLD = 0.3;
const UNICODE_HANGUL_START = 0xac00;
const UNICODE_HANGUL_END = 0xd7af;

const hedgingPatterns: SmellPattern[] = [
	{ match: "종합적으로 고려했을 때", replace: "정리하면" },
	{ match: "다양한 측면에서", replace: "" },
	{ match: /~라고 할 수 있습니다/g, replace: "" },
	{ match: "결론적으로 말씀드리면", replace: "결론은" },
	{ match: "기본적으로", replace: "" },
	{ match: "일반적으로", replace: "" },
	{ match: "전반적으로", replace: "" },
	{ match: "결론적으로", replace: "" },
	{ match: "종합하면", replace: "" },
	{ match: "요약하자면", replace: "" },
	{ match: "정리하자면", replace: "" },
	{ match: "한마디로", replace: "" },
	{ match: "다시 말해", replace: "" },
	{ match: "즉,", replace: "" },
	{ match: "따라서", replace: "" },
	{ match: "그러므로", replace: "" },
	{ match: "이러한 점에서", replace: "" },
	{ match: "이러한 측면에서", replace: "" },
	{ match: "다양한 요소를 고려하여", replace: "" },
	{ match: "효율적으로", replace: "" },
	{ match: "효과적으로", replace: "" },
	{ match: "체계적으로", replace: "" },
];

const particleRules: ParticleRule[] = [
	{
		pattern: /([은는이가을를의에서도만]\s+[은는이가을를의에서도만])/g,
		description: "Orphaned Korean particles",
	},
];

function isKoreanChar(code: number): boolean {
	return code >= UNICODE_HANGUL_START && code <= UNICODE_HANGUL_END;
}

function detect(text: string): number {
	const nonWhitespace = text.replace(/\s/g, "");
	if (nonWhitespace.length === 0) return 0;

	let koreanCount = 0;
	for (const char of nonWhitespace) {
		if (isKoreanChar(char.charCodeAt(0))) {
			koreanCount++;
		}
	}

	const ratio = koreanCount / nonWhitespace.length;
	if (ratio > KOREAN_CHAR_RATIO_THRESHOLD) {
		return Math.min(ratio, 1.0);
	}
	return 0;
}

export const koLocale = defineLocale({
	name: "ko",
	hedgingPatterns,
	particleRules,
	detect,
});
