import { Page } from "@playwright/test";

import InflightRequests from "src/e2e/inflight";

import { sleep, test, expect, TestFixtures } from "./common";

test.describe("Sunshine overview page", () => {
  test("it should load the sunshine overview page (partial data)", async ({
    page,
    snapshot,
  }) => {
    const inflight = new InflightRequests(page);
    const resp = await page.goto("/en/sunshine/operator/72/overview");
    await expect(resp?.status()).toEqual(200);
    await inflight.waitForRequests();

    await snapshot({
      note: "Sunshine Overview Page - Partial data",
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });
    inflight.dispose();
  });

  test("it should load the sunshine overview page (full data)", async ({
    page,
    snapshot,
  }) => {
    const inflight = new InflightRequests(page);
    const resp = await page.goto("/en/sunshine/operator/426/overview");
    await expect(resp?.status()).toEqual(200);
    await inflight.waitForRequests();

    await snapshot({
      note: "Sunshine Overview Page - Full data",
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });
    inflight.dispose();
  });
});

test.describe("Sunshine details page", () => {
  test.beforeEach(async ({ setFlags, page }) => {
    await setFlags(page, ["webglDeactivated"]);
  });

  const performTest = async ({
    withFlag,
    page,
    snapshot,
    screenshotLabel,
    buttonLabel,
    url,
  }: Pick<TestFixtures, "withFlag" | "page" | "snapshot"> & {
    screenshotLabel: string;
    buttonLabel: string;
    url: string;
  }) => {
    const inflight = new InflightRequests(page);
    const resp = await page.goto(withFlag(url, { sunshine: true }));
    await expect(resp?.status()).toEqual(200);
    await inflight.waitForRequests();
    await page.waitForSelector('[data-testid="loading"]', {
      state: "detached",
    });

    await snapshot({
      note: `${screenshotLabel} - Initial`,
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });

    const tabButton = await page.getByTestId(buttonLabel);
    await tabButton.click();
    await inflight.waitForRequests();
    await page.waitForSelector('[data-testid="loading"]', {
      state: "detached",
    });
    inflight.dispose();

    await snapshot({
      note: `${screenshotLabel} - After Click`,
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });

    // Switch to mobile view and take another screenshot
    await page.setViewportSize({ width: 375, height: 812 });
    await snapshot({
      note: `${screenshotLabel} - Mobile View`,
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });
  };

  test(`it should load the sunshine details page for Net Tariffs`, async ({
    withFlag,
    page,
    snapshot,
  }) => {
    await performTest({
      withFlag,
      page,
      snapshot,
      screenshotLabel: "Net Tariffs",
      buttonLabel: "net-tariffs-tab",
      url: "/sunshine/operator/426/costs-and-tariffs",
    });
  });

  test(`it should load the sunshine details page for Energy Tariffs`, async ({
    withFlag,
    page,
    snapshot,
  }) => {
    await performTest({
      withFlag,
      page,
      snapshot,
      screenshotLabel: "Energy Tariffs",
      buttonLabel: "energy-tariffs-tab",
      url: "/sunshine/operator/426/costs-and-tariffs",
    });
  });

  test(`it should load the sunshine details page for SAIFI`, async ({
    withFlag,
    page,
    snapshot,
  }) => {
    await performTest({
      withFlag,
      page,
      snapshot,
      screenshotLabel: "SAIFI",
      buttonLabel: "saifi-tab",
      url: "/sunshine/operator/426/power-stability",
    });
  });

  test(`it should load the sunshine details page for SAIFI (no data)`, async ({
    withFlag,
    page,
    snapshot,
  }) => {
    await performTest({
      withFlag,
      page,
      snapshot,
      screenshotLabel: "SAIFI-no-data",
      buttonLabel: "saifi-tab",
      url: "/sunshine/operator/72/power-stability",
    });
  });

  test(`it should load the sunshine details page for Service Quality`, async ({
    withFlag,
    page,
    snapshot,
  }) => {
    await performTest({
      withFlag,
      page,
      snapshot,
      screenshotLabel: "Service Quality",
      buttonLabel: "outage-info-tab",
      url: "/sunshine/operator/426/operational-standards",
    });
  });

  test(`it should load the sunshine details page for Compliance`, async ({
    withFlag,
    page,
    snapshot,
  }) => {
    await performTest({
      withFlag,
      page,
      snapshot,
      screenshotLabel: "Compliance",
      buttonLabel: "compliance-tab",
      url: "/sunshine/operator/426/operational-standards",
    });
  });
});

test.describe("Sunshine map details panel", () => {
  test("it should show the mini chart when clicking on a map item", async ({
    page,
    snapshot,
    setFlags,
  }) => {
    test.setTimeout(120_000);
    await setFlags(page, ["webglDeactivated"]);
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

  test("it should show median for saidi/saifi", async ({
    page,
    setFlags,
    snapshot,
  }) => {
    await setFlags(page, ["webglDeactivated"]);
    const tracker = new InflightRequests(page);
    await page.goto(
      "/en/map?tab=sunshine&indicator=saidi&peerGroup=4&activeId=31"
    );
    await tracker.waitForRequests();
    // loading should be detached
    await page.getByTestId("loading").waitFor({ state: "detached" });
    await snapshot({
      note: "Sunshine Map - SAIDI - Details panel",
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

const checkCategories = async (page: Page) => {
  // Get the page content
  const pageContent = page.getByTestId("details-page-content");
  await expect(pageContent).toBeVisible();

  const contentText = await pageContent.textContent();

  // Verify only sunshine categories C2, C3, C4, C6, H2, H4, H7 are displayed
  const sunshineCategories = ["C2", "C3", "C4", "C6", "H2", "H4", "H7"];
  const foundCategories = sunshineCategories.filter((category) =>
    contentText?.includes(category)
  ).length;

  // Expect at least some sunshine categories to be displayed
  expect(foundCategories).toBeGreaterThan(0);

  const nonSunshineCategories = [
    "C1",
    "C5",
    "C7",
    "H1",
    "H3",
    "H5",
    "H6",
    "H8",
  ];
  const foundNonSunshineCount = nonSunshineCategories.filter((category) => {
    const regex = new RegExp(`\\b${category}\\b`);
    return regex.test(contentText || "");
  }).length;

  expect(foundNonSunshineCount).toEqual(0);
};

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

  test("should only display sunshine categories in costs-and-tariffs page", async ({
    page,
  }) => {
    const tracker = new InflightRequests(page);

    // Navigate to operator 426 costs-and-tariffs page with net tariffs tab
    await page.goto(
      "/en/sunshine/operator/426/costs-and-tariffs?tabDetails=netTariffs"
    );
    await tracker.waitForRequests();
    await checkCategories(page);
    tracker.dispose();
  });
});

test.describe("Trend icons on Costs and Tariffs page", () => {
  test("should display trend icons for energy tariffs", async ({ page }) => {
    await page.goto(
      "/en/sunshine/operator/426/costs-and-tariffs?tabDetails=energyTariffs"
    );
    await page.waitForLoadState("networkidle");

    // Check that trend icons are visible
    const trendIcons = page.getByTestId(/^trend-icon-(up|down)$/);
    await expect(trendIcons.first()).toBeVisible();
  });

  test("should display trend icons for net tariffs", async ({ page }) => {
    await page.goto(
      "/en/sunshine/operator/426/costs-and-tariffs?tabDetails=netTariffs"
    );
    await page.waitForLoadState("networkidle");

    // Check that trend icons are visible
    const trendIcons = page.getByTestId(/^trend-icon-(up|down)$/);
    await expect(trendIcons.first()).toBeVisible();
  });
});

test.describe("Operational Standards page", () => {
  test("it should display the correct tabs and content", async ({ page }) => {
    await page.goto("/en/sunshine/operator/468/operational-standards");

    // Check table row labelled "Information on planned interruptions" has "Yes"
    const infoRow = page.getByRole("row", {
      name: /Information on planned interruptions Yes/i,
    });
    await expect(infoRow).toBeVisible();

    // Click on Compliance tab
    await page.getByTestId("compliance-tab").click();

    // Check table row labelled "Compliance with timely paper submissions" has "No"
    const complianceRow = page.getByRole("row", {
      name: /Timely Paper Submission Yes/i,
    });
    await expect(complianceRow).toBeVisible();
  });
});
