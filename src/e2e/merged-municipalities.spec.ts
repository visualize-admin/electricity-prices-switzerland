import { expect, gotoWithRetry, test } from "src/e2e/common";
import InflightRequests from "src/e2e/inflight";

// Andelfingen (BFS 30) merged into BFS 291 on 2023-01-01. In LINDAS, the
// identity of BFS 30 has no name and no canton anymore, which made it gray on
// the map and its detail page 404. Both now come from its latest version.
test.describe("Merged municipalities", () => {
  test.beforeEach(async ({ setFlags, page }) => {
    await setFlags(page, ["webglDeactivated"]);
  });

  test("shows Andelfingen (BFS 30) with its price on the 2023 map", async ({
    page,
  }) => {
    test.slow();
    const tracker = new InflightRequests(page);
    await gotoWithRetry(
      page,
      "/en/map?period=2023&category=H4&product=standard"
    );
    await tracker.waitForRequests();

    await page
      .getByRole("textbox", { name: "Filter list" })
      .fill("Andelfingen");
    const listItem = page
      .getByTestId("map-sidebar")
      .locator("a")
      // Exact match, as "Andelfingen" is also part of e.g. "Kleinandelfingen"
      .filter({ has: page.getByText("Andelfingen", { exact: true }) })
      .first();
    await expect(listItem).toContainText(/\d+\.\d{2}/);

    await listItem.click();
    await tracker.waitForRequests();

    const detailsContent = page.getByTestId("map-details-content");
    await expect(detailsContent).toBeVisible();
    await expect(
      detailsContent.getByText("Andelfingen", { exact: true })
    ).toBeVisible();

    tracker.dispose();
  });

  test("opens the detail page of Andelfingen (BFS 30)", async ({ page }) => {
    const resp = await gotoWithRetry(page, "/en/municipality/30?period=2023");
    expect(resp?.status()).toEqual(200);
    await expect(page).toHaveTitle(/Andelfingen/);
    await expect(
      page.getByRole("heading", { name: "Price components" })
    ).toBeVisible({ timeout: 30_000 });
  });
});
