import { Page, Browser } from "@playwright/test";
import { testAndSaveHar, sleep, getEnv } from "./utils";

const envName = process.env.ELCOM_ENV || "ref";

const env = getEnv(envName);

testAndSaveHar(
  "Browsing test",
  `browsing-test-${env.name}.har`,
  async ({ page }) => {
    await page.goto(env.baseUrl);

    // Search and go to Zürich
    await page
      .getByText("Gehe zu…Gemeindename, PLZ, Netzbetreiber, Kanton")
      .click();
    await page
      .getByRole("textbox", {
        name: "Geben Sie Gemeindename, PLZ, Netzbetreiber, Kanton ein …",
      })
      .fill("zürich");
    await sleep(1000);

    await page.getByTestId("search-option-CantonResult-1").click();
    await sleep(2000);

    // Compare to Bern
    await page.locator("#combobox-multi-operators-input").click();
    await page.locator("#combobox-multi-operators-input").fill("bern");
    await page.getByRole("option", { name: "Bern" }).click();
    await sleep(2000);

    // Compare to Glarus
    await page.locator("#combobox-multi-operators-input").fill("l");
    await page.getByRole("option", { name: "Glarus" }).click();
    await sleep(2000);

    // Go to Kilchberg
    await page
      .getByText("Gehe zu…Gemeindename, PLZ, Netzbetreiber, Kanton")
      .click();
    await page
      .getByRole("textbox", {
        name: "Geben Sie Gemeindename, PLZ, Netzbetreiber, Kanton ein …",
      })
      .fill("kilchberg");
    await page.getByTestId("search-option-MunicipalityResult-2851").click();
    await sleep(2000);

    // Go back home
    await page
      .getByText("Gehe zu…Gemeindename, PLZ, Netzbetreiber, Kanton")
      .click();
    await page.getByText("Einzelne Netzbetreiber anzeigen").click();
    await page.getByRole("link", { name: "Zurück zur Übersicht" }).click();
    await sleep(2000);

    // Go to la chaux de fond
    await page
      .getByText("Gehe zu…Gemeindename, PLZ, Netzbetreiber, Kanton")
      .click();
    await page
      .getByRole("textbox", {
        name: "Geben Sie Gemeindename, PLZ, Netzbetreiber, Kanton ein …",
      })
      .fill("la cha");
    await page.getByTestId("search-option-MunicipalityResult-6421").click();
    await sleep(2000);

    // Select 2019 as year
    await page
      .getByText("Gehe zu…Gemeindename, PLZ, Netzbetreiber, Kanton")
      .click();
    await page
      .getByText(
        "Parameter auswählenGemeinden zum VergleichJahre2023 Kategorie KategorieProdukt P"
      )
      .click();
    await page.locator("#combobox-multi-periods-input").click();
    await page.locator("#combobox-multi-periods-input").fill("2");
    await page.getByRole("option", { name: "2019" }).click();
    await sleep(2000);

    // Remove 2023
    await page
      .locator("div")
      .filter({ hasText: /^2023 ✕$/ })
      .locator("span")
      .click();
    await sleep(2000);

    // Add 2022
    await page.locator("#combobox-multi-periods-input").click();
    await page.locator("#combobox-multi-periods-input").fill("2022");
    await page.getByRole("option", { name: "2022" }).click();
    await page
      .getByText(
        "NetznutzungViteos SA10,3 Rp./kWh 2019, Viteos SA, 1 NetzbetreiberViteos SA11,38 "
      )
      .click();
    await page.locator("#combobox-multi-municipalities-input").click();
    await sleep(2000);
  }
);
