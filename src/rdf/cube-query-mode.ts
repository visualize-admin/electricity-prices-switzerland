import fs from "fs/promises";

import * as Sentry from "@sentry/nextjs";

import serverEnv from "src/env/server";

/**
 * Runs a cube query with rdf-cube-view-query ("legacy") or hand-written SPARQL
 * ("vanilla"), depending on CUBE_QUERY_MODE.
 *
 * In "shadow" mode both run, the legacy result is returned and any difference
 * is reported (console, Sentry, and CUBE_QUERY_SHADOW_LOG when set).
 * CUBE_QUERY_SHADOW_OPERATIONS limits the comparison to some GraphQL operations.
 */
export const runCubeQuery = async <T>({
  name,
  operationName,
  params,
  legacy,
  vanilla,
}: {
  name: string;
  operationName: string | undefined;
  params: unknown;
  legacy: () => Promise<T[]>;
  vanilla: () => Promise<T[]>;
}): Promise<T[]> => {
  const mode = serverEnv.CUBE_QUERY_MODE;
  if (mode === "vanilla") {
    return vanilla();
  }

  const shadowOperations = serverEnv.CUBE_QUERY_SHADOW_OPERATIONS;
  const shouldShadow =
    mode === "shadow" &&
    (shadowOperations.length === 0 ||
      shadowOperations.includes(operationName ?? ""));
  if (!shouldShadow) {
    return legacy();
  }

  const [legacyResult, vanillaResult] = await Promise.all([
    timed(legacy),
    timed(vanilla),
  ]);

  await report({ name, operationName, params, legacyResult, vanillaResult });

  if ("error" in legacyResult) {
    throw legacyResult.error;
  }
  return legacyResult.value;
};

type Timed<T> = ({ value: T } | { error: unknown }) & { ms: number };

const timed = async <T>(fn: () => Promise<T>): Promise<Timed<T>> => {
  const start = performance.now();
  try {
    const value = await fn();
    return { value, ms: Math.round(performance.now() - start) };
  } catch (error) {
    return { error, ms: Math.round(performance.now() - start) };
  }
};

/** Rows as sorted JSON strings, so that row order does not matter */
const normalize = (rows: unknown[]) =>
  rows
    .map((row) => JSON.stringify(row, Object.keys(row as object).sort()))
    .sort();

const multisetDifference = (a: string[], b: string[]) => {
  const counts = new Map<string, number>();
  for (const x of b) {
    counts.set(x, (counts.get(x) ?? 0) + 1);
  }
  return a.filter((x) => {
    const count = counts.get(x) ?? 0;
    counts.set(x, count - 1);
    return count <= 0;
  });
};

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : `${error}`;

const MAX_DIFF_ROWS = 5;

const report = async <T>({
  name,
  operationName,
  params,
  legacyResult,
  vanillaResult,
}: {
  name: string;
  operationName: string | undefined;
  params: unknown;
  legacyResult: Timed<T[]>;
  vanillaResult: Timed<T[]>;
}) => {
  const entry = {
    time: new Date().toISOString(),
    name,
    operationName,
    params,
    legacyMs: legacyResult.ms,
    vanillaMs: vanillaResult.ms,
  };

  let result;
  if ("error" in legacyResult || "error" in vanillaResult) {
    result = {
      match: "error" in legacyResult && "error" in vanillaResult,
      legacyError:
        "error" in legacyResult ? errorMessage(legacyResult.error) : undefined,
      vanillaError:
        "error" in vanillaResult
          ? errorMessage(vanillaResult.error)
          : undefined,
    };
  } else {
    const legacyRows = normalize(legacyResult.value);
    const vanillaRows = normalize(vanillaResult.value);
    const onlyLegacy = multisetDifference(legacyRows, vanillaRows);
    const onlyVanilla = multisetDifference(vanillaRows, legacyRows);
    result = {
      match: onlyLegacy.length === 0 && onlyVanilla.length === 0,
      legacyCount: legacyRows.length,
      vanillaCount: vanillaRows.length,
      onlyLegacyCount: onlyLegacy.length,
      onlyVanillaCount: onlyVanilla.length,
      onlyLegacy: onlyLegacy.slice(0, MAX_DIFF_ROWS),
      onlyVanilla: onlyVanilla.slice(0, MAX_DIFF_ROWS),
    };
  }

  const logEntry = { ...entry, ...result };

  if (!result.match) {
    console.warn(
      `Cube query shadow mismatch: ${name} (${operationName})`,
      JSON.stringify(logEntry)
    );
    Sentry.captureMessage(`Cube query shadow mismatch: ${name}`, {
      level: "warning",
      extra: logEntry,
    });
  }

  if (serverEnv.CUBE_QUERY_SHADOW_LOG) {
    await fs
      .appendFile(
        serverEnv.CUBE_QUERY_SHADOW_LOG,
        `${JSON.stringify(logEntry)}\n`
      )
      .catch((e) => console.error("Failed to write shadow log:", e));
  }
};
