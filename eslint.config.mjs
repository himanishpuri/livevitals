import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // New in eslint-config-next 16: flags legitimate localStorage/matchMedia
    // hydration effects. Those files are restructured in later phases.
    rules: { "react-hooks/set-state-in-effect": "warn" },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "realtime/**",
  ]),
]);
