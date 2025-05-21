import { expect, test } from "@playwright/test";

test.describe("The Home Page", () => {
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
});
