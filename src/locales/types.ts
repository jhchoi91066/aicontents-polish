import type { Locale, ParticleRule, SmellPattern } from "../types";

export interface LocaleDefinition {
	name: string;
	hedgingPatterns?: SmellPattern[];
	particleRules?: ParticleRule[];
	phantomReferencePatterns?: RegExp[];
	downsidePatterns?: RegExp[];
	detect?: (text: string) => number;
}

export function defineLocale(definition: LocaleDefinition): Locale {
	return {
		name: definition.name,
		hedgingPatterns: definition.hedgingPatterns ?? [],
		particleRules: definition.particleRules ?? [],
		phantomReferencePatterns: definition.phantomReferencePatterns ?? [],
		downsidePatterns: definition.downsidePatterns ?? [],
		detect: definition.detect,
	};
}
