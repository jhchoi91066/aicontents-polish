# llm-polish

AI Content Quality Toolkit — detect, analyze, and remove AI-generated text artifacts.

[한국어 문서 (Korean)](/docs/README.ko.md)

## Features

- **126 AI smell patterns** across 4 LLM presets (Gemini, GPT, Claude, Llama)
- **42 banned tokens** detection (EN 23 + KO 19)
- **Multilingual** — Korean and English locale support with auto-detection
- **Analyze-only mode** — inspect without modifying
- **Plugin architecture** — define custom presets and locales
- **Zero runtime dependencies** except cheerio

## Install

```bash
npm install llm-polish
# or
pnpm add llm-polish
```

## Quick Start

```ts
import { createPolisher } from "llm-polish";

const polisher = createPolisher({
  preset: "gemini",
  locale: "ko",
});

// Process: analyze + fix + humanize
const { html, report } = polisher.process(aiGeneratedHTML);
console.log(report.score); // 0-100
console.log(report.issues); // detected problems
console.log(report.fixes); // applied fixes

// Analyze only (no modifications)
const report = polisher.analyze(aiGeneratedHTML);
```

## Presets

| Preset | Patterns | Banned Tokens | Description |
|--------|----------|---------------|-------------|
| `gemini` | 47 | — | Korean AI patterns: conclusion intros, exaggeration, fake authority, hedging stats |
| `gpt` | 25 | 10 | English AI tokens: delve, nuanced, leverage + conclusion fillers |
| `claude` | 9 | 5 | Sycophantic openers, context-restating, hedging qualifiers |
| `llama` | 7 | 4 | AI identity disclaimers, capability disclaimers |

### Auto Detection

```ts
const polisher = createPolisher({ preset: "auto", locale: "auto" });
// Automatically detects LLM and language from content
```

### Multiple Presets

```ts
const polisher = createPolisher({
  preset: ["gemini", "gpt"],
  locale: "ko",
});
```

### Custom Preset

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

## Locales

| Locale | Hedging Patterns | Particle Rules | Description |
|--------|-----------------|----------------|-------------|
| `ko` | 22 | 1 | Korean hedging, filler words, orphaned particle detection |
| `en` | 14 | — | English hedging, conclusion fillers, meta-commentary |

### Custom Locale

```ts
import { defineLocale } from "llm-polish";

const jaLocale = defineLocale({
  name: "ja",
  hedgingPatterns: [
    { match: "基本的に", replace: "" },
  ],
});
```

## Rules Override

```ts
const polisher = createPolisher({
  preset: "gemini",
  locale: "ko",
  rules: {
    disable: ["emojiRemoval", "humanize"],
    sentenceVariance: { minStdDev: 3.0 },
    bannedTokens: { extra: ["additional-word"] },
  },
});
```

## Analysis Report

```ts
interface AnalysisReport {
  score: number;        // 0-100
  passed: boolean;      // true if no errors
  issues: Issue[];      // detected problems
  fixes: Fix[];         // applied fixes
  metrics: {
    sentenceVariance: number;
    bannedTokenCount: number;
    phantomRefCount: number;
    duplicateCount: number;
  };
}
```

## What It Detects

| Category | Examples |
|----------|---------|
| **Banned Tokens** | "delve", "elevate", "tapestry", "혁신적인", "필수불가결" |
| **Phantom References** | "제 영상에서", "in my previous video" |
| **Meta-narrative** | "이번 글에서는", "In this article, we'll" |
| **Fake Authority** | "IT직장인으로서", "3년 동안" |
| **Unverified Stats** | "90% 이상의 여행자가 만족" → "많은 여행자들이 만족하는 편" |
| **Sentence Uniformity** | stdDev < 2.5 word count per sentence |
| **Duplicate Content** | Repeated headings, multiple Sources sections |
| **MDX Syntax** | Unbalanced code blocks, curly braces outside code |

## What It Fixes

| Category | Action |
|----------|--------|
| **AI Smell Patterns** | 126 regex-based pattern replacements |
| **Heading Hierarchy** | Enforce H1→H2→H3 (no skips, single H1) |
| **Keyword Stuffing** | Remove "Related Topics" lists with short items |
| **Fake Images** | Remove placeholder/example.com images |
| **WordPress Artifacts** | Remove wp-admin, wp-content links |
| **HTML Humanization** | Randomize CSS classes, normalize alt text, remove Tailwind fingerprints |
| **Boolean Attributes** | `itemscope=""` → `itemscope` |
| **Semantic Classes** | Add data-table, quote-block classes |
| **Microdata** | Add Schema.org markup (Article, FAQ, HowTo, Review) |

## Tech Stack

- TypeScript 6.0 (strict)
- Node.js 22+
- cheerio (HTML parsing)
- ESM + CJS dual build (tsup)

## Development

```bash
pnpm install
pnpm test          # run tests (246 tests)
pnpm run typecheck # tsc --noEmit
pnpm run lint      # biome check
pnpm run build     # tsup (ESM + CJS + DTS)
```

## License

[MIT](./LICENSE)
