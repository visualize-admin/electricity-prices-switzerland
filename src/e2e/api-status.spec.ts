import { test, expect } from "src/e2e/common";

test.describe("API Status Page", () => {
  test("should go to API status page and see no errors", async ({ page }) => {
    const resp = await page.goto("/_system/api-status");
    await expect(resp?.status()).toEqual(200);
    // click the api status button, it has text "API Status"
    await page.getByText("API Status");
    await expect(await page.getByText("FAIL")).toHaveCount(0);
  });
});
