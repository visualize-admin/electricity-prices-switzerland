#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Diagnostic CLI for the energy prices and sunshine maps: fetches the same
 * GraphQL documents and pure computation functions the maps use, and reports
 * structured, reproducible output instead of a rendered map.
 *
 * Usage:
 *   pnpm energy-prices:cli municipality Zurich --year 2026 --category H4 \
 *     --price-component total --product standard
 *   pnpm energy-prices:cli operator 565 --year 2026
 *   pnpm energy-prices:cli canton GR --year 2026 --category H4 \
 *     --price-component total --product standard
 *   pnpm energy-prices:cli gray-areas --year 2026 --category H4 \
 *     --price-component total --product standard
 *   pnpm energy-prices:cli anomalies --year 2026
 *   pnpm energy-prices:cli sunshine networkCosts 565 --year 2026
 *   pnpm energy-prices:cli diagnose "https://.../map?tab=sunshine&activeId=565"
 *
 * See docs/energy-prices-cli.md for details on each subcommand.
 */

import { ArgumentParser } from "argparse";

import {
  buildCantonReport,
  CantonNotFoundError,
  fetchCantonReportData,
} from "src/domain/diagnostics/canton-report";
import {
  buildEnergyPricesReport,
  fetchEnergyPricesReportData,
  MunicipalityNotFoundError,
} from "src/domain/diagnostics/energy-prices-report";
import {
  buildGrayAreasReport,
  fetchGrayAreasReportData,
} from "src/domain/diagnostics/gray-areas-report";
import { inferReportFromMapUrl } from "src/domain/diagnostics/map-url-diagnosis";
import {
  buildOperatorAnomaliesReport,
  fetchOperatorAnomaliesReportData,
} from "src/domain/diagnostics/operator-anomalies-report";
import { OperatorNotFoundError } from "src/domain/diagnostics/operator-lookup";
import {
  buildOperatorReport,
  fetchOperatorReportData,
} from "src/domain/diagnostics/operator-report";
import { REPORTS } from "src/domain/diagnostics/report-registry";
import {
  buildSunshineReport,
  fetchSunshineReportData,
  InvalidSunshineIndicatorError,
} from "src/domain/diagnostics/sunshine-report";
import { createNodeGraphqlClient } from "src/graphql/node-client";

const DEFAULT_ENDPOINT = "http://localhost:3000/api/graphql";

function addCommonArgs(
  parser: ArgumentParser,
  { priceFilters }: { priceFilters: boolean }
) {
  parser.add_argument("--year", { required: true, help: "e.g. 2026" });
  if (priceFilters) {
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
  }
  parser.add_argument("--network-level", {
    dest: "networkLevel",
    help: "e.g. NE5, NE6, NE7",
  });
  parser.add_argument("--locale", { default: "en" });
  parser.add_argument("--endpoint", { default: DEFAULT_ENDPOINT });
}

async function main() {
  const parser = new ArgumentParser({
    description:
      "Diagnostic CLI for the energy prices and sunshine maps. See docs/energy-prices-cli.md for details.",
  });
  const subparsers = parser.add_subparsers({
    dest: "command",
    required: true,
  });

  const municipalityParser = subparsers.add_parser("municipality", {
    help: "Report which operators serve a municipality, via Offers or Observations, and the resulting map legend color.",
  });
  addCommonArgs(municipalityParser, { priceFilters: true });
  municipalityParser.add_argument("municipality", {
    help: "Municipality id or name",
  });

  const operatorParser = subparsers.add_parser("operator", {
    help: "Report every municipality an operator serves, grouped by canton.",
  });
  addCommonArgs(operatorParser, { priceFilters: false });
  operatorParser.add_argument("operator", { help: "Operator id or name" });

  const cantonParser = subparsers.add_parser("canton", {
    help: "Report every municipality in a canton, its serving operator(s), and its map legend color.",
  });
  addCommonArgs(cantonParser, { priceFilters: true });
  cantonParser.add_argument("canton", { help: "Canton id or name" });

  const grayAreasParser = subparsers.add_parser("gray-areas", {
    help: "Scan every municipality and report which ones the map would render without a color (gray).",
  });
  addCommonArgs(grayAreasParser, { priceFilters: true });
  grayAreasParser.add_argument("--entity", {
    choices: ["municipality", "operator"],
    default: "municipality",
    help: "View the map colors by municipality or by operator (default: municipality)",
  });
  grayAreasParser.add_argument("--limit", {
    type: "int",
    default: 50,
    help: "Max number of gray areas to print (default: 50, 0 for no limit)",
  });

  const anomaliesParser = subparsers.add_parser("anomalies", {
    help: "Flag operators serving municipalities across multiple cantons where one canton is a small minority — candidates worth a second look, not necessarily bugs.",
  });
  addCommonArgs(anomaliesParser, { priceFilters: false });
  anomaliesParser.add_argument("--min-minority-ratio", {
    type: "float",
    dest: "minMinorityRatio",
    default: 0.2,
    help: "Flag a canton when it's below this fraction of an operator's total municipalities (default: 0.2)",
  });
  anomaliesParser.add_argument("--limit", {
    type: "int",
    default: 50,
    help: "Max number of flagged operators to print (default: 50, 0 for no limit)",
  });

  const sunshineParser = subparsers.add_parser("sunshine", {
    help: "Report an operator's value for a sunshine indicator, alongside the peer median.",
  });
  addCommonArgs(sunshineParser, { priceFilters: false });
  sunshineParser.add_argument("indicator", {
    help: "e.g. networkCosts, saidi, saifi, outageInfo",
  });
  sunshineParser.add_argument("operator", { help: "Operator id or name" });

  const diagnoseParser = subparsers.add_parser("diagnose", {
    help: "Infer which report answers 'why does the map look like this' from a pasted map URL (or bare query string), and run it.",
  });
  diagnoseParser.add_argument("url", {
    help: "Map URL, e.g. https://.../map?tab=sunshine&activeId=565",
  });
  diagnoseParser.add_argument("--locale", { default: "en" });
  diagnoseParser.add_argument("--endpoint", { default: DEFAULT_ENDPOINT });

  const args = parser.parse_args();
  const client = createNodeGraphqlClient(args.endpoint);

  try {
    switch (args.command) {
      case "municipality": {
        const data = await fetchEnergyPricesReportData(client, args);
        console.log(buildEnergyPricesReport(data));
        break;
      }
      case "operator": {
        const data = await fetchOperatorReportData(client, args);
        console.log(buildOperatorReport(data));
        break;
      }
      case "canton": {
        const data = await fetchCantonReportData(client, args);
        console.log(buildCantonReport(data));
        break;
      }
      case "gray-areas": {
        const data = await fetchGrayAreasReportData(client, args);
        console.log(
          buildGrayAreasReport(data, {
            limit: args.limit > 0 ? args.limit : undefined,
          })
        );
        break;
      }
      case "anomalies": {
        const data = await fetchOperatorAnomaliesReportData(client, args);
        console.log(
          buildOperatorAnomaliesReport(data, {
            limit: args.limit > 0 ? args.limit : undefined,
          })
        );
        break;
      }
      case "sunshine": {
        const data = await fetchSunshineReportData(client, args);
        console.log(buildSunshineReport(data));
        break;
      }
      case "diagnose": {
        const diagnosis = inferReportFromMapUrl(args.url);
        if (!diagnosis) {
          console.error(`Couldn't recognize a map URL in: ${args.url}`);
          process.exitCode = 1;
          return;
        }
        const report = REPORTS[diagnosis.reportId];
        const reportArgs: Record<string, string | number> = {
          ...diagnosis.values,
          locale: args.locale,
        };
        for (const key of report.numericArgs) {
          if (key in reportArgs) reportArgs[key] = Number(reportArgs[key]);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await report.fetch(client, reportArgs as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.log(report.build(data as any));
        break;
      }
    }
  } catch (error) {
    if (
      error instanceof MunicipalityNotFoundError ||
      error instanceof OperatorNotFoundError ||
      error instanceof CantonNotFoundError ||
      error instanceof InvalidSunshineIndicatorError
    ) {
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
