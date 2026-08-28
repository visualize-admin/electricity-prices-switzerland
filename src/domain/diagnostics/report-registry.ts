import { Client } from "urql";

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
import {
  buildOperatorAnomaliesReport,
  fetchOperatorAnomaliesReportData,
} from "src/domain/diagnostics/operator-anomalies-report";
import { OperatorNotFoundError } from "src/domain/diagnostics/operator-lookup";
import {
  buildOperatorReport,
  fetchOperatorReportData,
} from "src/domain/diagnostics/operator-report";
import { ReportId } from "src/domain/diagnostics/report-specs";
import {
  buildSunshineReport,
  fetchSunshineReportData,
  InvalidSunshineIndicatorError,
} from "src/domain/diagnostics/sunshine-report";

/**
 * Errors any report can throw for a bad id/name/indicator, each carrying a
 * `code` so the admin API route (and any UI) can branch on it instead of
 * string-matching the message. Same classes the CLI already catches by
 * type in `scripts/energy-prices-cli.ts`.
 */
export const KNOWN_REPORT_ERRORS = [
  MunicipalityNotFoundError,
  OperatorNotFoundError,
  CantonNotFoundError,
  InvalidSunshineIndicatorError,
] as const;

/**
 * One entry per `energy-prices:cli` subcommand, so the CLI and the admin
 * diagnostics API route dispatch to the exact same fetch/build pairs and
 * can't drift from each other. `limit` marks the (few) numeric args that
 * need parsing out of query-string strings; every other arg is passed
 * through as-is, matching the loose shape the CLI's `argparse` args object
 * already has.
 */
export const REPORTS = {
  municipality: {
    fetch: fetchEnergyPricesReportData,
    build: buildEnergyPricesReport,
    numericArgs: [] as string[],
  },
  operator: {
    fetch: fetchOperatorReportData,
    build: buildOperatorReport,
    numericArgs: [] as string[],
  },
  canton: {
    fetch: fetchCantonReportData,
    build: buildCantonReport,
    numericArgs: [] as string[],
  },
  "gray-areas": {
    fetch: fetchGrayAreasReportData,
    build: (data: Awaited<ReturnType<typeof fetchGrayAreasReportData>>) =>
      buildGrayAreasReport(data),
    numericArgs: ["limit"],
  },
  anomalies: {
    fetch: fetchOperatorAnomaliesReportData,
    build: (
      data: Awaited<ReturnType<typeof fetchOperatorAnomaliesReportData>>
    ) => buildOperatorAnomaliesReport(data),
    numericArgs: ["limit", "minMinorityRatio"],
  },
  sunshine: {
    fetch: fetchSunshineReportData,
    build: buildSunshineReport,
    numericArgs: [] as string[],
  },
} satisfies Record<
  ReportId,
  {
    fetch: (client: Client, args: never) => Promise<unknown>;
    build: (data: never) => string;
    numericArgs: string[];
  }
>;
