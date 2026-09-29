import { describe, expect, it } from "vitest";

import {
  groupsFromCantonElectricityObservations,
  groupsFromElectricityMunicipalities,
  groupsFromElectricityOperators,
  groupsFromSunshineObservations,
} from "src/components/list-groups";
import {
  aggregateSunshineObservationsByOperator,
  averageOperatorObservationsByPeriod,
  getMunicipalityValue,
  getOperatorMeanValue,
} from "src/domain/aggregate-observations";
import { buildEnrichedEnergyPricesData } from "src/domain/energy-prices-map-data";
import {
  OperatorObservationFieldsFragment,
  SunshineDataIndicatorRow,
} from "src/graphql/queries";

const obs = (
  overrides: Pick<
    OperatorObservationFieldsFragment,
    "municipality" | "operator" | "value" | "coverageRatio"
  >
): OperatorObservationFieldsFragment => ({
  __typename: "OperatorObservation",
  period: "2027",
  municipalityLabel: `Municipality ${overrides.municipality}`,
  operatorLabel: `Operator ${overrides.operator}`,
  canton: "BE",
  cantonLabel: "Bern",
  category: "H4",
  ...overrides,
});

// Rows of one entity differ on purpose: uniform test data hides the bugs
// where a view takes one row's value instead of the entity's figure
// (ELC-722, ELC-726).
const observations = [
  // BKW charges differ per municipality
  obs({ municipality: "1", operator: "bkw", value: 10, coverageRatio: 1 }),
  obs({ municipality: "2", operator: "bkw", value: 20, coverageRatio: 0.75 }),
  // Municipality 2 is served by two operators with different coverage
  obs({ municipality: "2", operator: "ekz", value: 30, coverageRatio: 0.25 }),
];

const enriched = buildEnrichedEnergyPricesData({
  observations,
  municipalities: [
    { __typename: "Municipality", id: "1", name: "Municipality 1" },
    { __typename: "Municipality", id: "2", name: "Municipality 2" },
  ],
  cantonMedianObservations: [
    {
      __typename: "CantonMedianObservation",
      period: "2027",
      canton: "BE",
      cantonLabel: "Bern",
      category: "H4",
      value: 17,
    },
  ],
  swissMedianObservations: [
    {
      __typename: "SwissMedianObservation",
      period: "2027",
      category: "H4",
      value: 18,
    },
  ],
});

const byId = <T>(groups: [string, T][]) =>
  Object.fromEntries(groups) as Record<string, T>;

describe("entity figures are the same in every view", () => {
  it("municipality: coverage-weighted mean in the map and the list", () => {
    // 0.75 * 20 + 0.25 * 30; a plain mean would give 25
    const rows = observations.filter((d) => d.municipality === "2");
    expect(getMunicipalityValue(rows)).toBe(22.5);

    const list = byId(groupsFromElectricityMunicipalities(observations));
    expect(enriched.valuesByEntity.municipality.get("2")).toBe(22.5);
    expect(list["2"].value).toBe(22.5);

    expect(enriched.valuesByEntity.municipality.get("1")).toBe(10);
    expect(list["1"].value).toBe(10);
    expect(enriched.valuesExtentByEntity.municipality).toEqual([10, 22.5]);
  });

  it("operator: mean across its municipalities in the map, tooltip, list, panel and chart", () => {
    // (10 + 20) / 2; the first row alone would give 10
    const rows = observations.filter((d) => d.operator === "bkw");
    expect(getOperatorMeanValue(rows)).toBe(15);

    const list = byId(groupsFromElectricityOperators(observations));
    expect(enriched.observationsByOperatorAggregated["bkw"].value).toBe(15);
    expect(enriched.valuesByEntity.operator.get("bkw")).toBe(15);
    expect(list["bkw"].value).toBe(15);
    expect(list["bkw"].operators[0].value).toBe(15);
    expect(averageOperatorObservationsByPeriod(rows)).toMatchObject([
      { operator: "bkw", value: 15 },
    ]);
    expect(enriched.valuesExtentByEntity.operator).toEqual([15, 30]);
  });

  it("canton: median in the map, tooltip and list", () => {
    const list = byId(
      groupsFromCantonElectricityObservations(enriched.cantonMedianObservations)
    );
    expect(enriched.valuesByEntity.canton.get("BE")).toBe(17);
    expect(enriched.valuesExtentByEntity.canton).toEqual([17, 17]);
    expect(enriched.cantonMedianObservationsByCanton.get("BE")?.value).toBe(17);
    expect(list["BE"].value).toBe(17);
  });

  it.each([
    ["saidi", 2],
    ["compliance", 1],
  ] as const)(
    "sunshine operator (%s): same figure in the map and the list",
    (indicator, expected) => {
      const rows: SunshineDataIndicatorRow[] = [1, 3].map((value) => ({
        __typename: "SunshineDataIndicatorRow",
        name: "BKW",
        operatorId: 36,
        operatorUID: "bkw",
        period: "2026",
        value,
      }));

      const map = aggregateSunshineObservationsByOperator(
        new Map([["36", rows]]),
        indicator
      );
      const list = byId(groupsFromSunshineObservations(rows, indicator));
      expect(map["36"].value).toBe(expected);
      expect(list["36"].value).toBe(expected);
    }
  );
});
