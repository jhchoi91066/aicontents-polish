# llm-polish

AI 콘텐츠 품질 도구 — AI가 생성한 텍스트의 흔적을 탐지, 분석, 제거합니다.

[English Documentation](/README.md)

## 주요 기능

- **126개 AI 냄새 패턴** — 4개 LLM 프리셋 (Gemini, GPT, Claude, Llama)
- **42개 금지 토큰** 탐지 (영어 23 + 한국어 19)
- **다국어 지원** — 한국어/영어 로케일 + 자동 감지
- **분석 전용 모드** — 수정 없이 검사만 가능
- **플러그인 아키텍처** — 커스텀 프리셋/로케일 정의 가능
- **의존성 최소** — cheerio만 필수

## 설치

```bash
npm install llm-polish
# 또는
pnpm add llm-polish
```

## 빠른 시작

```ts
import { createPolisher } from "llm-polish";

const polisher = createPolisher({
  preset: "gemini",
  locale: "ko",
});

// 처리: 분석 + 수정 + 휴머나이징
const { html, report } = polisher.process(aiGeneratedHTML);
console.log(report.score); // 0-100 점수
console.log(report.issues); // 발견된 문제
console.log(report.fixes); // 적용된 수정

// 분석만 (수정 없이)
const report = polisher.analyze(aiGeneratedHTML);
```

## 프리셋

| 프리셋 | 패턴 수 | 금지 토큰 | 설명 |
|--------|---------|-----------|------|
| `gemini` | 47 | — | 한국어 AI 패턴: 결론 도입부, 과장, 가짜 권위, 헤징 통계 |
| `gpt` | 25 | 10 | 영어 AI 토큰: delve, nuanced, leverage + 결론 필러 |
| `claude` | 9 | 5 | 아첨 도입부, 맥락 반복, 헤징 수식어 |
| `llama` | 7 | 4 | AI 정체성 면책, 능력 면책 |

### 자동 감지

```ts
const polisher = createPolisher({ preset: "auto", locale: "auto" });
// 콘텐츠에서 LLM과 언어를 자동으로 감지합니다
```

### 복수 프리셋

```ts
const polisher = createPolisher({
  preset: ["gemini", "gpt"],
  locale: "ko",
});
```

### 커스텀 프리셋

```ts
import { createPolisher, definePreset } from "llm-polish";

const myPreset = definePreset({
  name: "my-model",
  bannedTokens: ["synergize"],
  patterns: [
    { match: /As an AI/gi, replace: "", priority: "p0" },
  ],
});

const polisher = createPolisher({ preset: myPreset });
```

## 로케일

| 로케일 | 헤징 패턴 | 조사 규칙 | 설명 |
|--------|----------|-----------|------|
| `ko` | 22 | 1 | 한국어 헤지 표현, 필러, 고아 조사 탐지 |
| `en` | 14 | — | 영어 헤지, 결론 필러, 메타 해설 |

## 규칙 오버라이드

```ts
const polisher = createPolisher({
  preset: "gemini",
  locale: "ko",
  rules: {
    disable: ["emojiRemoval", "humanize"],
    sentenceVariance: { minStdDev: 3.0 },
    bannedTokens: { extra: ["추가단어"] },
  },
});
```

## 탐지 항목

| 카테고리 | 예시 |
|----------|------|
| **금지 토큰** | "delve", "elevate", "혁신적인", "필수불가결" |
| **팬텀 참조** | "제 영상에서", "in my previous video" |
| **메타 서술** | "이번 글에서는", "In this article, we'll" |
| **가짜 권위** | "IT직장인으로서", "3년 동안" |
| **미검증 통계** | "90% 이상의 여행자가 만족" → "많은 여행자들이 만족하는 편" |
| **문장 균일성** | 문장당 단어 수 표준편차 < 2.5 |
| **중복 콘텐츠** | 반복 제목, 다중 Sources 섹션 |

## 수정 항목

| 카테고리 | 동작 |
|----------|------|
| **AI 냄새 패턴** | 126개 정규식 기반 패턴 치환 |
| **제목 계층** | H1→H2→H3 강제 (스킵 방지, H1 단일) |
| **키워드 스터핑** | 짧은 항목의 "Related Topics" 목록 제거 |
| **가짜 이미지** | placeholder/example.com 이미지 제거 |
| **HTML 휴머나이징** | CSS 클래스 랜덤화, alt 텍스트 정규화, Tailwind 지문 제거 |
| **시맨틱 마크업** | Schema.org 마이크로데이터 (Article, FAQ, HowTo, Review) |

## 개발

```bash
pnpm install
pnpm test          # 테스트 실행 (246개)
pnpm run typecheck # 타입 체크
pnpm run lint      # 린트
pnpm run build     # 빌드 (ESM + CJS + DTS)
```

## 라이선스

[MIT](./LICENSE)
