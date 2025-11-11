import { ArgumentParser } from "argparse";
import { chromium, Page } from "playwright";

import InflightRequests from "src/e2e/inflight";

import { createRecordGraphQLContext, sleep } from "../../e2e/utils";

async function configureGraphqlEndpoint(
  page: Page,
  password: string,
  endpoint: string
) {
  await page.goto("/api/session-config");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForLoadState("networkidle");
  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill(endpoint);
  await page.getByRole("button", { name: "Update Flags" }).click();
}
/**
 * Opens map, searches for a municipality, goes to its detail page and interacts
 * with various UI elements to trigger GraphQL requests.
 */
async function runScenario(page: Page) {
  const inflight = new InflightRequests(page);
  await page.goto("/");

  await page.getByRole("button", { name: "Electricity tariffs in" }).click();
  await page.goto("http://localhost:3000/map");
  await page.getByRole("textbox", { name: "Filter list" }).click();
  await page.locator("a").filter({ hasText: "Zwischbergen" }).first().click();
  await page.locator("#municipalities").click();
  await page.locator("#municipalities").fill("zürich");
  await page.getByRole("option", { name: "Zürich", exact: true }).click();
  await sleep(1000);

  await page.locator("#municipalities").fill("bern");
  await page.getByRole("option", { name: "Bern", exact: true }).click();
  await page.getByRole("button", { name: "2025" }).click();
  await page.locator("#periods").click();
  await page.locator("#periods").fill("202");

  await page.getByRole("option", { name: "2023" }).click();

  await page
    .getByRole("combobox", { name: "Municipality, canton, grid" })
    .fill("Bern");

  await page
    .getByRole("combobox", { name: "Municipality, canton, grid" })
    .click();
  await page
    .getByRole("combobox", { name: "Municipality, canton, grid" })
    .fill("Bern");

  await page.waitForLoadState("networkidle");
  await page.locator("#search-global-option-0").getByText("Bern").click();
  await page.getByRole("heading", { name: "Prize distribution in" }).click();
  await page.getByRole("heading", { name: "Bern" }).click();
  await page.locator("#components").getByText("Total").click();
  await page
    .locator("#evolution")
    .getByText("Grid surcharge pursuant to")
    .click();
  await page.getByRole("heading", { name: "Prize distribution in" }).click();

  await new Promise((resolve) => setTimeout(resolve, 2000));
  await inflight.waitForRequests();
  inflight[Symbol.dispose]();
}

/**
 * Parses command-line arguments and runs the GraphQL recording scenario.
 *
 * Usage:
 *   bun scripts/save-graphql-requests.spec.ts \
 *    --endpoint https://int.lindas.admin.ch/query \
 *    --output-dir /tmp/lindas-int
 */
async function main() {
  const parser = new ArgumentParser({
    description: "Record GraphQL requests from browser interactions",
  });

  parser.add_argument("--output-dir", {
    help: "Directory to save GraphQL request/response files",
    default: "/tmp/graphql-requests",
    dest: "outputDir",
  });

  parser.add_argument("--base-url", {
    help: "Base URL of the application under test",
    default: "http://localhost:3000",
    dest: "baseUrl",
  });

  parser.add_argument("--password", {
    help: "Password for the GraphQL endpoint",
    default: "elcom-admin",
  });

  parser.add_argument("--endpoint", {
    help: "GraphQL endpoint URL",
    default: "https://int.lindas.admin.ch/query",
  });

  const args = parser.parse_args();

  const browser = await chromium.launch({ headless: false });

  // Run the scenario once to warm up the server, otherwise we have unfinished requests
  // despite the network being idle & inflight requests being awaited.
  const warmupCtx = await browser.newContext({
    baseURL: args.baseUrl,
  });
  const warmupPage = await warmupCtx.newPage();
  await configureGraphqlEndpoint(warmupPage, args.password, args.endpoint);
  await runScenario(warmupPage);
  await warmupPage.close();

  // Set up GraphQL recording
  const { page, close } = await createRecordGraphQLContext(
    browser,
    args.outputDir,
    {
      baseURL: args.baseUrl,
    }
  );

  try {
    await configureGraphqlEndpoint(page, args.password, args.endpoint);
    await runScenario(page);
  } finally {
    // Close and process the recorded GraphQL requests
    await close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error("Error running scenario:", error);
  process.exit(1);
});
