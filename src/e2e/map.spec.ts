import { expect } from "@playwright/test";
import sharp from "sharp";

import { test } from "src/e2e/common";

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
