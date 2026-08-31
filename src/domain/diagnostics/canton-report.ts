import { groupBy } from "lodash";
import { Client } from "urql";

import { getObservationsWeightedMean } from "src/domain/data";
import {
  buildEnrichedEnergyPricesData,
  getEnergyPriceLegendColor,
} from "src/domain/energy-prices-map-data";
import {
  AllMunicipalitiesDocument,
  AllMunicipalitiesQuery,
  CantonsDocument,
  CantonsQuery,
  ObservationsDocument,
  ObservationsQuery,
  OperatorMunicipalitiesDocument,
  OperatorMunicipalitiesQuery,
  OperatorsDocument,
  OperatorsQuery,
} from "src/graphql/queries";

export class CantonNotFoundError extends Error {
  code = "CANTON_NOT_FOUND" as const;
}

type CantonReportArgs = {
  year: string;
  category: string;
  priceComponent: string;
  product: string;
  canton: string;
  networkLevel?: string;
  locale?: string;
};

type CantonMunicipalityRow = {
  id: string;
  name: string;
  operators: Array<{ id: string; name: string }>;
  value: number | undefined;
  color: string | undefined;
};

type CantonReportData = {
  args: CantonReportArgs;
  canton: { id: string; name: string };
  municipalityRows: CantonMunicipalityRow[];
};

/**
 * Fetches the same GraphQL documents the energy prices map uses and reports
 * every municipality in a canton, the operator(s) serving it, and the
 * resulting legend color — a canton-scoped view of `energy-prices-report.ts`.
 */
export async function fetchCantonReportData(
  client: Client,
  args: CantonReportArgs
): Promise<CantonReportData> {
  const locale = args.locale ?? "en";

  const cantonResult = await client
    .query<CantonsQuery>(CantonsDocument, {
      locale,
      query: args.canton,
      ids: [args.canton],
    })
    .toPromise();
  if (cantonResult.error) throw cantonResult.error;

  const canton =
    (cantonResult.data?.cantons ?? []).find((c) => c.id === args.canton) ??
    (cantonResult.data?.cantons ?? []).find(
      (c) => c.name.toLowerCase() === args.canton.toLowerCase()
    );
  if (!canton) {
    throw new CantonNotFoundError(`Canton not found: ${args.canton}`);
  }

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

  const enrichedData = buildEnrichedEnergyPricesData({
    observations: observationsResult.data?.observations ?? [],
    municipalities,
    cantonMedianObservations:
      observationsResult.data?.cantonMedianObservations ?? [],
    swissMedianObservations:
      observationsResult.data?.swissMedianObservations ?? [],
  });

  const cantonRows = (
    operatorMunicipalitiesResult.data?.operatorMunicipalities ?? []
  ).filter((row) => row.canton === canton.id);
  const rowsByMunicipality = groupBy(cantonRows, (r) => r.municipality);

  const operatorIds = Array.from(new Set(cantonRows.map((r) => r.operator)));
  const operatorsResult = operatorIds.length
    ? await client
        .query<OperatorsQuery>(OperatorsDocument, { locale, ids: operatorIds })
        .toPromise()
    : null;
  if (operatorsResult?.error) throw operatorsResult.error;
  const operatorNameById = new Map(
    (operatorsResult?.data?.operators ?? []).map((o) => [o.id, o.name])
  );

  const values = enrichedData.observations
    .map((o) => o.value)
    .filter((v): v is number => v !== null && v !== undefined);

  const municipalityRows: CantonMunicipalityRow[] = Object.entries(
    rowsByMunicipality
  )
    .map(([municipalityId, rows]) => {
      const municipality = municipalities.find((m) => m.id === municipalityId);
      const observations =
        enrichedData.observationsByMunicipality.get(municipalityId) ?? [];
      const value =
        observations.length > 0
          ? getObservationsWeightedMean(observations)
          : undefined;
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
        id: municipalityId,
        name: municipality?.name ?? "unknown",
        operators: rows.map((r) => ({
          id: r.operator,
          name: operatorNameById.get(r.operator) ?? "unknown",
        })),
        value,
        color,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return { args, canton, municipalityRows };
}

/**
 * Formats canton report data (see `fetchCantonReportData`) into the
 * human-readable report printed by the CLI. Pure formatting only, no network
 * requests.
 */
export function buildCantonReport(data: CantonReportData): string {
  const { args, canton, municipalityRows } = data;
  const grayRows = municipalityRows.filter((r) => r.color === undefined);

  const lines: string[] = [];
  lines.push(`Year: ${args.year}`);
  lines.push(`Category: ${args.category}`);
  lines.push(`Price component: ${args.priceComponent}`);
  lines.push(`Product: ${args.product}`);
  lines.push(`Canton: ${canton.name} (${canton.id})`);
  lines.push("");
  lines.push(
    `Municipalities: ${municipalityRows.length} (${grayRows.length} gray)`
  );
  lines.push("");

  for (const row of municipalityRows) {
    const operatorsLabel = row.operators.length
      ? row.operators.map((o) => `${o.name} (${o.id})`).join(", ")
      : "no operator";
    lines.push(
      `${row.name} (${row.id}): ${operatorsLabel} — ${
        row.color ?? "gray, no data"
      }`
    );
  }

  return lines.join("\n");
}
