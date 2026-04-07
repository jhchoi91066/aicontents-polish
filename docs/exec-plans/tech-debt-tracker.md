# Tech Debt Tracker

| ID | 영역 | 설명 | 상태 | 해결 방법 |
|:--|:--|:--|:--|:--|
| TD-001 | core/humanizer | `pickVariant`에서 `Math.random()` 사용 | **해결됨** | `hashString()` 기반 결정적 선택으로 전환 |
| TD-002 | core/polisher | `analyzeSentenceVariance` 중복 호출 | **해결됨** | 한 번 호출 후 결과를 전달하는 구조로 변경 |
| TD-003 | core/html | `enforceHeadingHierarchy`에서 regex HTML 파싱 | **해결됨** | cheerio 기반으로 전환 |
| TD-004 | ai/ | Gemini 하드코딩, 확장 불가 | **해결됨** | `AIProvider` 인터페이스 + `defineProvider` + `geminiProvider` 추상화 |
| TD-005 | presets/gemini | detect 함수 내 무의미한 threshold guard | **해결됨** | `*_MIN_MATCHES`로 이름 변경, `> 0` guard 제거 |
