import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    sourcemap: true,
  },
  {
    entry: ["src/ai/index.ts"],
    outDir: "dist/ai",
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    external: ["@google/generative-ai"],
  },
]);
