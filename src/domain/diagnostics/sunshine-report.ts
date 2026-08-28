import { Client } from "urql";

import { resolveOperator } from "src/domain/diagnostics/operator-lookup";
import { indicatorOptions, SunshineIndicator } from "src/domain/sunshine";
import {
  SunshineDataByIndicatorDocument,
  SunshineDataByIndicatorQuery,
} from "src/graphql/queries";

export class InvalidSunshineIndicatorError extends Error {
  code = "INVALID_INDICATOR" as const;
}

type SunshineReportArgs = {
  year: string;
  indicator: string;
  operator: string;
  networkLevel?: string;
  locale?: string;
};

type SunshineReportData = {
  args: SunshineReportArgs;
  operator: { id: string; name: string };
  value: number | null | undefined;
  median: number | null | undefined;
};

/**
 * Fetches the same `sunshineDataByIndicator` document the sunshine map uses
 * (see `SunshineMap`) and reports a single operator's value for an
 * indicator/period, alongside the peer median, mirroring
 * `energy-prices-report.ts` but for sunshine data instead of price data.
 */
export async function fetchSunshineReportData(
  client: Client,
  args: SunshineReportArgs
): Promise<SunshineReportData> {
  const locale = args.locale ?? "en";

  if (!indicatorOptions.includes(args.indicator as SunshineIndicator)) {
    throw new InvalidSunshineIndicatorError(
      `Unknown indicator: ${
        args.indicator
      }. Valid indicators: ${indicatorOptions.join(", ")}`
    );
  }

  const operator = await resolveOperator(client, locale, args.operator);

  const result = await client
    .query<SunshineDataByIndicatorQuery>(SunshineDataByIndicatorDocument, {
      filter: {
        operatorId: Number(operator.id),
        period: args.year,
        indicator: args.indicator,
        networkLevel: args.networkLevel,
      },
    })
    .toPromise();
  if (result.error) throw result.error;

  const row = (result.data?.sunshineDataByIndicator.data ?? []).find(
    (r) => r.operatorId === Number(operator.id)
  );

  return {
    args,
    operator,
    value: row?.value,
    median: result.data?.sunshineDataByIndicator.median,
  };
}

/**
 * Formats sunshine report data (see `fetchSunshineReportData`) into the
 * human-readable report printed by the CLI. Pure formatting only, no network
 * requests.
 */
export function buildSunshineReport(data: SunshineReportData): string {
  const { args, operator, value, median } = data;

  const lines: string[] = [];
  lines.push(`Year: ${args.year}`);
  lines.push(`Indicator: ${args.indicator}`);
  lines.push(`Network level: ${args.networkLevel ?? "n/a"}`);
  lines.push(`Operator: ${operator.name} (${operator.id})`);
  lines.push(`Value: ${value ?? "no data"}`);
  lines.push(`Median (all operators for this filter): ${median ?? "n/a"}`);

  if (
    value !== null &&
    value !== undefined &&
    median !== null &&
    median !== undefined
  ) {
    const comparison =
      value > median ? "above" : value < median ? "below" : "equal to";
    lines.push(`Comparison: ${comparison} median`);
  }

  return lines.join("\n");
}
