import { randomBytes } from "crypto";
import fs from "fs";
import fsPromises from "fs/promises";

import { test, Page, Browser, BrowserContextOptions } from "@playwright/test";

import {
  extractGraphQLEntries,
  readHarFile,
  saveGraphQLRequest,
  type ParseResult,
} from "./har-graphql";

export const sleep = (duration: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration);
  });

export const testAndSaveHar = async (
  name: string,
  path: string,
  run: ({ page, browser }: { page: Page; browser: Browser }) => Promise<void>
) => {
  test(name, async ({ page: defaultPage, browser }) => {
    test.slow();
    await defaultPage.close();
    const context = await browser.newContext({
      recordHar: { path },
    });
    const page = await context.newPage();

    await run({ browser, page });

    await context.close();
    console.info(`Saved HAR file from test at ${path}`);

    console.info(`Cleaning up HAR to remove postData ${path}`);
    await fs.promises.unlink(path).catch(() => {});
  });
};

const envs: { name: string; baseUrl: string }[] = [
  { name: "ref", baseUrl: "https://strompreis.ref.elcom.admin.ch" },
  { name: "abn", baseUrl: "https://strompreis.abn.elcom.admin.ch" },
  { name: "prod", baseUrl: "https://strompreis.elcom.admin.ch" },
  {
    name: "local",
    baseUrl: "localhost",
  },
];

export const getEnv = (name: string) => {
  const found = envs.find((x) => x.name === name);
  if (!found) {
    throw new Error(`Could not find environment ${name}`);
  }
  return found;
};

/**
 * Sets up GraphQL request recording for a test.
 * Returns a page and close function that handles parsing and cleanup.
 *
 * @param browser - Playwright browser instance from test fixtures
 * @param outputDir - Directory where GraphQL JSON files will be saved
 * @param options - Additional browser context options
 *
 * @example
 * ```typescript
 * test("My test", async ({ browser }) => {
 *   const { page, close } = await createRecordGraphQLContext(browser, "/tmp/graphql-requests");
 *
 *   await page.goto("/");
 *   await page.click('[data-testid="municipality-123"]');
 *   await page.waitForLoadState("networkidle");
 *
 *   const result = await close(); // Parses HAR, saves GraphQL files, and cleans up
 *   console.log(`Saved ${result.savedRequests} GraphQL requests`);
 * });
 * ```
 */
export const createRecordGraphQLContext = async (
  browser: Browser,
  outputDir: string,
  options: BrowserContextOptions = {}
): Promise<{
  page: Page;
  close: () => Promise<ParseResult>;
}> => {
  // Generate temporary HAR file path
  const tempHarPath = `${randomBytes(8).toString("hex")}.har`;

  // Create browser context with HAR recording enabled, filtering for GraphQL
  const context = await browser.newContext({
    ...options,
    recordHar: {
      ...options.recordHar,
      path: tempHarPath,
      mode: "minimal",
      urlFilter: /graphql/, // Only capture GraphQL requests
    },
  });

  const page = await context.newPage();

  const close = async () => {
    try {
      // Close context to ensure HAR is written
      await context.close();
      console.info(`HAR file saved temporarily at: ${tempHarPath}`);

      // Parse HAR and extract GraphQL requests
      console.info(`Parsing GraphQL requests from HAR file...`);

      const har = await readHarFile(tempHarPath);
      const graphqlEntries = extractGraphQLEntries(har.log.entries);

      const saveResults = await Promise.all(
        graphqlEntries.map(async ({ request, response }) => {
          try {
            await saveGraphQLRequest(request, response, outputDir);
            return {
              success: true,
              operationName: request.operationName!,
            } as const;
          } catch (error) {
            console.error(
              `Failed to save GraphQL request ${request.operationName}:`,
              error
            );
            return {
              success: false,
              operationName: request.operationName,
            } as const;
          }
        })
      );

      const { operationNames, savedRequests } = saveResults.reduce(
        (acc, result) => {
          if (result.success) {
            acc.operationNames.push(result.operationName);
            acc.savedRequests++;
          }
          return acc;
        },
        { operationNames: [] as string[], savedRequests: 0 }
      );

      const result = {
        totalEntries: har.log.entries.length,
        savedRequests,
        operationNames,
        outputDir,
      };

      console.info(`GraphQL Request Recording Summary:`);
      console.info(`  Total HAR entries: ${result.totalEntries}`);
      console.info(`  Saved GraphQL requests: ${result.savedRequests}`);
      console.info(`  Output directory: ${result.outputDir}`);
      console.info(`  Operations: ${result.operationNames.join(", ")}`);

      return result;
    } catch (error) {
      console.error("Error during GraphQL recording:", error);
      throw error;
    } finally {
      // Always attempt to clean up HAR file
      await fsPromises.unlink(tempHarPath).catch(() => {});
    }
  };

  return { page, close };
};
