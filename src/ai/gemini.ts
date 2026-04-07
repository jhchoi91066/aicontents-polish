import type { AIProvider } from "./types";

export interface GeminiProviderOptions {
	apiKey: string;
	model?: string;
}

const DEFAULT_MODEL = "gemini-2.0-flash";

export function geminiProvider(options: GeminiProviderOptions): AIProvider {
	const model = options.model ?? DEFAULT_MODEL;

	async function getModel() {
		const { GoogleGenerativeAI } = await import("@google/generative-ai");
		const genAI = new GoogleGenerativeAI(options.apiKey);
		return genAI.getGenerativeModel({ model });
	}

	return {
		async translate(text: string, to: string): Promise<string> {
			const genModel = await getModel();
			const prompt = `Translate the following text to ${to}. Only return the translated text, no explanations:\n\n${text}`;
			const result = await genModel.generateContent(prompt);
			return result.response.text();
		},

		async rewrite(text: string, locale?: string): Promise<string> {
			const genModel = await getModel();
			const lang = locale === "ko" ? "Korean" : "English";
			const prompt = `Rewrite the following ${lang} text to sound more natural and human-written. Preserve the meaning but remove AI-like patterns. Only return the rewritten text:\n\n${text}`;
			const result = await genModel.generateContent(prompt);
			return result.response.text();
		},
	};
}
