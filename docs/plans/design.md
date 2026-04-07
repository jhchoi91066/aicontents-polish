# llm-polish - Design Document

## Overview

AI 생성 텍스트의 흔적을 탐지/분석/제거하는 오픈소스 라이브러리.
186개 AI smell 패턴, 42개 banned token, 다국어 locale 지원.

## Positioning

"AI Content Quality Toolkit" - 품질 향상 프레이밍.
분석/검증/후처리를 통합 제공. 탐지 우회는 부산물.

## Tech Stack

| 영역 | 선택 | 이유 |
|---|---|---|
| 언어 | TypeScript 6.0 (strict) | 최신 안정 버전, TS 7 (Go 기반) 마이그레이션 대비 |
| 런타임 | Node.js 22+ | 24 LTS 현행, 20은 2026-04 EOL. Vitest 4가 Node 20+ 필수이므로 22+로 설정 |
| 테스트 | Vitest 4.x | 빠름, 스냅샷 테스트, ESM 네이티브, Browser Mode stable |
| 빌드 | tsup 8.x | ESM + CJS 듀얼 빌드, zero-config. 추후 tsdown 마이그레이션 가능 |
| 린트 | Biome 2.4.x | ESLint보다 빠름, formatter 포함, 450+ rules |
| 패키지매니저 | pnpm | 디스크 효율, strict deps |
| HTML 파싱 | cheerio 1.x | 필수 의존성, 가장 안정적인 HTML 파서 |
| AI (optional) | @google/generative-ai | peer dependency |
| CI | GitHub Actions | 표준 |

## Architecture

### 접근 방식: B + TDD (클린룸 + 테스트 주도)

기존 acrossclick_api의 프로덕션 검증된 코드에서 테스트 케이스를 수확하고,
새 구조로 TDD 작성. 기존 코드가 "스펙 문서" 역할.

### 패키지 구조

```
llm-polish/
  src/
    index.ts              # createPolisher, analyze, definePreset, defineLocale
    types.ts              # 공개 인터페이스
    core/
      analyzer.ts         # 텍스트 품질 분석 (sentence variance, banned tokens)
      detector.ts         # 팬텀 참조, 중복 콘텐츠, 언어 혼합 탐지
      fixer.ts            # 구두점 수정, bold 정리, heading 계층 교정
      humanizer.ts        # 클래스 랜덤화, Tailwind 제거, alt 정규화
      html.ts             # HTML 정규화, 시맨틱 클래스, microdata
    presets/
      types.ts            # Preset 인터페이스
      gemini.ts           # 186개 패턴
      gpt.ts              # GPT 특유 패턴
      claude.ts           # Claude 특유 패턴
      llama.ts            # Llama 특유 패턴
    locales/
      types.ts            # Locale 인터페이스
      ko.ts               # 한국어 헤지, 조사, 가짜 권위
      en.ts               # 영어 헤지, filler words
    ai/                   # optional (@google/generative-ai peer dep)
      translate.ts        # LLM 기반 번역/리라이트
  tests/
    fixtures/             # 실제 AI 생성 HTML 샘플
    core/
      analyzer.test.ts
      detector.test.ts
      fixer.test.ts
      humanizer.test.ts
      html.test.ts
    presets/
      gemini.test.ts
    locales/
      ko.test.ts
    integration/
      pipeline.test.ts    # createPolisher() E2E
```

### 3-Layer 아키텍처

Layer 1: Universal (LLM 무관)
  - 문장 길이 균일성 검증 (stdDev >= 2.5)
  - 고아 구두점 수정
  - 팬텀 참조 탐지
  - 중복 섹션 탐지
  - 제목-본문 일관성
  - HTML 구조 휴머나이징

Layer 2: LLM Preset (모델별 버릇)
  - presets/gemini.ts -> 186개 패턴 (현재 프로덕션)
  - presets/gpt.ts -> "delve", "nuanced", "landscape", "Let's dive in"
  - presets/claude.ts -> "straightforward", "I'd be happy to"
  - presets/llama.ts -> "as an AI language model"
  - 'auto' 모드: 텍스트 분석으로 LLM 자동 추정

Layer 3: Locale (언어별 패턴)
  - locales/ko.ts -> 한국어 헤지 표현, 가짜 권위, 조사 오류
  - locales/en.ts -> 영어 헤지, filler words
  - locales/ja.ts, zh.ts -> 커뮤니티 기여 (v2+)

## Public API

```ts
// 1. 기본 사용
import { createPolisher } from 'llm-polish'

const polisher = createPolisher({
  preset: 'gemini',
  locale: 'ko',
})

const result = polisher.process(aiGeneratedHTML)
// { html, report: { score, issues[], fixes[] } }

// 2. 분석만 (수정 없이)
const report = polisher.analyze(aiGeneratedHTML)
// { score, bannedTokens[], phantomRefs[], duplicates[], ... }

// 3. 자동 감지
createPolisher({ preset: 'auto', locale: 'auto' })

// 4. 복수 프리셋 합성
createPolisher({ preset: ['gemini', 'gpt'], locale: 'ko' })

// 5. 커스텀 프리셋
import { definePreset } from 'llm-polish'

const myPreset = definePreset({
  name: 'my-model',
  bannedTokens: ['synergize', '혁신적인'],
  patterns: [
    { match: /As an AI/gi, replace: '' },
  ],
})

createPolisher({ preset: [myPreset], locale: 'ko' })

// 6. 커스텀 로케일
import { defineLocale } from 'llm-polish'

const ja = defineLocale({
  name: 'ja',
  hedgingPatterns: [...],
  particleRules: [...],
})

// 7. 세밀한 제어
createPolisher({
  preset: 'gemini',
  locale: 'ko',
  rules: {
    disable: ['emojiRemoval'],
    sentenceVariance: { minStdDev: 3.0 },
    bannedTokens: { extra: ['추가단어'] },
  },
})

// 8. AI 기능 (optional peer dep)
import { withAI } from 'llm-polish/ai'

const polisher = createPolisher({
  preset: 'gemini',
  plugins: [withAI({ apiKey: '...' })],
})
```

## Core Interfaces

```ts
interface PolishResult {
  html: string
  report: AnalysisReport
}

interface AnalysisReport {
  score: number                    // 0-100 종합 점수
  passed: boolean                  // score >= threshold
  issues: Issue[]                  // 발견된 문제들
  fixes: Fix[]                     // 적용된 수정들
  metrics: {
    sentenceVariance: number
    bannedTokenCount: number
    phantomRefCount: number
    duplicateCount: number
    structuralRatio: number
  }
}

interface Issue {
  rule: string                     // 'bannedToken' | 'phantomRef' | ...
  severity: 'error' | 'warning' | 'info'
  message: string
  line?: number
  suggestion?: string
}

interface Fix {
  rule: string
  original: string
  replacement: string
  line?: number
}

interface Preset {
  name: string
  bannedTokens: string[]
  patterns: SmellPattern[]
  detect?: (text: string) => number  // 0-1 confidence (auto mode)
}

interface SmellPattern {
  match: RegExp | string
  replace: string | ((match: string) => string)
  priority?: 'p0' | 'p1' | 'p2'
  description?: string
}

interface Locale {
  name: string
  hedgingPatterns: SmellPattern[]
  particleRules?: ParticleRule[]
  detect?: (text: string) => number  // 0-1 confidence (auto mode)
}
```

## TDD Work Phases

### Phase 1: 테스트 케이스 수확 (1일)
- 기존 acrossclick_api 코드에서 AI HTML 샘플 추출
- 함수별 입력/출력 스냅샷 생성
- 엣지 케이스 정리 (빈 문자열, 한국어만, 영어만, 혼합)

### Phase 2: core 모듈 TDD (2-3일)
- analyzer -> detector -> fixer -> humanizer -> html
- 각 모듈 Red -> Green -> Refactor

### Phase 3: preset/locale 시스템 (1일)
- definePreset / defineLocale
- gemini preset (186패턴 마이그레이션)
- ko locale

### Phase 4: 통합 API (1일)
- createPolisher() 파이프라인
- auto 감지 로직
- E2E 테스트

### Phase 5: 빌드/퍼블리시 (0.5일)
- tsup (ESM + CJS)
- README + 예제
- npm publish

## Source Reference

분리 원본: acrossclick_api/lib/machinegun/

| 원본 파일 | LOC | 대상 모듈 |
|---|---|---|
| text-quality-validator.ts | 1,087 | core/analyzer, core/detector |
| html-normalizer.ts | 343 | core/html |
| humanizer.ts | 292 | core/humanizer |
| multi-channel/editor.ts | 722 | core/fixer, presets/gemini |
| prompts.ts | 637 | presets/*, locales/* |
| validation-loop.ts | 117 | (참고용, 직접 포함 안 함) |

## Decisions Log

1. 패키지명: `llm-polish`
2. 배포 형태: 단일 패키지 + 플러그인 아키텍처 (서브 엔트리포인트)
3. 구현 전략: B + TDD (클린룸 + 기존 코드에서 테스트 수확)
4. 포지셔닝: "AI Content Quality Toolkit"
5. 필수 의존성: cheerio만
6. 선택 의존성: @google/generative-ai (peer dep)
7. 라이선스: MIT
