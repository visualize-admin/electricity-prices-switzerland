import InflightRequests from "src/e2e/inflight";

import { test, expect } from "./common";

test.describe("Electricity Prices", () => {
  test("it should load the page for an operator", async ({
    page,
    snapshot,
  }) => {
    const inflight = new InflightRequests(page);
    const resp = await page.goto(
      "/operator/110?category=H8&product=cheapest&period=2019"
    );
    await expect(resp?.status()).toEqual(200);
    await inflight.waitForRequests();

    await snapshot({
      note: "Electricity Prices - Operator",
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });
    inflight.dispose();
  });
});
