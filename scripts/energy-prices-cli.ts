#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Inspect why a municipality is colored the way it is on the energy prices
 * map: fetches the same GraphQL documents the map uses, runs the same pure
 * color computation, and reports the resulting operators, provenance
 * (Offers vs Observations), and legend color.
 *
 * Usage:
 *   pnpm tsx scripts/energy-prices-cli.ts --year 2026 --category H4 \
 *     --price-component total --product standard --municipality Zurich
 */

import { ArgumentParser } from "argparse";

import {
  buildEnergyPricesReport,
  fetchEnergyPricesReportData,
  MunicipalityNotFoundError,
} from "src/domain/energy-prices-report";
import { createNodeGraphqlClient } from "src/graphql/node-client";

const DEFAULT_ENDPOINT = "http://localhost:3000/api/graphql";

async function main() {
  const parser = new ArgumentParser({
    description:
      "Report which operators serve a municipality, via Offers or Observations, and the resulting map legend color.",
  });
  parser.add_argument("--year", { required: true, help: "e.g. 2026" });
  parser.add_argument("--category", { required: true, help: "e.g. H4" });
  parser.add_argument("--price-component", {
    required: true,
    dest: "priceComponent",
    help: "e.g. total, gridusage, energy",
  });
  parser.add_argument("--product", {
    required: true,
    help: "e.g. standard, cheapest",
  });
  parser.add_argument("--municipality", {
    required: true,
    help: "Municipality id or name",
  });
  parser.add_argument("--network-level", {
    dest: "networkLevel",
    help: "e.g. NE5, NE6, NE7",
  });
  parser.add_argument("--locale", { default: "en" });
  parser.add_argument("--endpoint", { default: DEFAULT_ENDPOINT });

  const args = parser.parse_args();

  const client = createNodeGraphqlClient(args.endpoint);

  try {
    const data = await fetchEnergyPricesReportData(client, args);
    console.log(buildEnergyPricesReport(data));
  } catch (error) {
    if (error instanceof MunicipalityNotFoundError) {
      console.error(error.message);
      process.exitCode = 1;
      return;
    }
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
