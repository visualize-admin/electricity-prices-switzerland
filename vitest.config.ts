import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      // Unit tests project
      {
        test: {
          name: "unit",
          include: ["**/*.spec.{ts,tsx,js,jsx}", "**/*.test.{ts,tsx,js,jsx}"],
          exclude: [
            "**/node_modules/**",
            "e2e/**",
            "**/*.integration.spec.{ts,tsx,js,jsx}",
            "**/*.integration.test.{ts,tsx,js,jsx}",
          ],
        },
        resolve: {
          alias: {
            "@": "/src",
            src: "/src",
          },
        },
        assetsInclude: ["**/*.xml"],
      },
      // Integration tests project
      {
        test: {
          name: "integration",
          include: [
            "**/*.integration.spec.{ts,tsx,js,jsx}",
            "**/*.integration.test.{ts,tsx,js,jsx}",
          ],
          exclude: ["**/node_modules/**", "e2e/**"],
          // Integration tests might need longer timeouts
          testTimeout: 30000,
        },
        resolve: {
          alias: {
            "@": "/src",
            src: "/src",
          },
        },
        assetsInclude: ["**/*.xml"],
      },
    ],
  },
});
