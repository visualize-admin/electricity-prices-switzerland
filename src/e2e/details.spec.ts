import { test, expect } from "@playwright/test";

test.describe("Segmented control visibility", () => {
  test("should appear for operator with multiple municipalities", async ({
    page,
  }) => {
    await page.goto("/en/operator/565?period=2025");
    await page.getByRole("heading", { name: "Price components" }).waitFor();
    await expect(
      await page.getByRole("button", { name: "Group municipalities" })
    ).toBeVisible();
  });

  test("should not appear for operator with single municipality", async ({
    page,
  }) => {
    await page.goto("/en/operator/818");
    await page.getByRole("heading", { name: "Price components" }).waitFor();

    await expect(
      page.getByRole("button", { name: "Group municipalites" })
    ).not.toBeVisible();
  });

  test("should not appear for municipality view with a single operator", async ({
    page,
  }) => {
    await page.goto("/en/municipality/261?period=2025");
    await page.getByRole("heading", { name: "Price components" }).waitFor();

    await expect(
      page.getByRole("button", { name: "Grouping network operators" })
    ).not.toBeVisible();
  });

  test("should appear for municipality view with multiple operators", async ({
    page,
  }) => {
    await page.goto("/en/municipality/619?period=2025");
    await page.getByRole("heading", { name: "Price components" }).waitFor();

    await expect(
      page.getByRole("button", { name: "Grouping network operators" })
    ).toBeVisible();
  });

  test("should not appear for canton view", async ({ page }) => {
    await page.goto("/en/canton/1");
    await expect(
      page.getByRole("button", { name: "Group municipalities" })
    ).not.toBeVisible();
  });
});
