import { NextApiResponse } from "next";

import { dedupePromise } from "src/lib/dedupe-promise";
import { createSharedCache } from "src/lib/shared-cache";

/** Electricity prices are published yearly; 24h is safe. */
export const csvExportCache = createSharedCache<string>({
  namespace: "csv-export",
  ttlMs: 24 * 60 * 60 * 1000,
  maxSize: 50,
});

export const tariffCsvCacheKey = (
  endpoint: string,
  period: string,
  locale: string
) => `tariff:${endpoint}:${period}:${locale}`;

export const municipalitiesCsvCacheKey = (endpoint: string, period: string) =>
  `municipalities:${endpoint}:${period}`;

const dedupe = dedupePromise<string>();

/** Computes and caches the CSV. Failed computes are not cached. */
const computeCsv = (key: string, compute: () => Promise<string>) =>
  dedupe(key, async () => {
    const csv = await compute();
    await csvExportCache.set(key, csv);
    return csv;
  });

export const getOrComputeCsv = async (
  key: string,
  compute: () => Promise<string>
): Promise<string> =>
  (await csvExportCache.get(key)) ?? computeCsv(key, compute);

/**
 * On a cache hit, send the finished CSV. On a miss, flush the header row
 * immediately so the federal 30s gateway timeout does not fire while SPARQL
 * runs, then stream the rest.
 */
export const sendCsvDownload = async (
  res: NextApiResponse,
  {
    cacheKey,
    filename,
    headerLine,
    produce,
  }: {
    cacheKey: string;
    filename: string;
    headerLine: string;
    produce: () => Promise<string>;
  }
) => {
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment;filename=${filename}`);
  res.setHeader(
    "Cache-Control",
    "public, max-age=300, s-maxage=300, stale-while-revalidate"
  );

  const cached = await csvExportCache.get(cacheKey);
  if (cached !== undefined) {
    res.status(200).send(cached);
    return;
  }

  const prefix = `${headerLine}\n`;
  res.status(200);
  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }
  res.write(prefix);

  const csv = await computeCsv(cacheKey, produce);
  res.end(csv.startsWith(prefix) ? csv.slice(prefix.length) : csv);
};

export const csvWarmPeriods = () => {
  const current = Number(process.env.CURRENT_PERIOD ?? "2026");
  const first = Number(process.env.FIRST_PERIOD ?? "2011");
  const periods = [String(current)];
  if (current - 1 >= first) {
    periods.push(String(current - 1));
  }
  return periods;
};

export const shouldWarmCsvExports = () =>
  process.env.NEXT_RUNTIME === "nodejs" &&
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PHASE !== "phase-production-build" &&
  process.env.SKIP_CSV_WARMUP !== "true";

export const logCsvWarmup = async (
  label: string,
  run: () => Promise<string>
) => {
  const started = Date.now();
  try {
    const csv = await run();
    console.warn(
      `[csv-export] warmed ${label} in ${Date.now() - started}ms (${
        csv.length
      } bytes)`
    );
  } catch (error) {
    console.warn(`[csv-export] failed to warm ${label}`, error);
  }
};
