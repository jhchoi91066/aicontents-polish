# Backend Agent Result

## Status
DONE

## Summary
Implemented `createPolisher` in `src/core/polisher.ts` and filled in `tests/integration/pipeline.test.ts` with 20 real tests. All 163 tests (9 test files) pass. TypeScript type check (`npx tsc --noEmit`) passes with no errors.

## Files Changed

- `/Volumes/gahyun_ex/projects/llm-polish/src/core/polisher.ts` — Full implementation replacing the stub
- `/Volumes/gahyun_ex/projects/llm-polish/tests/integration/pipeline.test.ts` — 20 integration tests replacing the comment-only skeleton

## Implementation Details

### src/core/polisher.ts

**Preset Resolution**
- String names (`'gemini'`, `'gpt'`, `'claude'`, `'llama'`) resolve via `PRESET_REGISTRY`
- `'auto'` calls each preset's `detect()` and picks highest confidence
- String arrays resolve each entry then merge via `mergePresets()`
- Preset objects / Preset arrays used directly / merged

**Locale Resolution**
- String names (`'ko'`, `'en'`) resolve via `LOCALE_REGISTRY`
- `'auto'` calls each locale's `detect()` and picks highest confidence
- Locale objects used directly

**`analyze(html)`**
1. Resolves preset and locale
2. Builds merged banned token list (BANNED_TOKENS base + preset.bannedTokens + rules.bannedTokens.extra)
3. Runs `detectBannedTokens`, `analyzeSentenceVariance` (uses `rules.sentenceVariance.minStdDev` when set)
4. Runs `detectPhantomReferences` (isEnglish = locale.name === 'en')
5. Runs `detectDuplicateContent`, `checkForDownsides`, `validateMdxSyntax`
6. Computes score: 100 - (errors * 15 + warnings * 5 + info * 1), clamped 0-100
7. Returns `AnalysisReport` with score, passed, issues, fixes, metrics

**`process(html)`**
1. Calls `analyze()` to get report
2. `applySmellPatterns` with merged preset.patterns + locale.hedgingPatterns
3. `removeEmojis('none')` unless `rules.disable` includes `'emojiRemoval'`
4. `enforceHeadingHierarchy` unless `'headingHierarchy'` disabled
5. `removeKeywordStuffingSections`, `removeFakeImages`, `removeBrokenInternalLinks`, `removePostSourcesContent`
6. `humanizeGeneratedHTML` unless `'humanize'` disabled
7. Returns `{ html, report }` with merged fixes

## Acceptance Criteria Checklist

- [x] `createPolisher` returns `{ process, analyze }`
- [x] `analyze()` returns `AnalysisReport` (score, passed, issues, fixes, metrics) without mutating input
- [x] `process()` returns `PolishResult` with processed HTML and report
- [x] Preset string names resolve via registry (`gemini`, `gpt`, `claude`, `llama`)
- [x] `preset: 'auto'` detects LLM by calling each preset's `detect()`
- [x] `locale: 'auto'` detects language by calling each locale's `detect()`
- [x] Preset composition (`string[]`, `Preset[]`) merges `bannedTokens` and `patterns`
- [x] Custom `definePreset` objects accepted directly
- [x] `rules.disable` skips named steps (`emojiRemoval`, `headingHierarchy`, `humanize`)
- [x] `rules.sentenceVariance.minStdDev` overrides default threshold (2.5)
- [x] `rules.bannedTokens.extra` appended to detection list
- [x] Score range 0-100, computed from issue severity penalties
- [x] All 163 tests pass (`npx vitest run`)
- [x] TypeScript strict mode: `npx tsc --noEmit` clean
