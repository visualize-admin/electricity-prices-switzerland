import fs from "fs/promises";
import path from "path";

import { expect } from "@playwright/test";
import { getSnapshotName, snapshotDir, test } from "e2e/common";

test.describe("The Map Page", () => {
  test("should be possible to download the map", async ({ page }, testInfo) => {
    const resp = await page.goto("/map");
    await expect(resp?.status()).toEqual(200);
    // click the download button, it has text "Download image"
    const downloadButton = await page.locator(
      "button:has-text('Download image')"
    );
    await expect(downloadButton).toBeVisible();
    const downloadPromise = page.waitForEvent("download");
    await downloadButton.click();
    // wait for a download to be triggered
    const download = await downloadPromise;
    // read the download, and assert the mime type
    const mimeType = download.suggestedFilename().split(".").pop();
    expect(mimeType).toBe("png");
    // read via createReadStream and create a file
    const downloadFileName = getSnapshotName(testInfo, "downloaded-map");
    const filePath = path.join(snapshotDir, `${downloadFileName}.png`);
    const fileStream = await download.createReadStream();
    const writeStream = await fs
      .open(filePath, "w")
      .then((f) => f.createWriteStream());
    await new Promise<void>((resolve, reject) => {
      fileStream.pipe(writeStream);
      writeStream.on("finish", () => resolve());
      writeStream.on("error", reject);
    });
  });
});
