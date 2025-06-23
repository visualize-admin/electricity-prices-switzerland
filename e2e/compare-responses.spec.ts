import { test } from "@playwright/test";
import { sleep } from "e2e/utils";

test("Scenario", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "Electricity tariffs in" }).click();
  await page.goto("http://localhost:3000/map");
  await page.getByRole("textbox", { name: "Filter list Filter list" }).click();
  await page
    .locator("a")
    .filter({ hasText: "Zwischbergen9,05" })
    .first()
    .click();
  await page.locator("#municipalities").click();
  await page.locator("#municipalities").fill("zürich");
  await page.getByRole("option", { name: "Zürich", exact: true }).click();
  await sleep(1000);

  await page.locator("#municipalities").fill("bern");
  await page.getByRole("option", { name: "Bern", exact: true }).click();
  await page.getByRole("button", { name: "2025" }).click();
  await page.locator("#periods").click();
  await page.locator("#periods").fill("202");

  await page.getByRole("option", { name: "2023" }).click();

  await page
    .getByRole("combobox", { name: "Municipality, canton, grid" })
    .fill("Bern");

  await page
    .getByRole("combobox", { name: "Municipality, canton, grid" })
    .click();
  await page
    .getByRole("combobox", { name: "Municipality, canton, grid" })
    .fill("Bern");

  await page.locator("#search-global-option-0").getByText("Bern").click();
  await page.getByRole("heading", { name: "Prize distribution in" }).click();
  await page.getByRole("heading", { name: "Bern" }).click();
  await page.locator("#components").getByText("Total").click();
  await page
    .locator("#evolution")
    .getByText("Grid surcharge pursuant to")
    .click();
  await page.getByRole("heading", { name: "Prize distribution in" }).click();
});
