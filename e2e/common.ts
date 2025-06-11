/* eslint-disable react-hooks/rules-of-hooks */

import path from "path";

import AxeBuilder from "@axe-core/playwright";
import {
  test as base,
  Locator,
  Page,
  PageScreenshotOptions,
} from "@playwright/test";
import {
  locatorFixtures as fixtures,
  LocatorFixtures as TestingLibraryFixtures,
} from "@playwright-testing-library/test/fixture";

import slugify from "./slugify";

type SnapshotOptions = { note?: string; page?: Page; locator?: Locator };

const test = base.extend<TestingLibraryFixtures>(fixtures).extend<{
  snapshot: (options?: SnapshotOptions & PageScreenshotOptions) => void;
  makeAxeBuilder: () => AxeBuilder;
  flash: (message: string, duration?: number) => void;
  demoLogin: (page: Page) => void;
  currentView: () => Promise<Locator | Page>;
  withFlag: (route: string, flags: Record<string, boolean>) => string;
}>({
  snapshot: async ({ page }, use, testInfo) => {
    let index = 0;
    const snapshot = async (
      options: SnapshotOptions & PageScreenshotOptions = {}
    ) => {
      const { note, page: pageOption, locator, ...screenshotOptions } = options;
      const toScreenshot = pageOption ?? locator ?? page;
      const name = `${testInfo.project.name} > ${testInfo.titlePath
        .map((x) => x.replace(/\.spec\.ts$/, ""))
        .map(slugify)
        .join(" > ")} ${index++}${note ? ` ${note}` : ""}`;

      const snapshotDir = path.join(__dirname, "snapshots");
      await toScreenshot.screenshot({
        animations: "disabled",
        path: path.join(snapshotDir, `${name}.png`),
        ...screenshotOptions,
      });
    };
    await use(snapshot);
  },

  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () =>
      new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
        .exclude(".axe-ignore")
        .disableRules([
          /* https://dequeuniversity.com/rules/axe/4.7/heading-order?application=AxeChrome */
          "heading-order",
        ]);
    await use(makeAxeBuilder);
  },

  withFlag: async ({ baseURL }, use) => {
    const withFlag = (route: string, flags: Record<string, boolean>) => {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(flags)) {
        searchParams.set(`flag:${key}`, value ? "true" : "false");
      }
      return `${baseURL}${route}?${searchParams.toString()}`;
    };
    await use(withFlag);
  },
});

const { expect, describe } = test;
const it = test;

// When running outside CI, pause Playwright when a test failed.
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

export const sleep = (dur: number) => new Promise((r) => setTimeout(r, dur));

export const scrollContainerUntilVisible = async (
  page: Page,
  scrollerLocator: Locator,
  elementLocator: Locator,
  options: { wheelY?: number; wheelX?: number; delay: number }
) => {
  await (await scrollerLocator).hover();

  while (!(await elementLocator.isVisible())) {
    await page.mouse.wheel(options.wheelX ?? 0, options.wheelY ?? 0);
    await sleep(options.delay);
  }
};

export { describe, expect, it, test };
