import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

import { ArgumentParser } from "argparse";

// Options for local k6 run — no k6 Cloud extension config
const options = {
  stages: [
    { duration: "1m", target: 50 },
    { duration: "3m30s", target: 50 },
    { duration: "1m", target: 0 },
  ],
  thresholds: { http_req_duration: ["avg<500", "p(95)<1000"] },
};

/**
 * Builds a hostname → "Authorization: Basic ..." map from BASIC_CREDENTIALS_PER_HOST.
 * The env var is a JSON object: { "host": "user:password" }
 */
const buildBasicAuthMap = (): Record<string, string> => {
  const raw = process.env.BASIC_CREDENTIALS_PER_HOST;
  if (!raw) return {};
  try {
    const map: Record<string, string> = JSON.parse(raw);
    const result: Record<string, string> = {};
    for (const [host, userPass] of Object.entries(map)) {
      const value = `Basic ${Buffer.from(userPass).toString("base64")}`;
      result[host] = value;
      // Also cover the www. variant in case the server redirects there
      if (!host.startsWith("www.")) {
        result[`www.${host}`] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
};

const injectHeadersIntoHAR = (
  harPath: string,
  extraHeaders: Record<string, string>
): string => {
  const data = JSON.parse(fs.readFileSync(harPath).toString());
  const basicAuthMap = buildBasicAuthMap();

  const overrideNames = new Set(
    Object.keys(extraHeaders).map((n) => n.toLowerCase())
  );
  const globalHeaders = Object.entries(extraHeaders).map(([name, value]) => ({
    name,
    value,
  }));

  const patchedEntries = data.log.entries.map((entry: $IntentionalAny) => {
    const hostname = new URL(entry.request.url).hostname;
    const basicAuth = basicAuthMap[hostname];

    const perEntryHeaders: { name: string; value: string }[] = [];
    if (basicAuth) {
      perEntryHeaders.push({ name: "Authorization", value: basicAuth });
    }

    const allOverrides = new Set([
      ...overrideNames,
      ...(basicAuth ? ["authorization"] : []),
    ]);

    return {
      ...entry,
      request: {
        ...entry.request,
        headers: [
          ...(entry.request.headers as { name: string; value: string }[]).filter(
            (h) => !allOverrides.has(h.name.toLowerCase())
          ),
          ...globalHeaders,
          ...perEntryHeaders,
        ],
      },
    };
  });

  const patched = { ...data, log: { ...data.log, entries: patchedEntries } };
  const tmpPath = path.join(os.tmpdir(), `k6-patched-${Date.now()}.har`);
  fs.writeFileSync(tmpPath, JSON.stringify(patched));
  return tmpPath;
};

/**
 * Injects `tags: { name: operationName }` into each GraphQL http.post() call
 * in the k6 script so failures can be tracked per operation in the summary.
 */
const injectOperationTags = (script: string): string => {
  const lines = script.split("\n");
  const result: string[] = [];
  let pendingOpName: string | null = null;

  for (const line of lines) {
    const opMatch = line.match(/"operationName":"(\w+)"/);
    if (opMatch) {
      pendingOpName = opMatch[1];
    }

    // The params object opens on its own line after the body string
    if (pendingOpName && line.trimStart() === "{") {
      result.push(line);
      const indent = line.match(/^(\s*)/)?.[1] ?? "";
      result.push(`${indent}  tags: { name: '${pendingOpName}' },`);
      pendingOpName = null;
      continue;
    }

    result.push(line);
  }

  return result.join("\n");
};

const reportFailures = (ndjsonPath: string) => {
  const lines = fs
    .readFileSync(ndjsonPath, "utf-8")
    .split("\n")
    .filter(Boolean);

  const failures: Record<string, { count: number; statuses: Set<number> }> =
    {};

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (
        entry.type === "Point" &&
        entry.metric === "http_req_failed" &&
        entry.data.value === 1
      ) {
        const name =
          entry.data.tags?.name || entry.data.tags?.url || "unknown";
        const status = parseInt(entry.data.tags?.status ?? "0");
        if (!failures[name]) {
          failures[name] = { count: 0, statuses: new Set() };
        }
        failures[name].count++;
        failures[name].statuses.add(status);
      }
    } catch {
      // skip malformed lines
    }
  }

  if (Object.keys(failures).length === 0) {
    console.info("\nNo failed requests ✅");
    return;
  }

  console.error("\n❌ Failed requests by operation:");
  for (const [name, { count, statuses }] of Object.entries(failures).sort(
    (a, b) => b[1].count - a[1].count
  )) {
    console.error(
      `  ${name}: ${count} failure(s) — HTTP ${[...statuses].join(", ")}`
    );
  }
};

const main = () => {
  const parser = new ArgumentParser();
  parser.add_argument("harFile");
  parser.add_argument("--script-filename", {
    dest: "scriptFilename",
    default: "loadtest.js",
    help: "Name for the generated k6 script file",
  });
  parser.add_argument("--vus", {
    type: "int",
    default: null,
    help: "Override the max number of virtual users",
  });
  parser.add_argument("--iterations", {
    type: "int",
    default: null,
    help: "Run a fixed number of iterations instead of using stages (useful for quick smoke tests)",
  });
  parser.add_argument("--headers-file", {
    dest: "headersFile",
    default: null,
    help: "Path to a JSON file containing headers to inject into all HAR requests (e.g. admin-session.json)",
  });

  const args = parser.parse_args();
  const { harFile, scriptFilename, vus, iterations, headersFile } = args;

  const stageOptions =
    vus !== null
      ? {
          ...options,
          stages: options.stages.map((s) => ({
            ...s,
            target: s.target === 0 ? 0 : vus,
          })),
        }
      : options;

  let sourceHar = harFile;
  let tmpHar: string | null = null;

  const extraHeaders: Record<string, string> = headersFile
    ? JSON.parse(fs.readFileSync(headersFile).toString())
    : {};

  const basicAuthMap = buildBasicAuthMap();
  const needsInjection =
    Object.keys(extraHeaders).length > 0 || Object.keys(basicAuthMap).length > 0;

  if (needsInjection) {
    if (Object.keys(extraHeaders).length > 0) {
      console.info(
        `Injecting headers from ${headersFile}: ${Object.keys(extraHeaders).join(", ")}`
      );
    }
    if (Object.keys(basicAuthMap).length > 0) {
      console.info(
        `Injecting basic auth for: ${Object.keys(basicAuthMap).join(", ")}`
      );
    }
    tmpHar = injectHeadersIntoHAR(harFile, extraHeaders);
    sourceHar = tmpHar;
  }

  try {
    const spawned = spawnSync("./node_modules/.bin/har-to-k6", [
      sourceHar,
      "-o",
      scriptFilename,
      "--add-sleep",
    ]);
    if (spawned.status !== 0) {
      throw new Error(
        `Could not convert har to k6:\n STDOUT: ${spawned.stdout}\n\nSTDERR: ${spawned.stderr}`
      );
    }
  } finally {
    if (tmpHar) fs.unlinkSync(tmpHar);
  }

  let script = fs.readFileSync(scriptFilename).toString();

  // Replace options (stages / iterations)
  if (iterations !== null) {
    // Fixed iterations mode: skip stages, use vus+iterations
    const iterOptions = {
      vus: vus ?? 1,
      iterations,
      thresholds: options.thresholds,
    };
    script = script.replace(
      "export const options = {}",
      `export const options = ${JSON.stringify(iterOptions, null, 2)}`
    );
  } else {
    script = script.replace(
      "export const options = {}",
      `export const options = ${JSON.stringify(stageOptions, null, 2)}`
    );
  }

  // Tag each GraphQL request by operation name for per-operation failure stats
  script = injectOperationTags(script);

  fs.writeFileSync(scriptFilename, script);
  console.info(`Converted HAR ${harFile} to k6 script ${scriptFilename} ✅`);
  console.info(`Running k6 locally...`);

  const ndjsonPath = path.join(os.tmpdir(), `k6-results-${Date.now()}.ndjson`);

  const k6Args = ["run", scriptFilename, "--out", `json=${ndjsonPath}`];
  if (iterations !== null) {
    k6Args.push("--iterations", String(iterations), "--vus", String(vus ?? 1));
  }

  const k6 = spawnSync("k6", k6Args, { stdio: "inherit" });

  if (fs.existsSync(ndjsonPath)) {
    reportFailures(ndjsonPath);
    fs.unlinkSync(ndjsonPath);
  }

  if (k6.status !== 0) {
    throw new Error(`k6 run failed with status ${k6.status}`);
  }
};

main();
