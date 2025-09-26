import * as fs from "fs";
import * as path from "path";

import { Page } from "@playwright/test";

import { test, expect, sleep, ensureLoadingIsComplete } from "./common";

type StorybookManifestStory = {
  id: string;
  title: string;
  name: string;
  importPath: string;
  type: "story" | "docs";
  tags: string[];
  storiesImports: string[];
};

// config
const PROJECT_ROOT = path.join(__dirname, "../");
const PLAYWRIGHT_BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:6006";

const loadStories = (): StorybookManifestStory[] => {
  // load stories.json
  const storybookIndex = path.join(PROJECT_ROOT, "../storybook-index.json");
  if (!fs.existsSync(storybookIndex)) {
    console.warn(
      `⚠️ Could not find ${storybookIndex}. It needs to be downloaded from storybook /storybook/index.json and saved as ${storybookIndex} prior to running tests`
    );
    return [];
  }
  return Object.values(
    JSON.parse(fs.readFileSync(storybookIndex, "utf8")).entries
  );
};

/** Load Storybook story for Playwright testing */
export async function loadStory(
  page: Page,
  storyId: string,
  options?: { waitForLoadingIcon: boolean }
) {
  const search = new URLSearchParams({ viewMode: "story", id: storyId });
  const resp = await page.goto(
    `${PLAYWRIGHT_BASE_URL}/iframe.html?${search.toString()}`,
    {
      waitUntil: "domcontentloaded",
    }
  );

  await page.waitForFunction(() => {
    return (
      document.querySelector("#storybook-root") ||
      document.querySelector("#storybook-docs") ||
      document.querySelector("#error-message")
    );
  });

  // 404 do not cause a problem on Playwright
  expect(resp?.status()).toEqual(200);

  const allFramesAreLoaded = (page: Page) => {
    return Promise.all(
      page.frames().map((frame) => {
        return frame.waitForLoadState("domcontentloaded");
      })
    );
  };

  // wait for page to finish rendering before starting test
  const node = await Promise.race([
    page
      .waitForSelector("#storybook-docs")
      .then((x) => ({ result: x, type: "docs" })),
    page
      .waitForSelector("#storybook-root")
      .then((x) => ({ result: x, type: "component" })),
    page
      .waitForSelector("#error-message")
      .then((x) => ({ result: x, type: "error" })),
  ]);

  await allFramesAreLoaded(page);

  // Prevents blank screenshots, which can happen if the component is not fully rendered yet
  // The data-storybook-state="loaded" attribute by a decorator in Storybook preview.ts
  await page.waitForSelector('[data-storybook-state="loaded"]');

  await sleep(100);

  if (node?.type === "error") {
    throw new Error("An error happened while rendering the component");
  }

  if (options?.waitForLoadingIcon !== false) {
    await ensureLoadingIsComplete(page);
  }
}

const stories = loadStories();

test.skip(({ isMobile }) => isMobile, "Desktop only");

for (const story of stories) {
  const { id: storyId, tags, type } = story;
  if (type === "docs" && !tags.includes("e2e:autodocs-screenshot")) {
    continue;
  } else if (type === "story" && tags.includes("e2e:autodocs-screenshot")) {
    continue;
  }
  test(`Storybook ${storyId} @storybook`, async ({ page, snapshot }) => {
    const storyOptions = {
      waitForLoadingIcon: !tags.includes("e2e:no-wait-for-loading-icon"),
    };
    await loadStory(page, storyId, storyOptions);
    await snapshot({
      note: storyId,
      fullPage: true,
    });
  });
}
