# Architecture — llm-polish

> AI 생성 콘텐츠 품질 툴킷: LLM 생성 텍스트의 아티팩트를 감지, 분석, 제거하는 TypeScript 라이브러리

## 도메인 맵

```
┌─────────────────────────────────────────────────────┐
│                     Public API                       │
│   createPolisher(options) → { process, analyze }     │
│   llm-polish/ai → { withAI, translateToEnglish, ... }│
├─────────────────────────────────────────────────────┤
│                  Orchestration Layer                  │
│              core/polisher.ts                         │
│   Preset/Locale 해석 → 분석 → 수정 → 인간화 파이프라인  │
├──────────┬──────────┬──────────┬─────────────────────┤
│ Analysis │ Detection│ Fixing   │ HTML Transform      │
│ analyzer │ detector │ fixer    │ html + humanizer    │
├──────────┴──────────┴──────────┴─────────────────────┤
│                  Configuration Layer                  │
│         presets/ (gemini, gpt, claude, llama)         │
│         locales/ (ko, en)                             │
├─────────────────────────────────────────────────────┤
│                  Foundation Layer                     │
│         types.ts — 모든 인터페이스 정의                  │
│         core/utils.ts — 한국어 정규식 상수              │
└─────────────────────────────────────────────────────┘
```

## 의존 방향

```
Types → Utils → Analyzer/Detector/Fixer/HTML → Humanizer → Polisher
                                                              ↑
                                                    Presets + Locales
```

**규칙**: 하위 레이어가 상위 레이어를 import해서는 안 됨. 모든 모듈은 `types.ts`만 참조.

## 핵심 모듈

| 모듈 | 역할 | 주요 의존성 |
|:--|:--|:--|
| `core/polisher.ts` | 파이프라인 오케스트레이션, 팩토리 패턴 | 모든 core 모듈 + presets/locales |
| `core/analyzer.ts` | 금지 토큰 감지, 문장 분산도 분석, 구두점 검사 | types |
| `core/detector.ts` | 유령 참조, 중복 콘텐츠, MDX 문법 검증 | cheerio, utils |
| `core/fixer.ts` | 패턴 기반 텍스트 수정 (이모지, 해시태그, 마크다운 볼드) | types, utils |
| `core/html.ts` | HTML 구조 변환 (제목 계층, 키워드 스터핑, SEO) | cheerio |
| `core/humanizer.ts` | CSS 클래스 무작위화, alt 텍스트 정규화, Tailwind 지문 제거 | cheerio, html |
| `presets/*` | LLM별 SmellPattern 정의 + 자동 감지 함수 | types |
| `locales/*` | 언어별 hedging 패턴 + 조사 규칙 + 자동 감지 | types |
| `ai/index.ts` | 선택적 AI 플러그인 (Gemini API: 번역, 리라이트) | @google/generative-ai (peer) |

## 처리 파이프라인

```
Input HTML
  ↓
1. Preset/Locale 해석 ("auto" → detect 함수로 자동 선택)
  ↓
2. 분석 (금지 토큰 + 문장 분산도 + 유령 참조 + 중복 + MDX)
  ↓
3. 냄새 패턴 적용 (p0 → p1 → p2 우선순위)
  ↓
4. 이모지 제거
  ↓
5. HTML 수정 (제목 계층 + 키워드 스터핑 + 가짜 이미지 + 깨진 링크)
  ↓
6. 인간화 (클래스 무작위화 + alt 정규화 + Tailwind 지문 제거 + colspan)
  ↓
Output: { html, report: { score, issues, fixes, metrics } }
```

## Export 구조

| 경로 | 내보내는 것 | 의존성 |
|:--|:--|:--|
| `llm-polish` | `createPolisher`, `defineLocale`, `definePreset`, 타입들 | cheerio |
| `llm-polish/ai` | `withAI`, `translateToEnglish`, `rewriteContent` | @google/generative-ai (optional peer) |

## 테스트 구조

테스트는 `tests/`에서 소스 구조를 미러링:
- `tests/core/` — 각 core 모듈별 단위 테스트
- `tests/presets/`, `tests/locales/` — 프리셋/로케일 테스트
- `tests/ai/` — AI 플러그인 테스트
- `tests/integration/` — 전체 파이프라인 테스트
- `tests/fixtures/` — 테스트 데이터

## 빌드

- **tsup**: ESM + CJS 듀얼 빌드 + DTS 생성
- **두 개 엔트리포인트**: `src/index.ts` (메인), `src/ai/index.ts` (AI 플러그인)
- **Biome**: 린팅 + 포맷팅 (탭 들여쓰기, 100자 너비)
- **Vitest**: v8 커버리지 (80% threshold)
- **Husky + commitlint**: Conventional Commits 강제
