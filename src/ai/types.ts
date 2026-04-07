export interface AIProvider {
	translate(text: string, to: string): Promise<string>;
	rewrite(text: string, locale?: string): Promise<string>;
}

export function defineProvider(impl: AIProvider): AIProvider {
	return impl;
}
