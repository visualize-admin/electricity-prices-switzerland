/* eslint-disable react-hooks/rules-of-hooks */

import path from "path";

import { argosScreenshot } from "@argos-ci/playwright";
import AxeBuilder from "@axe-core/playwright";
import {
  test as base,
  Locator,
  Page,
  PageScreenshotOptions,
  TestInfo,
} from "@playwright/test";
import {
  locatorFixtures as fixtures,
  LocatorFixtures as TestingLibraryFixtures,
} from "@playwright-testing-library/test/fixture";

import { FlagName } from "src/flags/types";

import slugify from "./slugify";

type SnapshotOptions = { note?: string; page?: Page; locator?: Locator };

export const snapshotDir = path.join(__dirname, "snapshots");

export const getSnapshotName = (testInfo: TestInfo, note: string) => {
  return `${testInfo.project.name} > ${testInfo.titlePath
    .map((x) => x.replace(/\.spec\.ts$/, ""))
    .map(slugify)
    .join(" > ")} ${note}`;
};

const test = base.extend<TestingLibraryFixtures>(fixtures).extend<{
  snapshot: (options?: SnapshotOptions & PageScreenshotOptions) => void;
  makeAxeBuilder: () => AxeBuilder;
  flash: (message: string, duration?: number) => void;
  demoLogin: (page: Page) => void;
  currentView: () => Promise<Locator | Page>;
  withFlag: (route: string, flags: Record<string, boolean>) => string;
  setFlags: (page: Page, flags: FlagName[]) => Promise<void>;
}>({
  setFlags: async ({}, use) => {
    const activate = async (page: Page, flags: FlagName[]) => {
      await page.addInitScript((flags) => {
        for (const flag of flags) {
          localStorage.setItem(`flag__strompreise__${flag}`, "true");
        }
      }, flags);
    };
    await use(activate);
  },
  snapshot: async ({ page }, use, testInfo) => {
    let index = 0;
    const snapshot = async (
      options: SnapshotOptions & PageScreenshotOptions = {}
    ) => {
      const { note, page: pageOption, locator, ...screenshotOptions } = options;
      const name = getSnapshotName(
        testInfo,
        `${index++}${note ? ` ${note}` : ""}`
      );

      // Use argosScreenshot with element option when locator is provided
      const targetPage = pageOption ?? page;
      await argosScreenshot(targetPage, name, {
        ...(locator && { element: locator }),
        disableHover: true,
        ...screenshotOptions,
        root: snapshotDir,
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

const { expect } = test;

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

export const ensureLoadingIsComplete = async (page: Page) =>
  await page.waitForSelector("[data-testid='loading']", {
    state: "hidden",
  });

export { expect, test };
