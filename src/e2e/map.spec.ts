import { expect } from "@playwright/test";
import sharp from "sharp";

import { test } from "src/e2e/common";
import InflightRequests from "src/e2e/inflight";

test.describe("The Map Page", () => {
  test("should be possible to download the map", async ({ page }) => {
    const resp = await page.goto("/en/map");
    await expect(resp?.status()).toEqual(200);
    // click the download button, it has text "Download image"
    const downloadButton = await page.locator(
      "button:has-text('Download image')"
    );
    await page.waitForLoadState("networkidle");
    await expect(downloadButton).toBeVisible();
    const downloadPromise = page.waitForEvent("download");
    await downloadButton.click();
    // wait for a download to be triggered
    const download = await downloadPromise;
    // read the download, and assert the mime type
    const mimeType = download.suggestedFilename().split(".").pop();
    expect(mimeType).toBe("png");
    // read via createReadStream and create a file
    const buffer = await download.createReadStream().then(
      (stream) =>
        new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("end", () => resolve(Buffer.concat(chunks)));
          stream.on("error", reject);
        })
    );
    expect(buffer.length).toBeGreaterThan(0);
    // Use sharp to check if it's a valid PNG
    const image = sharp(buffer);
    const metadata = await image.metadata();
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBeGreaterThan(0);
    expect(metadata.height).toBeGreaterThan(0);
  });
});

test.describe("Map Hover Behavior", () => {
  test("should allow selecting network operators with tourism+low energy density comparison group", async ({
    page,
  }) => {
    const tracker = new InflightRequests(page);

    // Navigate to the map with sunshine tab
    await page.goto("/en/map?tab=sunshine&flag__sunshine=true");
    await tracker.waitForRequests();

    // Select the comparison group "tourism+low energy density"
    await page.getByRole("combobox", { name: "Peer group" }).click();
    await page
      .getByRole("option", { name: "Tourist area and low energy density" })
      .click();
    await tracker.waitForRequests();

    await page
      .locator("#deckgl-overlay")
      .nth(1)
      .click({
        position: {
          x: 456,
          y: 283,
        },
      });

    await tracker.waitForRequests();

    // Verify the details panel shows content for the selected operator
    const detailsContent = page.getByTestId("map-details-content");
    await expect(detailsContent).toBeVisible();

    tracker.dispose();
  });
});

test.describe("Legend Thresholds", () => {
  test("should display correct color legend thresholds for network costs (+/- 10%/30%)", async ({
    page,
  }) => {
    // Navigate to map with network costs view
    await page.goto("/en/map?tab=sunshine&flag__sunshine=true");

    // Make sure we're viewing network costs indicator
    await page.getByRole("combobox", { name: "Indicator" }).click();
    await page.getByRole("option", { name: /Network costs/i }).click();

    // Get the color legend
    const legend = await page.getByTestId("map-legend").nth(1);

    await expect(legend).toBeVisible();

    const legendText = await legend.textContent();

    expect(legendText).toMatch(/10\s*%/);
    expect(legendText).toMatch(/30\s*%/);
  });

  test("should apply 60 franc threshold for 2026 compliance", async ({
    page,
  }) => {
    const tracker = new InflightRequests(page);

    // Navigate to compliance view
    await page.goto("/en/map?tab=sunshine&indicator=compliance");
    await tracker.waitForRequests();

    // Select year 2026
    await page.getByRole("combobox", { name: "Year" }).click();
    await page.getByRole("option", { name: "2026" }).click();
    await tracker.waitForRequests();

    // Verify the legend is visible for compliance
    const legend = page.getByTestId("map-legend").nth(1);
    await expect(legend).toBeVisible();

    const legendText = await legend.textContent();

    // Check that the legend shows compliance information
    expect(legendText).toContain("Franc rule");
    expect(legendText).toContain("≤ 60");

    tracker.dispose();
  });

  test("should apply 75 franc threshold for 2024 and 2025 compliance", async ({
    page,
  }) => {
    const tracker = new InflightRequests(page);

    for (const year of ["2024", "2025"]) {
      // Navigate to compliance view
      await page.goto("/en/map?tab=sunshine&indicator=compliance");
      await tracker.waitForRequests();

      // Select the year
      await page.getByRole("combobox", { name: "Year" }).click();
      await page.getByRole("option", { name: year }).click();
      await tracker.waitForRequests();

      // Verify the legend shows compliance information
      const legend = page.getByTestId("map-legend").nth(1);
      await expect(legend).toBeVisible();

      const legendText = await legend.textContent();

      // Check that the legend shows compliance information
      expect(legendText).toContain("Franc rule");
      expect(legendText).toContain("≤ 75");
    }

    tracker.dispose();
  });
});
