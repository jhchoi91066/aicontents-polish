# llm-polish

> AI 생성 콘텐츠 품질 툴킷 — LLM 생성 텍스트의 아티팩트를 감지, 분석, 제거하는 TypeScript 라이브러리

## Architecture

[ARCHITECTURE.md](ARCHITECTURE.md) — 도메인 맵, 레이어 의존 방향, 처리 파이프라인

## Documentation

- [Design Docs](docs/design-docs/index.md) — 아키텍처 결정과 핵심 원칙
- [Execution Plans](docs/exec-plans/) — 활성/완료 작업 계획
- [Product Specs](docs/product-specs/index.md) — 제품 사양
- [References](docs/references/) — 외부 라이브러리 LLM용 문서

## Domain Guides

- [Product Sense](docs/PRODUCT-SENSE.md) — 제품 사고, 사용자 멘탈 모델

## Quality & Planning

- [Quality Score](docs/QUALITY-SCORE.md) — 도메인별 품질 등급
- [Code Review](docs/CODE-REVIEW.md) — 코드 리뷰 기준과 체크리스트
- [Plans](docs/PLANS.md) — 계획 프로세스 규칙
- [Tech Debt](docs/exec-plans/tech-debt-tracker.md) — 기술 부채 추적

## Project Structure

```
src/
├── core/          ← 핵심 파이프라인 (polisher, analyzer, detector, fixer, html, humanizer)
├── presets/       ← LLM별 패턴 (gemini, gpt, claude, llama)
├── locales/       ← 언어별 패턴 (ko, en)
├── ai/            ← 선택적 AI 플러그인 (Gemini API)
├── index.ts       ← 메인 export
└── types.ts       ← 모든 인터페이스 정의
tests/             ← src/ 구조 미러링 + fixtures/ + integration/
```

## Quick Rules

1. **의존 방향 단방향**: `Types → Utils → Core Modules → Polisher`. 하위가 상위를 import 금지
2. **정규식 사전 컴파일**: `/g` 플래그 정규식은 모듈 레벨에서 생성, 런타임 재생성 금지. `lastIndex` 처리 주의
3. **cheerio 옵션**: HTML 파싱 시 항상 `{ xmlMode: false }` 사용
4. **SmellPattern 필수 필드**: 새 패턴에 `priority`(p0/p1/p2)와 `description` 포함
5. **Conventional Commits**: `feat`, `fix`, `perf`, `refactor` 등 접두사 사용 (commitlint 강제)

<!-- MANUAL: Notes below this line are preserved on regeneration -->
