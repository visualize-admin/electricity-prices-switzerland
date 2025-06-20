import { expect } from "@playwright/test";

import { test } from "./common";

test.describe("Sunshine details page", () => {
  test("it should load the sunshine details page costs and and each sub category tariffs", async ({
    withFlag,
    page,
    snapshot,
  }) => {
    const resp = await page.goto(
      withFlag("/sunshine/operator/426/costs-and-tariffs", { sunshine: true })
    );
    await expect(resp?.status()).toEqual(200);
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/graphql") && response.status() === 200
    );

    await snapshot({
      note: "Costs and tariffs - Network Costs",
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });

    await page.getByTestId("button-group-1").click();
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/graphql") && response.status() === 200
    );

    await snapshot({
      note: "Costs and tariffs - Net Tariffs",
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });

    await page.getByTestId("button-group-2").click();
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/graphql") && response.status() === 200
    );

    await snapshot({
      note: "Costs and tariffs - Energy Tariffs",
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });
  });

  test("it should load the sunshine details page power stability and each sub category", async ({
    withFlag,
    page,
    snapshot,
  }) => {
    const resp = await page.goto(
      withFlag("/sunshine/operator/426/power-stability", { sunshine: true })
    );
    await expect(resp?.status()).toEqual(200);
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/graphql") && response.status() === 200
    );

    await snapshot({
      note: "Power stability - SAIDI",
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });

    await page.getByTestId("button-group-1").click();
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/graphql") && response.status() === 200
    );

    await snapshot({
      note: "Power stability - SAIFI",
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });
  });

  test("it should load the sunshine details page operational standards and each sub category", async ({
    withFlag,
    page,
    snapshot,
  }) => {
    const resp = await page.goto(
      withFlag("/sunshine/operator/426/operational-standards", {
        sunshine: true,
      })
    );
    await expect(resp?.status()).toEqual(200);
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/graphql") && response.status() === 200
    );
    await snapshot({
      note: "Operational standards - Product Variety",
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });

    await page.getByTestId("button-group-1").click();
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/graphql") && response.status() === 200
    );

    await snapshot({
      note: "Operational standards - Service Quality",
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });

    await page.getByTestId("button-group-2").click();
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/graphql") && response.status() === 200
    );

    await snapshot({
      note: "Operational standards - Compliance",
      locator: await page.getByTestId("details-page-content"),
      fullPage: true,
    });
  });
});
