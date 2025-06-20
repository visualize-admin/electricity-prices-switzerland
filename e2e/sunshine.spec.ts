import { expect } from "@playwright/test";

import { sleep, test } from "./common";

test.describe("Sunshine details page", () => {
  test("it should load the sunshine details page costs and and each sub category tariffs", async ({
    withFlag,
    page,
    snapshot,
  }) => {
    const resp = await page.goto(
      withFlag("/sunshine/operator/426/costs-and-tariffs", { sunshine: true })
    );
    await expect(resp?.status()).toEqual(200);
    await sleep(3000);

    await snapshot({
      note: "Costs and tariffs - Network Costs",
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });

    const netTariffsButton = await page.getByTestId("net-tariffs-tab");
    await expect(netTariffsButton).toBeVisible();
    await netTariffsButton.click();
    await sleep(3000);

    await snapshot({
      note: "Costs and tariffs - Net Tariffs",
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });

    const energyTariffsButton = await page.getByTestId("energy-tariffs-tab");
    await expect(energyTariffsButton).toBeVisible();
    await energyTariffsButton.click();
    await sleep(3000);

    await snapshot({
      note: "Costs and tariffs - Energy Tariffs",
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });
  });

  test("it should load the sunshine details page power stability and each sub category", async ({
    withFlag,
    page,
    snapshot,
  }) => {
    const resp = await page.goto(
      withFlag("/sunshine/operator/426/power-stability", { sunshine: true })
    );
    await expect(resp?.status()).toEqual(200);
    await sleep(3000);

    await snapshot({
      note: "Power stability - SAIDI",
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });

    const saifiButton = await page.getByTestId("saifi-tab");
    await expect(saifiButton).toBeVisible();
    await saifiButton.click();
    await sleep(3000);

    await snapshot({
      note: "Power stability - SAIFI",
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });
  });

  test("it should load the sunshine details page operational standards and each sub category", async ({
    withFlag,
    page,
    snapshot,
  }) => {
    const resp = await page.goto(
      withFlag("/sunshine/operator/426/operational-standards", {
        sunshine: true,
      })
    );
    await expect(resp?.status()).toEqual(200);
    await sleep(3000);

    await snapshot({
      note: "Operational standards - Product Variety",
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });

    const serviceQualityButton = await page.getByTestId("service-quality-tab");
    await expect(serviceQualityButton).toBeVisible();
    await serviceQualityButton.click();
    await sleep(3000);

    await snapshot({
      note: "Operational standards - Service Quality",
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });

    const complianceButton = await page.getByTestId("compliance-tab");
    await expect(complianceButton).toBeVisible();
    await complianceButton.click();
    await sleep(3000);

    await snapshot({
      note: "Operational standards - Compliance",
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });
  });
});
