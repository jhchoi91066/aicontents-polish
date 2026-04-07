export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"type-enum": [
			2,
			"always",
			["feat", "fix", "refactor", "docs", "test", "chore", "style", "perf"],
		],
		"subject-max-length": [2, "always", 72],
		"subject-case": [2, "always", "lower-case"],
		"subject-full-stop": [2, "never", "."],
	},
};
