import InflightRequests from "src/e2e/inflight";

import { expect, gotoWithRetry, test } from "./common";

const MOBILE_VIEWPORT = { width: 375, height: 812 } as const;

test.describe("Header mobile navigation (burger menu)", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test("opens the drawer from the menu control and closes it", async ({
    page,
  }) => {
    const inflight = new InflightRequests(page);
    const resp = await gotoWithRetry(page, "/en");
    await expect(resp?.status()).toEqual(200);
    await inflight.waitForRequests();

    const drawer = page.getByTestId("mobile-nav-drawer");
    await expect(drawer).toBeHidden();

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(drawer).toBeVisible();
    // MenuButton without sections uses a button + client navigation, not a native link.
    await expect(
      drawer.getByRole("button", { name: "Overview", exact: true })
    ).toBeVisible();
    await expect(
      drawer.getByRole("button", { name: "Map view", exact: true })
    ).toBeVisible();

    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(drawer).toBeHidden();
    inflight.dispose();
  });

  test("opens the drawer from search and focuses the drawer search field", async ({
    page,
  }) => {
    const inflight = new InflightRequests(page);
    const resp = await gotoWithRetry(page, "/en");
    await expect(resp?.status()).toEqual(200);
    await inflight.waitForRequests();

    await page.getByRole("button", { name: "Open search" }).first().click();
    await expect(page.getByTestId("mobile-nav-drawer")).toBeVisible();

    const drawerSearch = page.getByRole("combobox", {
      name: /Municipality, canton, grid operator/i,
    });
    await expect(drawerSearch).toBeFocused();
    inflight.dispose();
  });

  test("navigates to the map from the drawer", async ({ page }) => {
    const inflight = new InflightRequests(page);
    const resp = await gotoWithRetry(page, "/en");
    await expect(resp?.status()).toEqual(200);
    await inflight.waitForRequests();

    await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .getByTestId("mobile-nav-drawer")
      .getByRole("button", { name: "Map view", exact: true })
      .click();
    // Default locale often has no /en prefix (pathname is /map).
    await expect(page).toHaveURL(/\/(en\/)?map(\?|$)/);
    inflight.dispose();
  });

  test("screenshots: mobile home and open navigation drawer", async ({
    page,
    snapshot,
  }) => {
    const inflight = new InflightRequests(page);
    const resp = await gotoWithRetry(page, "/en");
    await expect(resp?.status()).toEqual(200);
    await inflight.waitForRequests();

    await snapshot({
      note: "Mobile home — header and hero",
      fullPage: true,
    });

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByTestId("mobile-nav-drawer")).toBeVisible();

    await snapshot({
      note: "Mobile home — navigation drawer open",
      locator: page.getByTestId("mobile-nav-drawer"),
      fullPage: true,
    });
    inflight.dispose();
  });
});
