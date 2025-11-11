// When running outside CI, pause Playwright when a test failed.

import { test } from "src/e2e/common";

export default () => {
  // See: https://github.com/microsoft/playwright/issues/10132
  test.afterEach(async ({ page }, testInfo) => {
    if (!process.env.CI && testInfo.status !== testInfo.expectedStatus) {
      process.stderr.write(
        `❌ ❌ PLAYWRIGHT TEST FAILURE ❌ ❌\n${
          testInfo.error?.stack || testInfo.error
        }\n`
      );
      testInfo.setTimeout(0);
      await page.pause();
    }
  });
};
