/**
 * Logs into the admin area and saves the session cookie to a JSON file.
 * The output file can be passed to run-k6-local.ts via --headers-file to
 * authenticate load test requests.
 *
 * Optionally sets the sparqlEndpoint session flag before capturing the cookie,
 * so that load test requests are replayed against a specific SPARQL backend.
 * The flag update is performed via the /admin/session-config UI, which re-signs
 * the JWT — no manual token manipulation needed.
 *
 * Usage:
 *   bun src/e2e/dump-admin-session.ts --password elcom-admin
 *   bun src/e2e/dump-admin-session.ts --password elcom-admin \
 *     --sparql-endpoint https://lindas.int.cz-aws.net/query
 *   bun src/e2e/dump-admin-session.ts --password elcom-admin \
 *     --base-url https://strompreis.ref.elcom.admin.ch \
 *     --sparql-endpoint https://lindas.int.cz-aws.net/query
 */
import fs from "fs";

import { ArgumentParser } from "argparse";
import { chromium } from "@playwright/test";

import { getBasicCredentials } from "./utils";

const main = async () => {
  const parser = new ArgumentParser();
  parser.add_argument("--password", {
    default: process.env.ADMIN_SESSION_PASSWORD ?? null,
    help: "Admin password for /admin/login (default: ADMIN_SESSION_PASSWORD env var)",
  });
  parser.add_argument("--base-url", {
    dest: "baseUrl",
    default: "http://localhost:3000",
    help: "Base URL of the application (default: http://localhost:3000)",
  });
  parser.add_argument("--sparql-endpoint", {
    dest: "sparqlEndpoint",
    default: null,
    help: "If provided, updates the sparqlEndpoint session flag before capturing the cookie",
  });
  parser.add_argument("--output", {
    default: "admin-session.json",
    help: "Output file path for the session headers JSON (default: admin-session.json)",
  });
  parser.add_argument("--headed", {
    action: "store_true",
    default: false,
    help: "Run browser in headed mode",
  });

  const args = parser.parse_args();
  const { password, baseUrl, sparqlEndpoint, output, headed } = args;

  if (!password) {
    throw new Error(
      "Password is required. Pass --password or set ADMIN_SESSION_PASSWORD in the environment."
    );
  }

  const browser = await chromium.launch({ headless: !headed });
  const httpCredentials = getBasicCredentials(baseUrl);
  const context = await browser.newContext({
    ...(httpCredentials && { httpCredentials }),
  });
  const page = await context.newPage();

  try {
    // Login
    await page.goto(`${baseUrl}/admin/login`);
    await page.getByRole("textbox", { name: "Password" }).fill(password);
    await page.getByRole("button", { name: "Login" }).click();
    await page.getByRole("heading", { name: "Session Config Flags" }).waitFor();
    console.info("Logged in ✅");

    // Optionally update the sparqlEndpoint flag — the server re-signs the JWT,
    // so the captured cookie will contain a valid token with the new endpoint.
    if (sparqlEndpoint) {
      console.info(`Setting sparqlEndpoint to ${sparqlEndpoint}...`);
      await page.locator('input[name="flags.sparqlEndpoint"]').fill(sparqlEndpoint);
      await page.getByRole("button", { name: "Update Flags" }).click();
      await page.getByRole("heading", { name: "Session Config Flags" }).waitFor();
      console.info("Updated sparqlEndpoint ✅");
    }

    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === "admin_session");

    if (!sessionCookie) {
      throw new Error(
        "admin_session cookie not found after login. Check that the admin credentials are correct."
      );
    }

    const cookieHeader = `${sessionCookie.name}=${sessionCookie.value}`;
    fs.writeFileSync(output, JSON.stringify({ Cookie: cookieHeader }, null, 2));
    console.info(`Saved session cookie to ${output} ✅`);
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
