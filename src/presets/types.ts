import type { Preset, SmellPattern } from "../types";

export interface PresetDefinition {
	name: string;
	bannedTokens?: string[];
	patterns?: SmellPattern[];
	detect?: (text: string) => number;
}

export function definePreset(definition: PresetDefinition): Preset {
	return {
		name: definition.name,
		bannedTokens: definition.bannedTokens ?? [],
		patterns: definition.patterns ?? [],
		detect: definition.detect,
	};
}
