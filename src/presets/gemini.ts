import { definePreset } from "./types";

const CONCLUSION_INTRO_THRESHOLD = 2;
const EXAGGERATION_MIN_MATCHES = 2;
const META_NARRATIVE_MIN_MATCHES = 2;
const FAKE_AUTHORITY_MIN_MATCHES = 1;
const HEDGING_STATS_MIN_MATCHES = 2;

const GEMINI_SIGNAL_TOKENS = [
	"결론부터 말씀드리면",
	"결론부터 말하자면",
	"핵심부터 말씀드리면",
	"이번 글에서는",
	"이번 포스팅에서는",
	"정말 최고의 선택이었어요",
	"정말 특별했어요",
	"대성공이었죠",
	"IT직장인으로서",
	"개발자로서",
	"전문가로서",
	"제 경험상",
	"직접 경험해보니",
	"90% 이상의 여행자가 만족",
	"95% 이상의",
	"100% 환불 보장",
	"100% 만족",
	"100% 보장",
	"무조건 추천",
];

export const geminiPreset = definePreset({
	name: "gemini",
	bannedTokens: [],
	patterns: [
		// P0: Conclusion intro patterns (from original editor.ts lines 70-79)
		{
			match: /결론부터 말씀드리면,?\s*/g,
			replace: "",
			priority: "p0",
			description: "conclusion-intro",
		},
		{
			match: /결론부터 말하자면,?\s*/g,
			replace: "",
			priority: "p0",
			description: "conclusion-intro",
		},
		{
			match: /결론부터 말하면,?\s*/g,
			replace: "",
			priority: "p0",
			description: "conclusion-intro",
		},
		{
			match: /먼저 결론을 말씀드리면,?\s*/g,
			replace: "",
			priority: "p0",
			description: "conclusion-intro",
		},
		{
			match: /먼저 결론부터 말하면,?\s*/g,
			replace: "",
			priority: "p0",
			description: "conclusion-intro",
		},
		{
			match: /결론부터 이야기하면,?\s*/g,
			replace: "",
			priority: "p0",
			description: "conclusion-intro",
		},
		{
			match: /핵심부터 말씀드리면,?\s*/g,
			replace: "",
			priority: "p0",
			description: "conclusion-intro",
		},
		{
			match: /핵심부터 말하면,?\s*/g,
			replace: "",
			priority: "p0",
			description: "conclusion-intro",
		},
		{
			match: /결론부터 공유하자면,?\s*/g,
			replace: "",
			priority: "p0",
			description: "conclusion-intro",
		},
		{
			match: /결론부터 공유하면,?\s*/g,
			replace: "",
			priority: "p0",
			description: "conclusion-intro",
		},

		// P1: Exaggeration patterns (from original editor.ts lines 84-89)
		{
			match: /정말 최고의 선택이었어요/g,
			replace: "좋은 선택이었어요",
			priority: "p1",
			description: "exaggeration",
		},
		{
			match: /정말 특별했어요/g,
			replace: "인상적이었어요",
			priority: "p1",
			description: "exaggeration",
		},
		{
			match: /대성공이었죠/g,
			replace: "잘 됐어요",
			priority: "p1",
			description: "exaggeration",
		},
		{
			match: /기대해 주세요/g,
			replace: "",
			priority: "p1",
			description: "exaggeration",
		},
		{
			match: /꼭 추천드려요/g,
			replace: "추천해요",
			priority: "p1",
			description: "exaggeration",
		},
		{
			match: /강력 추천합니다/g,
			replace: "추천합니다",
			priority: "p1",
			description: "exaggeration",
		},

		// P1: Meta-narrative patterns (from original editor.ts lines 94-101)
		{
			match: /이번 글에서는/g,
			replace: "",
			priority: "p1",
			description: "meta-narrative",
		},
		{
			match: /이번 포스팅에서는/g,
			replace: "",
			priority: "p1",
			description: "meta-narrative",
		},
		{
			match: /정리해 드릴게요/g,
			replace: "정리했어요",
			priority: "p1",
			description: "meta-narrative",
		},
		{
			match: /소개해 드릴게요/g,
			replace: "소개할게요",
			priority: "p1",
			description: "meta-narrative",
		},
		{
			match: /알려드릴게요/g,
			replace: "알려줄게요",
			priority: "p1",
			description: "meta-narrative",
		},
		{
			match: /알아보겠습니다/g,
			replace: "",
			priority: "p1",
			description: "meta-narrative",
		},
		{
			match: /살펴보겠습니다/g,
			replace: "",
			priority: "p1",
			description: "meta-narrative",
		},
		{
			match: /다뤄보겠습니다/g,
			replace: "",
			priority: "p1",
			description: "meta-narrative",
		},

		// P1: Fake authority patterns (from original editor.ts lines 106-117)
		{
			match: /IT ?직장인으로서/g,
			replace: "",
			priority: "p1",
			description: "fake-authority",
		},
		{
			match: /개발자로서/g,
			replace: "",
			priority: "p1",
			description: "fake-authority",
		},
		{
			match: /정리 ?수납 ?전문가로서/g,
			replace: "",
			priority: "p1",
			description: "fake-authority",
		},
		{
			match: /전문가로서/g,
			replace: "",
			priority: "p1",
			description: "fake-authority",
		},
		{
			match: /여행 ?전문가로서/g,
			replace: "",
			priority: "p1",
			description: "fake-authority",
		},
		{
			match: /3년 ?전/g,
			replace: "예전에",
			priority: "p1",
			description: "fake-authority",
		},
		{
			match: /3년 ?동안/g,
			replace: "오랜 기간",
			priority: "p1",
			description: "fake-authority",
		},
		{
			match: /몇 ?년 ?전/g,
			replace: "예전",
			priority: "p1",
			description: "fake-authority",
		},
		{
			match: /수년간/g,
			replace: "오랫동안",
			priority: "p1",
			description: "fake-authority",
		},
		{
			match: /제 ?경험상/g,
			replace: "",
			priority: "p1",
			description: "fake-authority",
		},
		{
			match: /직접 ?경험해보니/g,
			replace: "",
			priority: "p1",
			description: "fake-authority",
		},
		{
			match: /솔직히 ?말씀드리면/g,
			replace: "솔직히",
			priority: "p1",
			description: "fake-authority",
		},

		// P1: Hedging stats patterns (from original editor.ts lines 175-186)
		{
			match: /90% 이상의 여행자가 만족/g,
			replace: "많은 여행자들이 만족하는 편",
			priority: "p1",
			description: "hedging-stats",
		},
		{
			match: /95% 이상의?/g,
			replace: "대부분의",
			priority: "p1",
			description: "hedging-stats",
		},
		{
			match: /\d+% 이상의 (여행자|이용자|고객)가?/g,
			replace: "많은 $1들이",
			priority: "p1",
			description: "hedging-stats",
		},
		{
			match: /100% 환불 보장/g,
			replace: "환불이 지원되는 경우가 많습니다",
			priority: "p1",
			description: "hedging-stats",
		},
		{
			match: /100% 만족/g,
			replace: "높은 만족도",
			priority: "p1",
			description: "hedging-stats",
		},
		{
			match: /(\d+)만 명 이상이 이용/g,
			replace: "많은 분들이 이용",
			priority: "p1",
			description: "hedging-stats",
		},
		{
			match: /평점 (\d+\.\d+)점(?!.*에 따르면)/g,
			replace: "평점이 높은 편",
			priority: "p1",
			description: "hedging-stats",
		},
		{
			match: /평균 (\d+\.\d+)점/g,
			replace: "평점이 좋은 편",
			priority: "p1",
			description: "hedging-stats",
		},
		{
			match: /반드시 보장/g,
			replace: "보장되는 경우가 많음",
			priority: "p1",
			description: "hedging-stats",
		},
		{
			match: /100% 보장/g,
			replace: "보장되는 경우가 많습니다",
			priority: "p1",
			description: "hedging-stats",
		},
		{
			match: /무조건 추천/g,
			replace: "추천드리는 편",
			priority: "p1",
			description: "hedging-stats",
		},
	],
	detect(text: string): number {
		const matchCount = GEMINI_SIGNAL_TOKENS.filter((token) => text.includes(token)).length;
		const ratio = matchCount / GEMINI_SIGNAL_TOKENS.length;

		if (matchCount >= CONCLUSION_INTRO_THRESHOLD) return Math.min(1, 0.4 + ratio * 3);
		if (matchCount >= 1) return 0.3;

		const hasKorean = /[\uAC00-\uD7AF]/.test(text);
		const hasExaggeration =
			["정말", "최고", "완벽", "강력"].filter((t) => text.includes(t)).length >=
			EXAGGERATION_MIN_MATCHES;

		const hasMetaNarrative =
			["이번", "알아보", "소개", "정리"].filter((t) => text.includes(t)).length >=
			META_NARRATIVE_MIN_MATCHES;

		const hasFakeAuthority =
			["로서", "경험상", "직접"].filter((t) => text.includes(t)).length >=
			FAKE_AUTHORITY_MIN_MATCHES;

		const hasHedgingStats =
			["%", "보장", "만족"].filter((t) => text.includes(t)).length >= HEDGING_STATS_MIN_MATCHES;

		const signals = [
			hasKorean,
			hasExaggeration,
			hasMetaNarrative,
			hasFakeAuthority,
			hasHedgingStats,
		].filter(Boolean).length;

		return Math.min(0.5, signals * 0.1);
	},
});
