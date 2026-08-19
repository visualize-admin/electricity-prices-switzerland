import { describe, expect, test } from "vitest";

import {
  buildEnergyPricesReport,
  fetchEnergyPricesReportData,
} from "src/domain/energy-prices-report";
import { createNodeGraphqlClient } from "src/graphql/node-client";

const ENDPOINT = `${
  process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"
}/api/graphql`;

const BASE_ARGS = {
  category: "H4",
  priceComponent: "total",
  product: "standard",
  locale: "de",
};

/**
 * Guards against regressions in how the energy prices map colors a
 * municipality: hits the real GraphQL API (same documents, computation, and
 * report formatting as the energy-prices CLI) and compares the report
 * against a saved snapshot file. If a municipality's data changes, the
 * snapshot is expected to need updating alongside it (`pnpm test:integration
 * -u`).
 */
describe("energy prices map data (against live GraphQL API)", () => {
  const client = createNodeGraphqlClient(ENDPOINT);

  test("Zurich 2025: resolves via offers and colors dark green", async () => {
    const data = await fetchEnergyPricesReportData(client, {
      ...BASE_ARGS,
      year: "2025",
      municipality: "261",
    });
    const report = buildEnergyPricesReport(data);
    await expect(report).toMatchFileSnapshot(
      "__snapshots__/energy-prices-report/zurich-2025.txt"
    );
  });

  test("Zurzach 2025: excludes the operator below the coverage-ratio threshold", async () => {
    const data = await fetchEnergyPricesReportData(client, {
      ...BASE_ARGS,
      year: "2025",
      municipality: "4324",
    });
    const report = buildEnergyPricesReport(data);
    await expect(report).toMatchFileSnapshot(
      "__snapshots__/energy-prices-report/zurzach-2025.txt"
    );
  });

  test("Münchenbuchsee 2025: excludes the operator below the coverage-ratio threshold", async () => {
    const data = await fetchEnergyPricesReportData(client, {
      ...BASE_ARGS,
      year: "2025",
      municipality: "546",
    });
    const report = buildEnergyPricesReport(data);
    await expect(report).toMatchFileSnapshot(
      "__snapshots__/energy-prices-report/muenchenbuchsee-2025.txt"
    );
  });

  test("Grindelwald 2025: includes an operator exactly at the coverage-ratio threshold", async () => {
    const data = await fetchEnergyPricesReportData(client, {
      ...BASE_ARGS,
      year: "2025",
      municipality: "576",
    });
    const report = buildEnergyPricesReport(data);
    await expect(report).toMatchFileSnapshot(
      "__snapshots__/energy-prices-report/grindelwald-2025.txt"
    );
  });

  test("Zurzach 2020: has no offers of its own, falls back to 2025 offers", async () => {
    const data = await fetchEnergyPricesReportData(client, {
      ...BASE_ARGS,
      year: "2020",
      municipality: "4324",
    });
    const report = buildEnergyPricesReport(data);
    await expect(report).toMatchFileSnapshot(
      "__snapshots__/energy-prices-report/zurzach-2020-fallback.txt"
    );
  });

  test("Flums 2020: has price observations, coverage ratio comes from 2025 offers instead of the 1.00 default", async () => {
    const data = await fetchEnergyPricesReportData(client, {
      ...BASE_ARGS,
      year: "2020",
      municipality: "3292",
    });
    const report = buildEnergyPricesReport(data);
    await expect(report).toMatchFileSnapshot(
      "__snapshots__/energy-prices-report/flums-2020-fallback.txt"
    );
  });
});
