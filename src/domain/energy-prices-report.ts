import { getObservationsWeightedMean } from "src/domain/data";
import {
  buildEnrichedEnergyPricesData,
  getEnergyPriceLegendColor,
} from "src/domain/energy-prices-map-data";
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
import { Client } from "urql";

export class MunicipalityNotFoundError extends Error {}

export type EnergyPricesReportArgs = {
  year: string;
  category: string;
  priceComponent: string;
  product: string;
  municipality: string;
  networkLevel?: string;
  locale?: string;
};

export type EnergyPricesReportData = {
  args: EnergyPricesReportArgs;
  municipality: { id: string; name: string };
  operatorRows: Array<{ operator: string; source?: string | null }>;
  priceObservationsForMunicipality: Array<{
    operator: string;
    value?: number | null;
    coverageRatio: number;
  }>;
  operatorNameById: Map<string, string>;
  color: string | undefined;
};

const isValidValue = <T extends { value?: number | null | undefined }>(
  x: T,
): x is T & { value: number } => x.value !== undefined && x.value !== null;

/**
 * Fetches the same GraphQL documents the energy prices map uses and runs the
 * same pure color computation, returning the data needed to report which
 * operators serve a municipality, via Offers or Observations, and the
 * resulting legend color.
 */
export async function fetchEnergyPricesReportData(
  client: Client,
  args: EnergyPricesReportArgs,
): Promise<EnergyPricesReportData> {
  const locale = args.locale ?? "en";

  const [
    municipalitiesResult,
    observationsResult,
    operatorMunicipalitiesResult,
  ] = await Promise.all([
    client
      .query<AllMunicipalitiesQuery>(AllMunicipalitiesDocument, { locale })
      .toPromise(),
    client
      .query<ObservationsQuery>(ObservationsDocument, {
        locale,
        priceComponent: args.priceComponent,
        filters: {
          period: [args.year],
          category: [args.category],
          product: [args.product],
        },
        networkLevel: args.networkLevel,
        // Fetch operators below the coverage threshold too, so we can report
        // which ones the map/API would normally ignore and why.
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
  if (operatorMunicipalitiesResult.error)
    throw operatorMunicipalitiesResult.error;

  const municipalities = municipalitiesResult.data?.municipalities ?? [];
  const municipality = municipalities.find(
    (m) =>
      m.id === args.municipality ||
      m.name.toLowerCase() === args.municipality.toLowerCase(),
  );

  if (!municipality) {
    throw new MunicipalityNotFoundError(
      `Municipality not found: ${args.municipality}`,
    );
  }

  const allObservations = observationsResult.data?.observations ?? [];
  // The API filters below-threshold operators out by default; since we asked
  // for them too (to report them), re-apply the same threshold here to
  // reproduce what the map/API would actually return.
  const includedObservations = allObservations.filter(
    (o) => o.coverageRatio >= COVERAGE_RATIO_THRESHOLD,
  );

  const enrichedData = buildEnrichedEnergyPricesData({
    observations: includedObservations,
    municipalities,
    cantonMedianObservations:
      observationsResult.data?.cantonMedianObservations ?? [],
    swissMedianObservations:
      observationsResult.data?.swissMedianObservations ?? [],
  });

  const operatorRows = (
    operatorMunicipalitiesResult.data?.operatorMunicipalities ?? []
  ).filter((row) => row.municipality === Number(municipality.id));

  const priceObservationsForMunicipality = allObservations.filter(
    (o) => o.municipality === municipality.id,
  );

  const operatorIds = Array.from(
    new Set([
      ...operatorRows.map((r) => r.operator),
      ...priceObservationsForMunicipality.map((o) => o.operator),
    ]),
  );
  const operatorsResult = operatorIds.length
    ? await client
        .query<OperatorsQuery>(OperatorsDocument, {
          locale,
          ids: operatorIds,
        })
        .toPromise()
    : null;
  if (operatorsResult?.error) throw operatorsResult.error;

  const operatorNameById = new Map(
    (operatorsResult?.data?.operators ?? []).map((o) => [o.id, o.name]),
  );

  const municipalityObservations =
    enrichedData.observationsByMunicipality.get(municipality.id) ?? [];
  const value =
    municipalityObservations.length > 0
      ? getObservationsWeightedMean(municipalityObservations)
      : undefined;

  const values = enrichedData.observations
    .filter(isValidValue)
    .map((o) => o.value);
  const color =
    value !== undefined
      ? getEnergyPriceLegendColor({
          medianValue: enrichedData.medianValue,
          values,
          year: Number(args.year),
          value,
        })
      : undefined;

  return {
    args,
    municipality,
    operatorRows,
    priceObservationsForMunicipality,
    operatorNameById,
    color,
  };
}

/**
 * Formats energy prices report data (see `fetchEnergyPricesReportData`) into
 * the human-readable report printed by the CLI and asserted against in
 * regression tests. Pure formatting only, no network requests.
 */
export function buildEnergyPricesReport(data: EnergyPricesReportData): string {
  const {
    args,
    municipality,
    operatorRows,
    priceObservationsForMunicipality,
    operatorNameById,
    color,
  } = data;

  const source = operatorRows[0]?.source;

  const lines: string[] = [];
  lines.push(`Year: ${args.year}`);
  lines.push(`Price component: ${args.priceComponent}`);
  lines.push(`Category: ${args.category}`);
  lines.push(`Product: ${args.product}`);
  lines.push(`Municipality: ${municipality.name} (${municipality.id})`);
  lines.push(
    operatorRows.length
      ? `Operators: ${operatorRows
          .map(
            (r) =>
              `${operatorNameById.get(r.operator) ?? "unknown"} (${r.operator})`,
          )
          .join(", ")}`
      : "Operators: none",
  );
  lines.push(`Municipality Operator via: ${source ?? "n/a"}`);
  lines.push(`Color: ${color ?? "no data"}`);

  lines.push("");
  lines.push(
    `Operator coverage (network level: ${
      args.networkLevel ?? "NE7 (default)"
    }, threshold: ${COVERAGE_RATIO_THRESHOLD}):`,
  );
  if (priceObservationsForMunicipality.length === 0) {
    lines.push("  No price observations for this municipality/filter.");
  } else {
    for (const obs of priceObservationsForMunicipality) {
      const ignored = obs.coverageRatio < COVERAGE_RATIO_THRESHOLD;
      const name = operatorNameById.get(obs.operator) ?? "unknown";
      lines.push(
        `  ${name} (${obs.operator}): value=${
          obs.value ?? "n/a"
        }, coverageRatio=${obs.coverageRatio.toFixed(2)}${
          ignored ? " — IGNORED (below threshold)" : ""
        }`,
      );
    }
  }

  return lines.join("\n");
}
