import { groupBy } from "lodash";
import { Client } from "urql";

import { resolveOperator } from "src/domain/diagnostics/operator-lookup";
import {
  AllMunicipalitiesDocument,
  AllMunicipalitiesQuery,
  CantonsDocument,
  CantonsQuery,
  OperatorMunicipalitiesDocument,
  OperatorMunicipalitiesQuery,
} from "src/graphql/queries";

type OperatorReportArgs = {
  year: string;
  operator: string;
  networkLevel?: string;
  locale?: string;
};

type OperatorMunicipalityRow =
  OperatorMunicipalitiesQuery["operatorMunicipalities"][number];

type OperatorReportData = {
  args: OperatorReportArgs;
  operator: { id: string; name: string };
  rowsByCanton: Array<{
    canton: { id: string; name: string };
    rows: Array<OperatorMunicipalityRow & { municipalityName: string }>;
  }>;
};

/**
 * Fetches the same `operatorMunicipalities` document the map's operator
 * layer uses (see `useOperatorFeatureCollection`) and reports, for a given
 * operator, every municipality it serves grouped by canton — the reverse of
 * `energy-prices-report.ts`'s municipality-centric view.
 */
export async function fetchOperatorReportData(
  client: Client,
  args: OperatorReportArgs
): Promise<OperatorReportData> {
  const locale = args.locale ?? "en";

  const operator = await resolveOperator(client, locale, args.operator);

  const [operatorMunicipalitiesResult, municipalitiesResult] =
    await Promise.all([
      client
        .query<OperatorMunicipalitiesQuery>(OperatorMunicipalitiesDocument, {
          period: args.year,
          networkLevel: args.networkLevel,
        })
        .toPromise(),
      client
        .query<AllMunicipalitiesQuery>(AllMunicipalitiesDocument, { locale })
        .toPromise(),
    ]);

  if (operatorMunicipalitiesResult.error)
    throw operatorMunicipalitiesResult.error;
  if (municipalitiesResult.error) throw municipalitiesResult.error;

  const municipalityNameById = new Map(
    (municipalitiesResult.data?.municipalities ?? []).map((m) => [m.id, m.name])
  );

  const rows = (
    operatorMunicipalitiesResult.data?.operatorMunicipalities ?? []
  ).filter((row) => row.operator === operator.id);

  const cantonIds = Array.from(new Set(rows.map((r) => r.canton)));
  const cantonsResult = cantonIds.length
    ? await client
        .query<CantonsQuery>(CantonsDocument, { locale, ids: cantonIds })
        .toPromise()
    : null;
  if (cantonsResult?.error) throw cantonsResult.error;
  const cantonNameById = new Map(
    (cantonsResult?.data?.cantons ?? []).map((c) => [c.id, c.name])
  );

  const rowsByCantonId = groupBy(rows, (r) => r.canton);
  const rowsByCanton = Object.entries(rowsByCantonId)
    .map(([cantonId, cantonRows]) => ({
      canton: {
        id: cantonId,
        name: cantonNameById.get(cantonId) ?? `Canton ${cantonId}`,
      },
      rows: cantonRows
        .map((r) => ({
          ...r,
          municipalityName:
            municipalityNameById.get(String(r.municipality)) ?? "unknown",
        }))
        .sort((a, b) => a.municipalityName.localeCompare(b.municipalityName)),
    }))
    .sort((a, b) => b.rows.length - a.rows.length);

  return { args, operator, rowsByCanton };
}

/**
 * Formats operator report data (see `fetchOperatorReportData`) into the
 * human-readable report printed by the CLI. Pure formatting only, no network
 * requests.
 */
export function buildOperatorReport(data: OperatorReportData): string {
  const { args, operator, rowsByCanton } = data;
  const totalMunicipalities = rowsByCanton.reduce(
    (sum, c) => sum + c.rows.length,
    0
  );

  const lines: string[] = [];
  lines.push(`Year: ${args.year}`);
  lines.push(`Operator: ${operator.name} (${operator.id})`);
  lines.push(`Network level: ${args.networkLevel ?? "NE7 (default)"}`);
  lines.push("");
  lines.push(
    `Municipalities served: ${totalMunicipalities} across ${rowsByCanton.length} canton(s)`
  );

  if (rowsByCanton.length === 0) {
    lines.push("  No municipalities found for this operator/period.");
    return lines.join("\n");
  }

  for (const { canton, rows } of rowsByCanton) {
    lines.push("");
    lines.push(`${canton.name} (${canton.id}): ${rows.length} municipalities`);
    for (const row of rows) {
      lines.push(
        `  ${row.municipalityName} (${row.municipality}): via ${
          row.source
        }, coverageRatio=${row.coverageRatio.toFixed(2)}`
      );
    }
  }

  return lines.join("\n");
}
