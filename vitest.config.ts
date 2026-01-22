import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const env = loadEnv("development", process.cwd(), ["ADMIN_"]);

export default defineConfig({
  test: {
    env: {
      ...env,
      ...Object.fromEntries(
        Object.entries({
          ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
          ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET,
        }).filter(([_key, value]) => value !== undefined)
      ),
    },
    projects: [
      // Unit tests project
      {
        test: {
          name: "unit",
          include: ["**/*.spec.{ts,tsx,js,jsx}", "**/*.test.{ts,tsx,js,jsx}"],
          exclude: [
            "**/node_modules/**",
            "src/e2e/**",
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
          exclude: ["**/node_modules/**", "src/e2e/**"],
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
