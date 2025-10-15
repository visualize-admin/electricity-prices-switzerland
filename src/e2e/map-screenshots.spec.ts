import fs from "fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import sharp from "sharp";

import { test, expect } from "./common";

test.describe("Map screenshots", () => {
  const screenshotSpecs = [
    {
      name: "prices",
      url: `/en/map`,
    },
    {
      name: "sunshine-networkCosts",
      url: `/en/map?flag__sunshine=true&tab=sunshine&indicator=networkCosts`,
    },
    {
      name: "sunshine-compliance",
      url: `/en/map?flag__sunshine=true&tab=sunshine&indicator=compliance`,
    },
    {
      name: "sunshine-saidi",
      url: `/en/map?flag__sunshine=true&tab=sunshine&indicator=saidi`,
    },
  ];
  // Skip this test on CI, we only want to run it locally to generate the images
  if (process.env.CI) {
    test.skip();
  } else {
    for (const { name, url } of screenshotSpecs) {
      const mapId = "#deckgl-overlay";

      test(`it should load the map ${name}`, async ({ page }) => {
        const resp = await page.goto(url);
        await expect(resp?.status()).toEqual(200);
        await page.waitForLoadState("networkidle");

        const mapLocator = await page.locator(mapId).nth(1);
        // Wait for the map to load by checking for the presence of the map overlay
        await mapLocator.waitFor();

        // Screenshot the canvas content by extracting it from Javascript
        await page.evaluate(() => {
          const wrapper = Array.from(
            document.querySelectorAll("#deckgl-wrapper")
          )[1];
          if (!wrapper) {
            throw new Error("Canvas element not found");
          }
          if (!(wrapper instanceof HTMLElement)) {
            throw new Error("Element is not a HTMLElement");
          }
          // put the canvas z-index at 1000 to be sure it's on top
          wrapper.style.zIndex = "1000";
          wrapper.style.background = "white";
          wrapper.style.overflow = "hidden";

          const overlay = wrapper.querySelector("#deckgl-overlay");
          if (!(overlay instanceof HTMLElement)) {
            throw new Error("Overlay is not a HTMLElement");
          }
          // hide overflow to avoid scrollbars in the screenshot
          overlay.style.overflow = "hidden";
        });

        const tmpPath = await fs.mkdtemp(join(tmpdir(), "sunshine-map-"));
        const imageName = `map-${name}.png`;
        // Take initial screenshot of the map
        await mapLocator.screenshot({
          path: `${tmpPath}/${imageName}`,
          omitBackground: true,
        });

        const assetsPath = join(__dirname, "..", "..", "public", "assets");
        const image = await sharp(`${tmpPath}/${imageName}`);
        const meta = await image.metadata();
        if (!meta.width || !meta.height) {
          throw new Error("Could not get image metadata");
        }
        await image
          .extract({
            left: 0,
            top: 0,
            // Crop scrollbar
            width: meta.width - 10,
            height: meta.height,
          })
          // Replaces white background by transparency
          .unflatten()
          .webp({ quality: 90 })
          .toFile(`${assetsPath}/map-${name}.webp`);
      });
    }
  }
});
