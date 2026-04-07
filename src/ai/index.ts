export type { GeminiProviderOptions } from "./gemini";
export { geminiProvider } from "./gemini";
export type { AIProvider } from "./types";
export { defineProvider } from "./types";

import type { Plugin } from "../types";
import type { AIProvider } from "./types";

export function withAI(provider: AIProvider): Plugin {
	return {
		name: "ai",
		provider,
	};
}
