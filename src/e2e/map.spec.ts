import sharp from "sharp";

import { test, expect } from "src/e2e/common";
import InflightRequests from "src/e2e/inflight";

test.describe("The Map Page", () => {
  test("should be possible to download the map", async ({ page }) => {
    test.setTimeout(120_000);
    const resp = await page.goto("/en/map");
    await expect(resp?.status()).toEqual(200);
    await page.waitForLoadState("load");
    const downloadTrigger = page.getByRole("button", { name: "Download image" });
    await expect(downloadTrigger).toBeVisible({ timeout: 60_000 });
    await downloadTrigger.click();

    const confirmDownload = page.getByRole("button", { name: "Download" });
    await expect(confirmDownload).toBeVisible({ timeout: 15_000 });

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 90_000 }),
      confirmDownload.click(),
    ]);
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
    test.slow();
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
    await expect(detailsContent).toBeVisible({ timeout: 45_000 });

    tracker.dispose();
  });
});

test.describe("Map Details Table Information", () => {
  test.beforeEach(async ({ setFlags, page }) => {
    await setFlags(page, ["webglDeactivated"]);
  });

  test("should display correct table information based on selected indicator", async ({
    page,
  }) => {
    test.slow();
    const tracker = new InflightRequests(page);

    // Navigate to sunshine map
    await page.goto("/en/map?tab=sunshine&flag__sunshine=true");
    await tracker.waitForRequests();

    // Table defining expected fields for each indicator
    const indicatorTestCases = [
      {
        indicatorName: "Network costs",
        indicatorPattern: /Network infrastructure costs/i,
        expectedFields: ["Year", "Network level"],
        notExpectedFields: ["Category", "Typology"],
      },
      {
        indicatorName: "Net tariffs",
        indicatorPattern: /Net tariffs for the selected end-consumer category/i,
        expectedFields: ["Year", "Category"],
        notExpectedFields: ["Network level", "Typology"],
      },
      {
        indicatorName: "Energy tariffs",
        indicatorPattern: /Energy tariffs for the selected end-consumer category/i,
        expectedFields: ["Year", "Category"],
        notExpectedFields: ["Network level", "Typology"],
      },
      {
        indicatorName: "SAIDI",
        indicatorPattern: /SAIDI.*minutes per year/i,
        expectedFields: ["Year", "Typology"],
        notExpectedFields: ["Network level", "Category"],
      },
      {
        indicatorName: "SAIFI",
        indicatorPattern: /SAIFI.*interruptions per year/i,
        expectedFields: ["Year", "Typology"],
        notExpectedFields: ["Network level", "Category"],
      },
      {
        indicatorName: "Costs and profit",
        indicatorPattern: /Costs and profit from energy distribution/i,
        expectedFields: ["Year"],
        notExpectedFields: ["Network level", "Category"],
      },
    ];

    const detailsContent = page.getByTestId("map-details-content");

    // Test each indicator
    for (const testCase of indicatorTestCases) {
      // Select the indicator
      await page.getByRole("combobox", { name: "Indicator" }).click();
      await page
        .getByRole("option", { name: testCase.indicatorPattern })
        .click()
        .catch(() => {
          throw new Error(
            `Could not find indicator option: ${testCase.indicatorName}`
          );
        });
      await tracker.waitForRequests();

      // Click first item in the list to show details

      const firstListItem = await page
        .getByTestId("map-sidebar")
        .locator("a")
        .first();
      await firstListItem.click();

      // Verify details panel is visible
      await expect(detailsContent).toBeVisible();

      // Check expected fields are present
      for (const field of testCase.expectedFields) {
        await expect(
          detailsContent,
          `Expected field "${field}" not found for indicator "${testCase.indicatorName}"`
        ).toContainText(field);
      }

      // Check fields that should NOT be present
      const detailsText = await detailsContent.textContent();
      for (const field of testCase.notExpectedFields) {
        expect(
          detailsText,
          `Field "${field}" should not be present for indicator "${testCase.indicatorName}"`
        ).not.toContain(field);
      }

      // Go back to filters for next test
      await page.getByText("Back to filters").click();
    }

    tracker.dispose();
  });
});
