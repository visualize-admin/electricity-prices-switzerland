import { groupBy } from "lodash";
import { Client } from "urql";

import {
  CantonsDocument,
  CantonsQuery,
  OperatorMunicipalitiesDocument,
  OperatorMunicipalitiesQuery,
  OperatorsDocument,
  OperatorsQuery,
} from "src/graphql/queries";

const DEFAULT_MIN_MINORITY_RATIO = 0.2;

type OperatorAnomaliesReportArgs = {
  year: string;
  networkLevel?: string;
  locale?: string;
  minMinorityRatio?: number;
};

type CantonBreakdown = { canton: { id: string; name: string }; count: number };

type OperatorAnomaly = {
  operator: { id: string; name: string };
  totalMunicipalities: number;
  cantons: CantonBreakdown[];
  minorityCantons: CantonBreakdown[];
};

type OperatorAnomaliesReportData = {
  args: OperatorAnomaliesReportArgs;
  totalOperators: number;
  anomalies: OperatorAnomaly[];
};

/**
 * Fetches the same `operatorMunicipalities` document the map's operator
 * layer uses and flags operators that serve municipalities across more than
 * one canton where at least one canton is a small minority of that
 * operator's total municipalities — the check that would have surfaced ewz
 * (operator 565) serving 8 Graubünden municipalities alongside its 30 Zürich
 * ones without needing to grep a CSV export by hand. A flagged operator is
 * not necessarily a bug: cross-canton service can be a legitimate historical
 * artifact (as with ewz's century-old hydro/grid assets in the Domleschg
 * valley) — this report surfaces candidates for a second look, not verdicts.
 */
export async function fetchOperatorAnomaliesReportData(
  client: Client,
  args: OperatorAnomaliesReportArgs
): Promise<OperatorAnomaliesReportData> {
  const locale = args.locale ?? "en";
  const minMinorityRatio = args.minMinorityRatio ?? DEFAULT_MIN_MINORITY_RATIO;

  const operatorMunicipalitiesResult = await client
    .query<OperatorMunicipalitiesQuery>(OperatorMunicipalitiesDocument, {
      period: args.year,
      networkLevel: args.networkLevel,
    })
    .toPromise();
  if (operatorMunicipalitiesResult.error)
    throw operatorMunicipalitiesResult.error;

  const rows = operatorMunicipalitiesResult.data?.operatorMunicipalities ?? [];
  const rowsByOperator = groupBy(rows, (r) => r.operator);

  const operatorIds = Object.keys(rowsByOperator);
  const cantonIds = Array.from(new Set(rows.map((r) => r.canton)));

  const [operatorsResult, cantonsResult] = await Promise.all([
    operatorIds.length
      ? client
          .query<OperatorsQuery>(OperatorsDocument, {
            locale,
            ids: operatorIds,
          })
          .toPromise()
      : Promise.resolve(null),
    cantonIds.length
      ? client
          .query<CantonsQuery>(CantonsDocument, { locale, ids: cantonIds })
          .toPromise()
      : Promise.resolve(null),
  ]);
  if (operatorsResult?.error) throw operatorsResult.error;
  if (cantonsResult?.error) throw cantonsResult.error;

  const operatorNameById = new Map(
    (operatorsResult?.data?.operators ?? []).map((o) => [o.id, o.name])
  );
  const cantonNameById = new Map(
    (cantonsResult?.data?.cantons ?? []).map((c) => [c.id, c.name])
  );

  const anomalies: OperatorAnomaly[] = [];

  for (const [operatorId, operatorRows] of Object.entries(rowsByOperator)) {
    const countByCanton = groupBy(operatorRows, (r) => r.canton);
    const cantons: CantonBreakdown[] = Object.entries(countByCanton)
      .map(([cantonId, cantonRows]) => ({
        canton: {
          id: cantonId,
          name: cantonNameById.get(cantonId) ?? `Canton ${cantonId}`,
        },
        count: cantonRows.length,
      }))
      .sort((a, b) => b.count - a.count);

    if (cantons.length < 2) continue;

    const totalMunicipalities = operatorRows.length;
    const minorityCantons = cantons.filter(
      (c) => c.count / totalMunicipalities < minMinorityRatio
    );

    if (minorityCantons.length === 0) continue;

    anomalies.push({
      operator: {
        id: operatorId,
        name: operatorNameById.get(operatorId) ?? `Operator ${operatorId}`,
      },
      totalMunicipalities,
      cantons,
      minorityCantons,
    });
  }

  anomalies.sort((a, b) => a.operator.name.localeCompare(b.operator.name));

  return { args, totalOperators: operatorIds.length, anomalies };
}

/**
 * Formats operator-anomalies report data (see
 * `fetchOperatorAnomaliesReportData`) into the human-readable report printed
 * by the CLI. Pure formatting only, no network requests.
 */
export function buildOperatorAnomaliesReport(
  data: OperatorAnomaliesReportData,
  { limit }: { limit?: number } = {}
): string {
  const { args, totalOperators, anomalies } = data;
  const minMinorityRatio = args.minMinorityRatio ?? DEFAULT_MIN_MINORITY_RATIO;

  const lines: string[] = [];
  lines.push(`Year: ${args.year}`);
  lines.push(`Network level: ${args.networkLevel ?? "NE7 (default)"}`);
  lines.push(
    `Minority canton threshold: < ${
      minMinorityRatio * 100
    }% of an operator's municipalities`
  );
  lines.push("");
  lines.push(`Flagged operators: ${anomalies.length} / ${totalOperators}`);

  if (anomalies.length === 0) {
    return lines.join("\n");
  }

  lines.push("");

  const shown = limit ? anomalies.slice(0, limit) : anomalies;
  for (const anomaly of shown) {
    lines.push(
      `${anomaly.operator.name} (${anomaly.operator.id}): ${anomaly.totalMunicipalities} municipalities across ${anomaly.cantons.length} cantons`
    );
    const minorityCantonIds = new Set(
      anomaly.minorityCantons.map((c) => c.canton.id)
    );
    for (const c of anomaly.cantons) {
      const ratio = ((c.count / anomaly.totalMunicipalities) * 100).toFixed(0);
      const minority = minorityCantonIds.has(c.canton.id) ? " — minority" : "";
      lines.push(
        `  ${c.canton.name} (${c.canton.id}): ${c.count} (${ratio}%)${minority}`
      );
    }
  }

  if (limit && anomalies.length > limit) {
    lines.push("");
    lines.push(`... and ${anomalies.length - limit} more`);
  }

  return lines.join("\n");
}
