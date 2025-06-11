import { expect } from "@playwright/test";

import { test } from "./common";

test.describe("Sunshine details page", () => {
  test("it should be possible to load a sunshine details page", async ({
    withFlag,
    page,
  }) => {
    const resp = await page.goto(
      withFlag("/sunshine/operator/426/costs-and-tariffs", { sunshine: true })
    );
    await expect(resp?.status()).toEqual(200);
  });
});
