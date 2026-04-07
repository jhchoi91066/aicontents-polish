export interface PolisherOptions {
	preset: PresetInput;
	locale?: LocaleInput;
	rules?: RulesOverride;
	plugins?: Plugin[];
}

export type PresetInput = string | string[] | Preset | Preset[] | "auto";
export type LocaleInput = string | Locale | "auto";

export interface PolishResult {
	html: string;
	report: AnalysisReport;
}

export interface AnalysisReport {
	score: number;
	passed: boolean;
	issues: Issue[];
	fixes: Fix[];
	metrics: QualityMetrics;
}

export interface QualityMetrics {
	sentenceVariance: number;
	bannedTokenCount: number;
	phantomRefCount: number;
	duplicateCount: number;
	structuralRatio: number;
}

export interface Issue {
	rule: string;
	severity: "error" | "warning" | "info";
	message: string;
	line?: number;
	suggestion?: string;
}

export interface Fix {
	rule: string;
	original: string;
	replacement: string;
	line?: number;
}

export interface SmellPattern {
	match: RegExp | string;
	replace: string | ((match: string) => string);
	priority?: "p0" | "p1" | "p2";
	description?: string;
}

export interface Preset {
	name: string;
	bannedTokens: string[];
	patterns: SmellPattern[];
	detect?: (text: string) => number;
}

export interface ParticleRule {
	pattern: RegExp;
	description: string;
}

export interface Locale {
	name: string;
	hedgingPatterns: SmellPattern[];
	particleRules?: ParticleRule[];
	detect?: (text: string) => number;
}

export interface RulesOverride {
	disable?: string[];
	sentenceVariance?: { minStdDev?: number };
	bannedTokens?: { extra?: string[] };
}

export interface Plugin {
	name: string;
	[key: string]: unknown;
}
