# Quality Score

## 도메인별 품질 등급

| 도메인 | 등급 | 근거 |
|:--|:--|:--|
| `core/analyzer` | A | 단위 테스트 완비, 명확한 인터페이스 |
| `core/detector` | A | cheerio 기반 DOM 파싱, 테스트 존재 |
| `core/fixer` | A | 우선순위 기반 패턴 적용, 사전 컴파일 정규식 |
| `core/html` | B+ | 일부 함수가 regex로 HTML 파싱 (TD-003) |
| `core/humanizer` | B | 비결정적 `Math.random()` 사용 (TD-001) |
| `core/polisher` | A- | 분산도 중복 계산 (TD-002) |
| `presets/` | A | 프리셋별 detect 함수와 패턴 정의 완비 |
| `locales/` | A | ko/en 감지 로직 명확 |
| `ai/` | B- | 커버리지 제외, Gemini만 지원 (TD-004) |
| **테스트** | A | 246개 테스트, 80% 커버리지 threshold |
| **빌드/린트** | A | tsup + Biome + commitlint + Husky 완비 |

## 등급 기준

- **A**: 테스트 완비, 명확한 설계, 기술 부채 없음
- **B**: 동작하지만 개선 여지 있음
- **C**: 주의 필요
- **D**: 리팩토링 필요

## 추적 이력

| 날짜 | 변경 | 비고 |
|:--|:--|:--|
| 2026-03-30 | 초기 평가 | deepinit 자동 생성 |
