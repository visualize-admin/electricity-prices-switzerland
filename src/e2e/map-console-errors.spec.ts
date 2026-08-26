import { expect, gotoWithRetry, test } from "src/e2e/common";

const ENTITIES = ["municipality", "canton", "operator"] as const;

// Two current years plus one historical year. Historical years borrow their
// operator-municipality links from a later year's offers (see docs/coverage.md
// "Caveats"), which is what previously crashed the operator map: a merged
// operator territory can include an operator with no value for the selected
// period, and the map must render that as "no data" instead of throwing.
const PERIODS = ["2026", "2025", "2022"] as const;

/**
 * deck.gl's default onError logs `deck: <message>` via console.error instead
 * of throwing an uncaught exception, so a layer crash (e.g. a `getFillColor`
 * accessor throwing on missing data) doesn't fail these tests unless we
 * check the console directly.
 */
test.describe("Map renders without deck.gl errors", () => {
  for (const entity of ENTITIES) {
    for (const period of PERIODS) {
      test(`entity=${entity}, period=${period}`, async ({ page }) => {
        const deckErrors: string[] = [];
        page.on("console", (msg) => {
          if (msg.type() === "error" && msg.text().startsWith("deck:")) {
            deckErrors.push(msg.text());
          }
        });
        page.on("pageerror", (err) => {
          deckErrors.push(err.message);
        });

        const resp = await gotoWithRetry(
          page,
          `/en/map?tab=electricity&period=${period}&entity=${entity}`
        );
        expect(resp.status()).toBe(200);

        await page
          .locator("#deckgl-overlay")
          .first()
          .waitFor({ timeout: 60_000 });
        // Layer color computation and any thrown errors happen synchronously
        // once data arrives; give the fetches and render a moment to settle.
        await page.waitForTimeout(5_000);

        expect(
          deckErrors,
          `deck.gl reported errors while rendering the map:\n${deckErrors.join(
            "\n"
          )}`
        ).toEqual([]);
      });
    }
  }
});
