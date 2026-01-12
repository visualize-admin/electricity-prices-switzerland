import { test, sleep, ensureLoadingIsComplete, expect } from "src/e2e/common";
import InflightRequests from "src/e2e/inflight";

test.describe("The Home Page", () => {
  test.beforeEach(async ({ setFlags, page }) => {
    await setFlags(page, ["webglDeactivated"]);
  });
  test("default language (de) should render on /", async ({ browser }) => {
    const page = await browser.newPage({
      extraHTTPHeaders: {
        "Accept-Language": "de",
      },
    });
    const resp = await page.goto("/");
    await expect(resp?.status()).toEqual(200);
  });

  // it("Accept-Language header for alternative language (fr) should redirect to /fr", () => {
  //   cy.request({
  //     url: "/",
  //     followRedirect: false,
  //     headers: { "Accept-Language": "fr" },
  //   }).should((response) => {
  //     expect(response.status).to.equal(307);
  //     expect(response.headers.location).to.equal("/fr");
  //   });
  // });

  test("successfully loads", async ({ page }) => {
    await page.goto("/");
  });

  test("html lang should be 'de'", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
  });

  test("language switch should work", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("locale-select").click();
    await page
      .locator('[data-testid="locale-select"] select')
      .selectOption("fr");
    // await page. location("pathname").should("equal", "/fr");

    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  });

  test("sunshine links", async ({ page, snapshot }) => {
    const tracker = new InflightRequests(page);
    test.setTimeout(120_000);
    await page.goto("/en?flag__sunshine=true");
    const links = [
      "Network Costs",
      "Grid Tariffs",
      "Energy Tariffs",
      "Power Outage Duration (SAIDI)",
      "Power Outage Frequency (SAIFI)",
      "Compliance",
    ];
    for (const link of links) {
      const anchor = page.getByRole("link", { name: link });
      await expect(anchor).toBeVisible();

      const isMac = process.platform === "darwin";
      // ctrl click to open in new tab
      const [newPage] = await Promise.all([
        page.context().waitForEvent("page"),
        anchor.click({ modifiers: [isMac ? "Meta" : "Control"] }),
      ]);

      // Activate tab
      await newPage.bringToFront();

      await Promise.race([
        newPage.waitForLoadState("networkidle"),
        sleep(5000),
      ]);

      await ensureLoadingIsComplete(newPage);
      await tracker.waitForRequests();

      await snapshot({
        note: `Sunshine link - ${link}`,
        locator: newPage.getByTestId("map-sidebar"),
        fullPage: true,
        page: newPage,
      });
      // close page
      await newPage.close();
    }
  });
});
