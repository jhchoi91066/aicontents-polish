# Auto Detection 설계

## 결정 배경

사용자가 LLM 종류나 언어를 모르는 경우에도 적절한 프리셋/로케일을 자동 적용해야 한다.

## 설계

### 프리셋 자동 감지

각 프리셋의 `detect(text)` 함수가 0~1 사이 점수를 반환.
가장 높은 점수의 프리셋이 선택된다. 기본 fallback은 `gemini`.

- **gemini**: 한국어 결론부터/과장/메타내러티브 토큰 매칭
- **gpt**: 영어 AI 토큰(delve, nuanced 등) 매칭
- **claude**: 영어 sycophantic/hedging 패턴 매칭
- **llama**: AI identity disclaimer 패턴 매칭

### 로케일 자동 감지

한국어 문자 비율(30% 이상이면 한국어)로 판단.
영어 fallback.

## 제약 사항

- 짧은 텍스트에서는 감지 정확도가 낮을 수 있음 <!-- TODO: confirm this rule -->
- 혼합 언어 콘텐츠에서 로케일 감지 한계
