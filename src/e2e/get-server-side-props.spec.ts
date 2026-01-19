import { readFileSync } from "fs";

import { Page } from "@playwright/test";

import { test, expect } from "./common";

const operatorIds = [454, 72, 426, 36, 468];

const testUrls = operatorIds.flatMap((operatorId) => [
  `/sunshine/operator/${operatorId}/costs-and-tariffs?tabDetails=energyTariffs`,
  `/sunshine/operator/${operatorId}/power-stability#main-content`,
  `/sunshine/operator/${operatorId}/operational-standards#main-content`,
]);

const testServerSideProps = async ({
  page,
  url,
}: {
  page: Page;
  url: string;
}) => {
  const response = await page.goto(url);
  expect(response?.status()).toBe(200);

  // Wait for the page to be fully loaded
  await page.waitForLoadState("networkidle");

  // Extract __NEXT_DATA__ from the page
  const nextData = await page.evaluate(() => {
    const scriptTag = document.getElementById("__NEXT_DATA__");
    if (!scriptTag || !scriptTag.textContent) {
      throw new Error("__NEXT_DATA__ not found");
    }
    return JSON.parse(scriptTag.textContent);
  });

  expect(nextData).toBeDefined();
  expect(nextData.props).toBeDefined();

  return nextData;
};
const stripTypeNameRecursively = (obj: $IntentionalAny): $IntentionalAny => {
  if (Array.isArray(obj)) {
    return obj.map(stripTypeNameRecursively);
  } else if (obj && typeof obj === "object") {
    const newObj: $IntentionalAny = {};
    for (const key of Object.keys(obj)) {
      if (key !== "__typename") {
        newObj[key] = stripTypeNameRecursively(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

test.describe("Server-side props integration tests", () => {
  for (const url of testUrls) {
    test(`should extract __NEXT_DATA__ for ${url}`, async ({ page }) => {
      const nextData = await testServerSideProps({ page, url });

      const expected = JSON.parse(
        readFileSync(
          `src/e2e/snapshots/next-data-${url.replace(/\//g, "-")}.json`,
          "utf-8"
        )
      );

      // Create a snapshot of the extracted data
      expect(stripTypeNameRecursively(nextData)).toEqual(expected);
    });
  }
});
