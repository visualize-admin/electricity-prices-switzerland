/**
 * Records a browsing session as a HAR file for k6 load testing.
 * Optionally filters the HAR to only GraphQL requests.
 *
 * Usage:
 *   bun src/e2e/generate-k6-har.ts
 *   bun src/e2e/generate-k6-har.ts --env abn --graphql-only
 *   bun src/e2e/generate-k6-har.ts --output custom.har --headed
 */
import { chromium } from "@playwright/test";
import { ArgumentParser } from "argparse";

import { getEnv, getBasicCredentials, cleanupHAR, sleep } from "./utils";

const main = async () => {
  const parser = new ArgumentParser();
  parser.add_argument("--env", {
    default: "ref",
    choices: ["ref", "abn", "prod", "local"],
    help: "Target environment (default: ref)",
  });
  parser.add_argument("--graphql-only", {
    dest: "graphqlOnly",
    action: "store_true",
    default: false,
    help: "Filter HAR to only keep requests to /api/graphql",
  });
  parser.add_argument("--output", {
    default: null,
    help: "Output HAR file path (default: browsing-test-<env>.har)",
  });
  parser.add_argument("--headed", {
    action: "store_true",
    default: false,
    help: "Run browser in headed mode",
  });

  const args = parser.parse_args();
  const { graphqlOnly, headed } = args;

  const env = getEnv(args.env);
  const harPath = args.output ?? `browsing-test-${env.name}.har`;

  const browser = await chromium.launch({ headless: !headed });
  const httpCredentials = getBasicCredentials(env.baseUrl);
  const context = await browser.newContext({
    recordHar: { path: harPath },
    ...(httpCredentials && { httpCredentials }),
  });
  const page = await context.newPage();

  try {
    console.info(`Navigating ${env.baseUrl} (env=${env.name})...`);
    await page.goto(env.baseUrl);
    await page.getByRole("link", { name: "Netzkosten" }).click();
    await sleep(1000);
    await page.getByRole("combobox", { name: "Indikator" }).click();
    await page.getByRole("option", { name: "Energietarife" }).click();
    await sleep(1000);
    await page.getByRole("combobox", { name: "Kategorie" }).click();
    await page.getByRole("option", { name: "H7" }).click();
    await sleep(1000);
    await page.getByRole("combobox", { name: "Vergleichsgruppe" }).click();
    await page
      .getByRole("option", {
        name: "hohe Siedlungsdichte und tiefe Energiedichte",
      })
      .click();
    await sleep(1500);
    await page.locator("a").filter({ hasText: "Energie Wettingen AG10,3" }).click();
    await sleep(1500);
    await page.getByText("Energietarife im Detail").click();
    await sleep(1000);
    await page.goto(
      `${env.baseUrl}/sunshine/operator/804/costs-and-tariffs?tabDetails=energyTariffs#main-content`
    );
    await sleep(2000);
    await page.getByRole("link", { name: "Versorgungsqualität" }).click();
    await sleep(1500);
    await page.getByRole("link", { name: "Leistungsindikatoren" }).click();
    await sleep(1500);
    await page.getByRole("combobox", { name: "Gemeinde, Kanton," }).click();
    await page.getByRole("combobox", { name: "Gemeinde, Kanton," }).fill("ekz");
    await sleep(1000);
    await page.getByText("Elektrizitätswerke des").click();
    await sleep(1500);
    await page.goto(`${env.baseUrl}/operator/486?entity=operator`);
    await sleep(2000);
    await page.getByRole("link", { name: "Übersicht" }).click();
    await sleep(1000);
    await page.getByRole("link", { name: "Netzkosten und Tarife" }).click();
    await sleep(2000);
  } finally {
    await context.close();
    await browser.close();
  }

  console.info(`Saved HAR to ${harPath} ✅`);
  console.info(`Cleaning up HAR (graphqlOnly=${graphqlOnly})...`);
  cleanupHAR(harPath, { graphqlOnly });
  console.info("Done ✅");
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
