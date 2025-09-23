import InflightRequests from "src/e2e/inflight";

import { expect, test } from "./common";

test.describe("Metering rates", () => {
  // We need to disable this tests for now as the data is only on Lindas Int
  // TODO Enable when data is on Lindas Prod, or when we can configure the Lindas endpoint
  // at request time.
  test.skip("it should show annual metering on the map with a special legend", async ({
    page,
  }) => {
    const tracker = new InflightRequests(page);
    test.setTimeout(120_000);
    await page.goto("/en/map?period=2026");
    await page.getByRole("combobox", { name: "Price component" }).click();
    await page.getByRole("option", { name: "Annual Metering Cost" }).click();
    await tracker.waitForRequests();
    const legend = page.getByTestId("map-legend").first();
    await expect(legend).toContainText("Tariff comparison in CHF / year");
    await expect(legend).toContainText("66");
    await expect(legend).toContainText("144");
  });
});
