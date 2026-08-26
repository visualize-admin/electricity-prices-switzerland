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
import {
  buildGrayAreasReport,
  fetchGrayAreasReportData,
} from "src/domain/gray-areas-report";
import { createNodeGraphqlClient } from "src/graphql/node-client";

const DEFAULT_ENDPOINT = "http://localhost:3000/api/graphql";

async function main() {
  const parser = new ArgumentParser({
    description:
      "Report which operators serve a municipality, via Offers or Observations, and the resulting map legend color. " +
      "Omit --municipality to instead scan every municipality and report which ones the map would render without a color (gray).",
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
    help: "Municipality id or name. Omit to scan for gray areas instead.",
  });
  parser.add_argument("--entity", {
    choices: ["municipality", "operator"],
    default: "municipality",
    help: "Gray-area scan only: view the map colors by municipality or by operator (default: municipality)",
  });
  parser.add_argument("--limit", {
    type: "int",
    default: 50,
    help: "Gray-area scan only: max number of gray areas to print (default: 50, 0 for no limit)",
  });
  parser.add_argument("--network-level", {
    dest: "networkLevel",
    help: "e.g. NE5, NE6, NE7",
  });
  parser.add_argument("--locale", { default: "en" });
  parser.add_argument("--endpoint", { default: DEFAULT_ENDPOINT });

  const args = parser.parse_args();

  const client = createNodeGraphqlClient(args.endpoint);

  if (!args.municipality) {
    const data = await fetchGrayAreasReportData(client, {
      year: args.year,
      category: args.category,
      priceComponent: args.priceComponent,
      product: args.product,
      entity: args.entity,
      networkLevel: args.networkLevel,
      locale: args.locale,
    });
    console.log(
      buildGrayAreasReport(data, {
        limit: args.limit > 0 ? args.limit : undefined,
      })
    );
    return;
  }

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
