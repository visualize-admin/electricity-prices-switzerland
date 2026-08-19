import { describe, expect, test } from "vitest";

import { getObservationsWeightedMean } from "src/domain/data";
import {
  buildEnrichedEnergyPricesData,
  getEnergyPriceLegendColor,
} from "src/domain/energy-prices-map-data";
import { createNodeGraphqlClient } from "src/graphql/node-client";
import {
  AllMunicipalitiesDocument,
  AllMunicipalitiesQuery,
  ObservationsDocument,
  ObservationsQuery,
  OperatorMunicipalitiesDocument,
  OperatorMunicipalitiesQuery,
} from "src/graphql/queries";

const ENDPOINT = `${
  process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"
}/api/graphql`;

const isValidValue = <T extends { value?: number | null | undefined }>(
  x: T
): x is T & { value: number } => x.value !== undefined && x.value !== null;

/**
 * Guards against regressions in how the energy prices map colors a
 * municipality: hits the real GraphQL API (same documents as the map and
 * the energy-prices CLI) and asserts a known snapshot. If Zurich's price
 * data for this filter combination changes, this is expected to need
 * updating alongside it.
 */
describe("energy prices map data (against live GraphQL API)", () => {
  test("Zurich 2025 H4/total/standard resolves via offers and colors dark green", async () => {
    const client = createNodeGraphqlClient(ENDPOINT);
    const locale = "de";
    const year = "2025";

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
          priceComponent: "total",
          filters: {
            period: [year],
            category: ["H4"],
            product: ["standard"],
          },
        })
        .toPromise(),
      client
        .query<OperatorMunicipalitiesQuery>(OperatorMunicipalitiesDocument, {
          period: year,
        })
        .toPromise(),
    ]);

    expect(municipalitiesResult.error).toBeUndefined();
    expect(observationsResult.error).toBeUndefined();
    expect(operatorMunicipalitiesResult.error).toBeUndefined();

    const municipalities = municipalitiesResult.data?.municipalities ?? [];
    const zurich = municipalities.find((m) => m.id === "261");
    expect(zurich?.name).toBe("Zürich");

    const enrichedData = buildEnrichedEnergyPricesData({
      observations: observationsResult.data?.observations ?? [],
      municipalities,
      cantonMedianObservations:
        observationsResult.data?.cantonMedianObservations ?? [],
      swissMedianObservations:
        observationsResult.data?.swissMedianObservations ?? [],
    });

    const zurichObservations =
      enrichedData.observationsByMunicipality.get("261") ?? [];
    const value = getObservationsWeightedMean(zurichObservations);
    const values = enrichedData.observations
      .filter(isValidValue)
      .map((o) => o.value);

    const color = getEnergyPriceLegendColor({
      medianValue: enrichedData.medianValue,
      values,
      year: Number(year),
      value,
    });

    expect(color).toBe("dark green");

    const operatorRows = (
      operatorMunicipalitiesResult.data?.operatorMunicipalities ?? []
    ).filter((row) => row.municipality === 261);
    expect(operatorRows.map((r) => r.operator)).toContain("565");
    expect(operatorRows[0]?.source).toBe("OFFERS");
  });
});
