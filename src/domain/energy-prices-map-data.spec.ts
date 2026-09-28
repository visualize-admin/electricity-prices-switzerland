import { describe, expect, it } from "vitest";

import {
  groupsFromCantonElectricityObservations,
  groupsFromElectricityMunicipalities,
  groupsFromElectricityOperators,
} from "src/components/list-groups";
import {
  averageOperatorObservationsByPeriod,
  getMunicipalityValue,
  getOperatorMeanValue,
} from "src/domain/aggregate-observations";
import { buildEnrichedEnergyPricesData } from "src/domain/energy-prices-map-data";
import { OperatorObservationFieldsFragment } from "src/graphql/queries";

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
    const rows = observations.filter((d) => d.municipality === "2");
    const expected = getMunicipalityValue(rows);
    expect(expected).toBe(22.5);

    const list = byId(groupsFromElectricityMunicipalities(observations));
    expect(enriched.municipalityValues.get("2")).toBe(expected);
    expect(list["2"].value).toBe(expected);

    expect(enriched.municipalityValues.get("1")).toBe(10);
    expect(list["1"].value).toBe(10);
    expect(enriched.valuesExtent).toEqual([10, 22.5]);
  });

  it("operator: mean across its municipalities in the map, tooltip, list, panel and chart", () => {
    const rows = observations.filter((d) => d.operator === "bkw");
    const expected = getOperatorMeanValue(rows);
    expect(expected).toBe(15);

    const list = byId(groupsFromElectricityOperators(observations));
    expect(enriched.observationsByOperatorAggregated["bkw"].value).toBe(
      expected
    );
    expect(list["bkw"].value).toBe(expected);
    expect(list["bkw"].operators[0].value).toBe(expected);
    expect(averageOperatorObservationsByPeriod(rows)).toMatchObject([
      { operator: "bkw", value: expected },
    ]);
  });

  it("canton: median in the map, tooltip and list", () => {
    const list = byId(
      groupsFromCantonElectricityObservations(enriched.cantonMedianObservations)
    );
    expect(enriched.cantonValues.get("BE")).toBe(17);
    expect(enriched.cantonMedianObservationsByCanton.get("BE")?.value).toBe(17);
    expect(list["BE"].value).toBe(17);
  });
});
