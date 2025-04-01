import { defineConfig } from "vitest/config";

export default defineConfig({
  assetsInclude: ["**/*.xml"],
  test: {
    // include: ["**/*.spec.tsx", "**/*.test.ts", "**/*.test.js"],
    exclude: ["**/node_modules/**", "e2e/**"],
  },
});
