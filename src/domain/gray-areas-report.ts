import { group } from "d3";
import { groupBy } from "lodash";
import { Client } from "urql";

import { buildEnrichedEnergyPricesData } from "src/domain/energy-prices-map-data";
import {
  AllMunicipalitiesDocument,
  AllMunicipalitiesQuery,
  ObservationsDocument,
  ObservationsQuery,
  OperatorMunicipalitiesDocument,
  OperatorMunicipalitiesQuery,
  OperatorsDocument,
  OperatorsQuery,
} from "src/graphql/queries";
import { COVERAGE_RATIO_THRESHOLD } from "src/rdf/coverage-ratio";

export type GrayAreaEntity = "municipality" | "operator";

export type GrayAreasReportArgs = {
  year: string;
  category: string;
  priceComponent: string;
  product: string;
  entity: GrayAreaEntity;
  networkLevel?: string;
  locale?: string;
};

type OperatorDiagnosis = {
  id: string;
  name: string;
  reason: "no-observation" | "below-coverage-threshold" | "null-value";
  coverageRatio?: number;
};

export type GrayArea = {
  municipality: { id: string; name: string };
  operators: OperatorDiagnosis[];
};

export type GrayAreasReportData = {
  args: GrayAreasReportArgs;
  totalMunicipalities: number;
  grayAreas: GrayArea[];
};

/**
 * Fetches the same GraphQL documents the energy prices map uses and runs the
 * same pure grouping/coloring logic to find every municipality (or, for the
 * operator entity, every municipality's serving-operator group) that the map
 * would render without a color ("gray"), along with why each relevant
 * operator has no usable value for the given filters.
 */
export async function fetchGrayAreasReportData(
  client: Client,
  args: GrayAreasReportArgs
): Promise<GrayAreasReportData> {
  const locale = args.locale ?? "en";
  const filters = {
    period: [args.year],
    category: [args.category],
    product: [args.product],
  };

  const [
    municipalitiesResult,
    observationsResult,
    observationsIncludingBelowThresholdResult,
    operatorMunicipalitiesResult,
  ] = await Promise.all([
    client
      .query<AllMunicipalitiesQuery>(AllMunicipalitiesDocument, { locale })
      .toPromise(),
    client
      .query<ObservationsQuery>(ObservationsDocument, {
        locale,
        priceComponent: args.priceComponent,
        filters,
        networkLevel: args.networkLevel,
      })
      .toPromise(),
    // Fetched separately (with below-threshold rows included) purely for
    // diagnostics, so we can tell "no observation exists at all" apart from
    // "an observation exists but was filtered out by the coverage-ratio
    // threshold" for operators that end up without a usable value.
    client
      .query<ObservationsQuery>(ObservationsDocument, {
        locale,
        priceComponent: args.priceComponent,
        filters,
        networkLevel: args.networkLevel,
        includeBelowCoverageThreshold: true,
      })
      .toPromise(),
    client
      .query<OperatorMunicipalitiesQuery>(OperatorMunicipalitiesDocument, {
        period: args.year,
        networkLevel: args.networkLevel,
      })
      .toPromise(),
  ]);

  if (municipalitiesResult.error) throw municipalitiesResult.error;
  if (observationsResult.error) throw observationsResult.error;
  if (observationsIncludingBelowThresholdResult.error)
    throw observationsIncludingBelowThresholdResult.error;
  if (operatorMunicipalitiesResult.error)
    throw operatorMunicipalitiesResult.error;

  const municipalities = municipalitiesResult.data?.municipalities ?? [];
  const municipalityNameById = new Map(
    municipalities.map((m) => [m.id, m.name])
  );

  const enrichedData = buildEnrichedEnergyPricesData({
    observations: observationsResult.data?.observations ?? [],
    municipalities,
    cantonMedianObservations: [],
    swissMedianObservations: [],
  });

  const rowsIncludingBelowThresholdByOperator = group(
    observationsIncludingBelowThresholdResult.data?.observations ?? [],
    (o) => o.operator
  );

  type OperatorMunicipalityRow =
    OperatorMunicipalitiesQuery["operatorMunicipalities"][number];

  const operatorMunicipalityRows: OperatorMunicipalityRow[] =
    operatorMunicipalitiesResult.data?.operatorMunicipalities ?? [];
  const operatorMunicipalityRowsByMunicipality: Record<
    string,
    OperatorMunicipalityRow[]
  > = groupBy(operatorMunicipalityRows, (r) => r.municipality);

  const allOperatorIds = Array.from(
    new Set(operatorMunicipalityRows.map((r) => r.operator))
  );
  const operatorsResult = allOperatorIds.length
    ? await client
        .query<OperatorsQuery>(OperatorsDocument, {
          locale,
          ids: allOperatorIds,
        })
        .toPromise()
    : null;
  if (operatorsResult?.error) throw operatorsResult.error;
  const operatorNameById = new Map(
    (operatorsResult?.data?.operators ?? []).map((o) => [o.id, o.name])
  );

  const diagnoseOperator = (operatorId: string): OperatorDiagnosis | null => {
    const aggregated = enrichedData.observationsByOperatorAggregated[
      operatorId
    ] as { value: number | null } | undefined;
    if (
      aggregated &&
      aggregated.value !== null &&
      aggregated.value !== undefined
    ) {
      // Has a usable value: not a reason for grayness.
      return null;
    }

    const name = operatorNameById.get(operatorId) ?? `Operator ${operatorId}`;
    const rawRows = rowsIncludingBelowThresholdByOperator.get(operatorId) ?? [];
    if (rawRows.length === 0) {
      return { id: operatorId, name, reason: "no-observation" };
    }
    const maxCoverageRatio = Math.max(...rawRows.map((r) => r.coverageRatio));
    if (maxCoverageRatio < COVERAGE_RATIO_THRESHOLD) {
      return {
        id: operatorId,
        name,
        reason: "below-coverage-threshold",
        coverageRatio: maxCoverageRatio,
      };
    }
    return { id: operatorId, name, reason: "null-value" };
  };

  const grayAreas: GrayArea[] = [];

  if (args.entity === "municipality") {
    for (const municipality of municipalities) {
      if (enrichedData.observationsByMunicipality.has(municipality.id)) {
        continue;
      }
      const servingRows =
        operatorMunicipalityRowsByMunicipality[municipality.id] ?? [];
      const operators = servingRows
        .map((r) => diagnoseOperator(r.operator))
        .filter((o): o is OperatorDiagnosis => o !== null);
      grayAreas.push({ municipality, operators });
    }
  } else {
    // entity === "operator": the map colors each municipality by the mean of
    // all operators serving it (see makeOperatorLayer in
    // src/components/map-layers.tsx). A municipality is gray when none of
    // its serving operators has a usable value.
    for (const [municipalityId, servingRows] of Object.entries(
      operatorMunicipalityRowsByMunicipality
    )) {
      const diagnoses = servingRows
        .map((r) => diagnoseOperator(r.operator))
        .filter((o): o is OperatorDiagnosis => o !== null);
      const allOperatorsLackData = diagnoses.length === servingRows.length;
      if (!allOperatorsLackData) {
        continue;
      }
      grayAreas.push({
        municipality: {
          id: municipalityId,
          name: municipalityNameById.get(municipalityId) ?? "unknown",
        },
        operators: diagnoses,
      });
    }
  }

  grayAreas.sort((a, b) => a.municipality.id.localeCompare(b.municipality.id));

  return {
    args,
    totalMunicipalities:
      args.entity === "municipality"
        ? municipalities.length
        : Object.keys(operatorMunicipalityRowsByMunicipality).length,
    grayAreas,
  };
}

const REASON_LABEL: Record<OperatorDiagnosis["reason"], string> = {
  "no-observation": "no price observation for this year/category/product",
  "below-coverage-threshold": "coverage ratio below threshold",
  "null-value": "observation(s) exist but resolve to no value",
};

/**
 * Formats gray-areas report data (see `fetchGrayAreasReportData`) into the
 * human-readable report printed by the CLI. Pure formatting only, no network
 * requests.
 */
export function buildGrayAreasReport(
  data: GrayAreasReportData,
  { limit }: { limit?: number } = {}
): string {
  const { args, totalMunicipalities, grayAreas } = data;

  const lines: string[] = [];
  lines.push(`Year: ${args.year}`);
  lines.push(`Price component: ${args.priceComponent}`);
  lines.push(`Category: ${args.category}`);
  lines.push(`Product: ${args.product}`);
  lines.push(`Entity: ${args.entity}`);
  lines.push(`Network level: ${args.networkLevel ?? "NE7 (default)"}`);
  lines.push("");
  lines.push(
    `Gray areas: ${grayAreas.length} / ${totalMunicipalities} municipalities`
  );

  if (grayAreas.length === 0) {
    return lines.join("\n");
  }

  lines.push("");

  const shown = limit ? grayAreas.slice(0, limit) : grayAreas;
  for (const area of shown) {
    lines.push(`${area.municipality.name} (${area.municipality.id})`);
    if (area.operators.length === 0) {
      lines.push(
        args.entity === "operator"
          ? "  No operators found serving this municipality for this period/network level."
          : "  No price observations found for any operator serving this municipality."
      );
      continue;
    }
    for (const op of area.operators) {
      const detail =
        op.reason === "below-coverage-threshold"
          ? `${REASON_LABEL[op.reason]} (${op.coverageRatio?.toFixed(
              2
            )} < ${COVERAGE_RATIO_THRESHOLD})`
          : REASON_LABEL[op.reason];
      lines.push(`  ${op.name} (${op.id}): ${detail}`);
    }
  }

  if (limit && grayAreas.length > limit) {
    lines.push("");
    lines.push(`... and ${grayAreas.length - limit} more`);
  }

  return lines.join("\n");
}
