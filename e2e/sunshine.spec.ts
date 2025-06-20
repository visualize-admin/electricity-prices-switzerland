import { expect } from "@playwright/test";

import { test } from "./common";

/**
 * FIXME - This test suite is currently flaky and needs to be fixed.
 *
 * waitForLoadState often causes issues it doesn't work as expected causing screenshots while the page is still loading
 */
test.describe("Sunshine details page", () => {
  const tabs = [
    {
      url: "/sunshine/operator/426/costs-and-tariffs",
      buttonLabel: "net-tariffs-tab",
      screenshotLabel: "Net Tariffs",
    },
    {
      url: "/sunshine/operator/426/costs-and-tariffs",
      buttonLabel: "energy-tariffs-tab",
      screenshotLabel: "Energy Tariffs",
    },
    {
      url: "/sunshine/operator/426/power-stability",
      buttonLabel: "saifi-tab",
      screenshotLabel: "SAIFI",
    },
    {
      url: "/sunshine/operator/426/operational-standards",
      buttonLabel: "service-quality-tab",
      screenshotLabel: "Service Quality",
    },
    {
      url: "/sunshine/operator/426/operational-standards",
      buttonLabel: "compliance-tab",
      screenshotLabel: "Compliance",
    },
  ];

  for (const { url, buttonLabel, screenshotLabel } of tabs) {
    test(`it should load the sunshine details page for ${screenshotLabel}`, async ({
      withFlag,
      page,
      snapshot,
    }) => {
      const resp = await page.goto(withFlag(url, { sunshine: true }));
      await expect(resp?.status()).toEqual(200);
      await page.waitForLoadState("networkidle");

      await snapshot({
        note: `${screenshotLabel} - Initial`,
        locator: await page.getByTestId("details-page-content"),
        fullPage: true,
      });

      const tabButton = await page.getByTestId(buttonLabel);
      await tabButton.click();
      await page.waitForLoadState("networkidle");

      await snapshot({
        note: `${screenshotLabel} - After Click`,
        locator: await page.getByTestId("details-page-content"),
        fullPage: true,
      });
    });
  }
});
