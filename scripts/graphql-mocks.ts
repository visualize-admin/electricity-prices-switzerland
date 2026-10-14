/**
 * Records the GraphQL responses of a page as typed mocks for unit tests.
 *
 * Opens the URL in a headless browser, collects every /api/graphql response
 * and writes one module per operation to src/mocks/graphql/<name>/, exporting
 * the request `variables` and the response `data`, typed with the generated
 * query types.
 *
 * Usage:
 *   pnpm mocks:graphql <url> --name <name> [--operation <OperationName>...]
 *
 * Example:
 *   pnpm mocks:graphql "http://localhost:3000/operator/31?period=2027&category=H3&product=cheapest&operator=814" \
 *     --name operator-31-vs-814 --operation ObservationsWithAllPriceComponents
 */
import { execFileSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

import { chromium, Request } from "@playwright/test";
import { ArgumentParser } from "argparse";

import { getBasicCredentials } from "../src/e2e/utils";

type Recorded = {
  operationName: string;
  variables: unknown;
  data: unknown;
};

// urql sends short queries as GET, longer ones as POST
const readOperation = (request: Request) => {
  const params =
    request.method() === "GET"
      ? Object.fromEntries(new URL(request.url()).searchParams)
      : (request.postDataJSON() as Record<string, unknown>);
  const query = String(params.query ?? "");
  const operationName =
    (params.operationName as string | undefined) ??
    query.match(/(?:query|mutation)\s+(\w+)/)?.[1];
  const variables =
    typeof params.variables === "string"
      ? JSON.parse(params.variables)
      : params.variables ?? {};
  return { operationName, variables };
};

// Variables are left untyped: enums arrive as strings, and they only document
// what was asked. The response is typed, so a schema change fails typecheck.
const toModule = (url: string, { operationName, variables, data }: Recorded) =>
  `// Recorded from ${url}
// by \`pnpm mocks:graphql\`. Re-record instead of editing by hand.
import type { ${operationName}Query } from "src/graphql/queries";

export const variables = ${JSON.stringify(variables, null, 2)};

export const data: ${operationName}Query = ${JSON.stringify(
    // urql adds __typename everywhere but at the root
    { __typename: "Query", ...(data as object) },
    null,
    2
  )};
`;

const main = async () => {
  const parser = new ArgumentParser({
    description: "Record the GraphQL responses of a page as unit test mocks",
  });
  parser.add_argument("url", { help: "Page to record" });
  parser.add_argument("--name", {
    required: true,
    help: "Folder name under the output directory, e.g. operator-31-vs-814",
  });
  parser.add_argument("--operation", {
    action: "append",
    dest: "operations",
    help: "Only keep this operation (repeatable). Default: all operations",
  });
  parser.add_argument("--output-dir", {
    dest: "outputDir",
    default: "src/mocks/graphql",
  });
  const args = parser.parse_args();

  const browser = await chromium.launch();
  const httpCredentials = getBasicCredentials(args.url);
  const context = await browser.newContext(
    httpCredentials ? { httpCredentials } : {}
  );
  const page = await context.newPage();

  const pending: Promise<Recorded | undefined>[] = [];
  page.on("response", (response) => {
    const request = response.request();
    if (new URL(request.url()).pathname !== "/api/graphql") return;
    pending.push(
      (async () => {
        const { operationName, variables } = readOperation(request);
        if (!operationName) return undefined;
        if (args.operations && !args.operations.includes(operationName)) {
          return undefined;
        }
        const body = await response.json();
        if (body.errors) {
          console.warn(`${operationName} returned errors:`, body.errors);
        }
        return { operationName, variables, data: body.data };
      })()
    );
  });

  console.info(`Recording ${args.url}...`);
  await page.goto(args.url, { waitUntil: "networkidle" });
  // Queries answered from the server-side render are not refetched
  const ssrQueries = await page.evaluate(
    () =>
      Object.keys(
        (window as unknown as { __URQL_DATA__?: object }).__URQL_DATA__ ?? {}
      ).length
  );
  const recorded = (await Promise.all(pending)).filter(
    (r): r is Recorded => r !== undefined
  );
  await browser.close();

  if (ssrQueries > 0) {
    console.warn(
      `${ssrQueries} queries came with the server-side render and were not recorded`
    );
  }
  if (recorded.length === 0) {
    console.error("No GraphQL responses recorded");
    process.exit(1);
  }

  const outputDir = path.resolve(args.outputDir, args.name);
  fs.mkdirSync(outputDir, { recursive: true });
  const counts = new Map<string, number>();
  const written = recorded.map((r) => {
    // Same operation with other variables gets a numbered file
    const n = (counts.get(r.operationName) ?? 0) + 1;
    counts.set(r.operationName, n);
    const file = path.join(
      outputDir,
      `${r.operationName}${n > 1 ? `-${n}` : ""}.ts`
    );
    const { pathname, search } = new URL(args.url);
    fs.writeFileSync(file, toModule(`${pathname}${search}`, r));
    return file;
  });
  execFileSync("prettier", ["--write", ...written], { stdio: "ignore" });
  written.forEach((file) => console.info(`Wrote ${path.relative(".", file)}`));
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
