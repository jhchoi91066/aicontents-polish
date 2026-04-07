import { describe, expect, it, vi } from "vitest";
import type { AIProvider } from "../../src/ai/index";
import { defineProvider, geminiProvider, withAI } from "../../src/ai/index";

describe("ai/types", () => {
	describe("defineProvider", () => {
		it("should return the same provider implementation", () => {
			const impl: AIProvider = {
				translate: vi.fn(),
				rewrite: vi.fn(),
			};
			const provider = defineProvider(impl);
			expect(provider).toBe(impl);
		});

		it("should preserve translate and rewrite methods", () => {
			const provider = defineProvider({
				translate: async (text, to) => `${text} → ${to}`,
				rewrite: async (text) => text,
			});
			expect(typeof provider.translate).toBe("function");
			expect(typeof provider.rewrite).toBe("function");
		});
	});
});

describe("ai/gemini", () => {
	describe("geminiProvider", () => {
		it("should return an AIProvider with translate and rewrite", () => {
			const provider = geminiProvider({ apiKey: "test-key" });
			expect(typeof provider.translate).toBe("function");
			expect(typeof provider.rewrite).toBe("function");
		});
	});
});

describe("ai/index", () => {
	describe("withAI", () => {
		it("should return a Plugin with name 'ai'", () => {
			const mockProvider: AIProvider = {
				translate: vi.fn(),
				rewrite: vi.fn(),
			};
			const plugin = withAI(mockProvider);
			expect(plugin.name).toBe("ai");
		});

		it("should include the provider in the plugin", () => {
			const mockProvider: AIProvider = {
				translate: vi.fn(),
				rewrite: vi.fn(),
			};
			const plugin = withAI(mockProvider);
			expect(plugin.provider).toBe(mockProvider);
		});
	});

	describe("exports", () => {
		it("should export defineProvider as a function", () => {
			expect(typeof defineProvider).toBe("function");
		});

		it("should export geminiProvider as a function", () => {
			expect(typeof geminiProvider).toBe("function");
		});

		it("should export withAI as a function", () => {
			expect(typeof withAI).toBe("function");
		});
	});
});
