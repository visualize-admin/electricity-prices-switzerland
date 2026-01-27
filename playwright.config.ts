import { createArgosReporterOptions } from "@argos-ci/playwright/reporter";
import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

import { createMetricsReporterOptions } from "./src/metrics/playwright-reporter";

loadEnvConfig(process.cwd(), true);

const getHttpCredentialsFromEnv = () => {
  const usernamePassword = process.env.BASIC_AUTH_CREDENTIALS;
  if (!usernamePassword) {
    return undefined;
  }
  const [username, password] = usernamePassword.split(":");
  if (!username || !password) {
    throw new Error(
      "BASIC_AUTH_CREDENTIALS environment variable must be in the format 'username:password'"
    );
  }
  return { username, password };
};

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./src/e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["list"],
    ["html"],
    [
      "@argos-ci/playwright/reporter",
      createArgosReporterOptions({
        uploadToArgos: !!process.env.CI,
        buildName: {
          values: ["storybook", "app"],
          get: (test) =>
            test.tags.includes("@storybook") ? "storybook" : "app",
        },
      }),
    ],
    [
      "./src/metrics/playwright-reporter.ts",
      createMetricsReporterOptions({
        githubToken: process.env.GITHUB_TOKEN,
        deploymentUrl: process.env.PLAYWRIGHT_BASE_URL,
        enabled: !!process.env.CI,
        artifactPath: "test-results/graphql-metrics.json",
      }),
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        httpCredentials: getHttpCredentialsFromEnv(),
        extraHTTPHeaders: {
          "x-vercel-skip-toolbar": "1",
        },
      },
    },

    // },
  ],
});
