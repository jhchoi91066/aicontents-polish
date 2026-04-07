/**
 * Shared constants and utilities for core modules.
 * Single source of truth for Korean character detection patterns.
 */

/**
 * Matches Korean syllable blocks only (AC00–D7A3).
 * Used for counting Korean characters in mixed-language content detection.
 */
export const KOREAN_SYLLABLE_REGEX: RegExp = /[\uAC00-\uD7A3]/g;

/**
 * Matches all Korean characters: syllables, Jamo, and compatibility Jamo.
 * Used for presence checks and ratio calculations.
 */
export const KOREAN_FULL_REGEX: RegExp = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g;
