import { expect } from "@playwright/test";

import InflightRequests from "src/e2e/inflight";

import { sleep, test } from "./common";

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

test.describe("Sunshine map details panel", () => {
  test("it should show the mini chart when clicking on a map item", async ({
    page,
    snapshot,
  }) => {
    test.setTimeout(120_000);
    await page.goto("/en/map?flag__sunshine=true");

    const tracker = new InflightRequests(page);
    await page.getByText("Indicators").click();
    await sleep(1000);
    await page.getByRole("combobox", { name: "Year" }).click();
    await page.getByRole("option", { name: "2025" }).click();
    await snapshot({
      note: "Sunshine Map - Initial",
      locator: page.getByTestId("map-sidebar"),
    });
    await page
      .locator("a")
      .filter({ hasText: "Elektra Genossenschaft Holderbank" })
      .first()
      .click();

    await tracker.waitForRequests({ fail: false });

    await snapshot({
      note: "Sunshine Map - SAIDI - Clicked on a list item",
      locator: page.getByTestId("map-details-content"),
    });

    await page.getByText("Back to filters").click();
    await page.getByRole("combobox", { name: "Indicator" }).click();
    await page.getByRole("option", { name: "Energy tariffs" }).click();
    await page
      .locator("a")
      .filter({ hasText: "Genossenschaft Elektra Augst" })
      .first()
      .click();
    await tracker.waitForRequests({ fail: false });

    await snapshot({
      note: "Sunshine Map - Energy tariffs - Clicked on a list item",
      locator: page.getByTestId("map-details-content"),
    });
    await page.getByText("Back to filters").click();
    await page
      .getByLabel("Indicator", {
        exact: true,
      })
      .click();
    await page.getByRole("option", { name: "Network costs" }).click();
    await page
      .locator("a")
      .filter({ hasText: "Elektra Genossenschaft" })
      .first()
      .click();

    await tracker.waitForRequests({ fail: false });

    await snapshot({
      note: "Sunshine Map - Network costs - Clicked on a list item",
      locator: page.getByTestId("map-details-content"),
    });
  });

  test("it should be possible to use the search while on detail panel", async ({
    page,
    snapshot,
  }) => {
    test.setTimeout(120_000);
    await page.goto("/en/map?flag__sunshine=true");

    const tracker = new InflightRequests(page);
    await page.getByText("Indicators").click();
    await sleep(1000);
    await page.getByLabel("Year").click();

    await page.getByRole("option", { name: "2025" }).click();
    await tracker.waitForRequests();

    await snapshot({
      note: "Sunshine Map - Initial",
      locator: page.getByTestId("map-sidebar"),
    });
    await page
      .locator("a")
      .filter({ hasText: "Elektra Genossenschaft Holderbank" })
      .first()
      .click();

    await tracker.waitForRequests();
    await page.getByPlaceholder("Municipality, canton, grid").click();
    await page.keyboard.type("Bern");
    await tracker.waitForRequests();
    await page.locator("#search-global-option-0").getByText("Bern");
  });
});

test.describe("Sunshine Costs and Tariffs page", () => {
  test("it should display the correct title", async ({ page }) => {
    await page.goto("/en/sunshine/operator/36/costs-and-tariffs");
    // Scroll for BKW Energie AG to be at the top
    await page.waitForLoadState("networkidle");

    await page
      .getByText("Network Costs at Low voltage NE7 Level")
      .scrollIntoViewIfNeeded();
    await page.getByText("Grid Tariffs").click();
    // text: Net Tariffs C2 - Small business (<15 kW)
    await expect(
      page.getByText("Net Tariffs H4 - 5-room apartment")
    ).toBeVisible();
    await page.getByRole("combobox", { name: "Category" }).click();
    await page.getByRole("option", { name: "H4" }).click();
    await page
      .getByRole("heading", { name: "Net Tariffs H4 - 5-Room" })
      .click();
    await page.getByTestId("energy-tariffs-tab").click();
    await page.getByTestId("net-tariffs-tab").click();
    await page.getByTestId("energy-tariffs-tab").click();
    await page.getByRole("combobox", { name: "Category" }).click();
    await page.getByRole("option", { name: "C2" }).click();
    await page
      .getByRole("heading", {
        name: "Energy Tariffs C2 - Small business (<15 kW)",
      })
      .click();
  });
});
