import InflightRequests from "src/e2e/inflight";

import { expect, test } from "./common";

test.describe("Electricity Prices", () => {
  test("it should load the page for an operator", async ({
    page,
    snapshot,
  }) => {
    const inflight = new InflightRequests(page);
    const resp = await page.goto(
      "/operator/110?category=H8&product=cheapest&period=2019",
    );
    await expect(resp?.status()).toEqual(200);
    await inflight.waitForRequests();

    const sections = [
      { sectionId: "components", tabLabel: "Price Components" },
      { sectionId: "evolution", tabLabel: "Tariffs Development" },
      { sectionId: "distribution", tabLabel: "Price Distribution" },
      { sectionId: "comparison", tabLabel: "Canton Comparison" },
    ];
    await snapshot({
      locator: page.getByTestId("detail-page-selector-multi"),
      note: `Electricity Prices - Operator - Selectors`,
    });
    for (const { sectionId, tabLabel } of sections) {
      await page.getByRole("tab", { name: tabLabel }).click();
      await inflight.waitForRequests();
      await snapshot({
        note: `Electricity Prices - Operator - ${sectionId}`,
        locator: await page.getByTestId(`card-${sectionId}`),
        fullPage: true,
      });
    }
    inflight.dispose();
  });
});
