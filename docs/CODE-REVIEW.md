# Code Review Standards

## 리뷰 체크리스트

### 필수 (모든 PR)
- [ ] TypeScript strict 모드 통과 (`pnpm run typecheck`)
- [ ] Biome 린트 통과 (`pnpm run lint`)
- [ ] 테스트 통과 (`pnpm test`)
- [ ] Conventional Commits 메시지 형식
- [ ] 의존 방향 위반 없음 (하위 → 상위 import 금지)

### 패턴 관련
- [ ] 새 SmellPattern에 `priority` 설정 (p0/p1/p2)
- [ ] 새 패턴에 `description` 포함
- [ ] 정규식은 모듈 레벨에서 사전 컴파일
- [ ] `/g` 플래그 정규식의 `lastIndex` 처리 확인

### HTML 처리
- [ ] cheerio 사용 시 `{ xmlMode: false }` 옵션
- [ ] DOM 조작 후 `$.html()` 반환
- [ ] 이미지/링크 제거 시 부모 요소 확인

### 한국어 지원
- [ ] 한국어 문자 범위 정확성 (`\uAC00-\uD7AF`)
- [ ] 조사 처리 로직 검증
- [ ] 한/영 혼합 텍스트 테스트 케이스

## 심각도 레벨

| 레벨 | 기준 | 예시 |
|:--|:--|:--|
| **Blocker** | 빌드 실패, 런타임 에러, 데이터 손실 | 정규식 무한 루프, cheerio 파싱 에러 |
| **Major** | 잘못된 동작, 성능 문제 | 패턴 미적용, 중복 DOM 파싱 |
| **Minor** | 코드 품질, 일관성 | 네이밍 규칙 위반, 불필요한 타입 단언 |
| **Nit** | 스타일, 선호도 | 주석 누락, 변수명 개선 |

## 자동 승인 조건

- 테스트만 추가/수정하는 PR
- 문서만 변경하는 PR
- 의존성 minor/patch 버전 업데이트

## 수동 리뷰 필수

- `core/polisher.ts` 변경 (메인 파이프라인)
- 새로운 프리셋 또는 로케일 추가
- `types.ts` 인터페이스 변경 (Breaking change 가능)
- `ai/` 모듈 변경 (외부 API 호출)
