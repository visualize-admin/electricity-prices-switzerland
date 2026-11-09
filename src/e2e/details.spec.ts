import { expect, test } from "src/e2e/common";

test.describe("Segmented control visibility", () => {
  test("should appear for operator with multiple municipalities", async ({
    page,
  }) => {
    await page.goto("/en/operator/565?period=2025");
    const priceComponents = page.getByRole("heading", {
      name: "Price components",
    });
    await priceComponents.scrollIntoViewIfNeeded();
    await expect(
      await page.getByRole("button", { name: "Group municipalities" }),
    ).toBeVisible({
      timeout: 30_000,
    });
  });

  test("should not appear for operator with single municipality", async ({
    page,
  }) => {
    await page.goto("/en/operator/818");
    await page.getByRole("heading", { name: "Price components" }).waitFor();

    await expect(
      page.getByRole("button", { name: "Group municipalites" }),
    ).not.toBeVisible({
      timeout: 30_000,
    });
  });

  test("should not appear for municipality view with a single operator", async ({
    page,
  }) => {
    await page.goto("/en/municipality/261?period=2025");
    await page.getByRole("heading", { name: "Price components" }).waitFor();

    await expect(
      page.getByRole("button", { name: "Grouping network operators" }),
    ).not.toBeVisible();
  });

  test("should appear for municipality view with multiple operators", async ({
    page,
  }) => {
    await page.goto("/en/municipality/619?period=2025");
    await page.getByRole("heading", { name: "Price components" }).waitFor();

    await expect(
      page.getByRole("button", { name: "Grouping network operators" }),
    ).toBeVisible({ timeout: 30_000 });
  });

  test("should not appear for canton view", async ({ page }) => {
    await page.goto("/en/canton/1");
    await expect(
      page.getByRole("button", { name: "Group municipalities" }),
    ).not.toBeVisible();
  });
});

test.describe("Operators without prices", () => {
  const warningText = "We have no prices for the following operators:";

  test("shows only the no data hint on the price components tab", async ({
    page,
  }) => {
    await page.goto("/en/operator/30?tab=priceComponents");

    await expect(
      page.getByRole("heading", { name: "Price components" }),
    ).toBeVisible();
    await expect(page.getByText("No data", { exact: true })).toBeVisible();
    await expect(page.getByText(warningText)).toHaveCount(0);
  });

  test("warns by name on the price distribution tab", async ({ page }) => {
    await page.goto("/en/operator/30?tab=priceDistribution");

    await expect(
      page.getByRole("heading", { name: "Price distribution in Switzerland" }),
    ).toBeVisible();
    await expect(
      page.getByTestId("operators-without-prices"),
    ).toContainText("Azienda elettrica ticinese");
  });

  test("warns by name on the canton comparison tab", async ({ page }) => {
    await page.goto("/en/operator/30?tab=cantonComparison");

    await expect(
      page.getByRole("heading", { name: "Canton comparison" }),
    ).toBeVisible();
    await expect(
      page.getByTestId("operators-without-prices"),
    ).toContainText("Azienda elettrica ticinese");
  });
});
