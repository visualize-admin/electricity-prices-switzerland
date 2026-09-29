// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { scaleThreshold } from "d3";
import { describe, expect, it, vi } from "vitest";

import { buildEnrichedEnergyPricesData } from "src/domain/energy-prices-map-data";
import { OperatorObservationFieldsFragment } from "src/graphql/queries";
import { useSelectedEntityData } from "src/hooks/use-selected-entity-data";

// @lingui/macro requires Babel transform; mock it to return message defaults
vi.mock("@lingui/macro", () => ({
  t: (d: { message?: string } | string) =>
    typeof d === "string" ? d : d.message ?? "",
  defineMessage: (d: object) => d,
  msg: (d: object) => d,
  Trans: ({ message, children }: { message?: string; children?: unknown }) =>
    message ?? children ?? null,
}));

const obs = (
  overrides: Pick<
    OperatorObservationFieldsFragment,
    "municipality" | "operator" | "value"
  >
): OperatorObservationFieldsFragment => ({
  __typename: "OperatorObservation",
  period: "2026",
  municipalityLabel: `Municipality ${overrides.municipality}`,
  operatorLabel: `Operator ${overrides.operator}`,
  canton: "BE",
  cantonLabel: "Bern",
  category: "H4",
  coverageRatio: 1,
  ...overrides,
});

const enrichedData = buildEnrichedEnergyPricesData({
  observations: [
    obs({ municipality: "1", operator: "bkw", value: 10 }),
    obs({ municipality: "2", operator: "bkw", value: 20 }),
    obs({ municipality: "3", operator: "empty", value: null }),
  ],
  municipalities: [],
  cantonMedianObservations: [],
  swissMedianObservations: [],
});

const tooltipFor = (operatorId: string) =>
  renderHook(() =>
    useSelectedEntityData({
      selection: {
        hoveredIds: [operatorId],
        selectedId: null,
        entityType: "operator",
      },
      dataType: "energy-prices",
      enrichedData,
      colorScale: scaleThreshold<number, string>()
        .domain([20])
        .range(["#00ff00", "#ff0000"]),
      formatValue: (v) => v.toFixed(2),
      priceComponent: "total",
    })
  ).result.current;

describe("useSelectedEntityData for an operator", () => {
  it("shows the operator figure used by the map and the list", () => {
    const { formattedData } = tooltipFor("bkw");
    expect(enrichedData.valuesByEntity.operator.get("bkw")).toBe(15);
    expect(formattedData?.values.map((v) => v.formattedValue)).toEqual([
      "15.00",
    ]);
  });

  it("shows no value, not 0.00, for an operator without a value", () => {
    const { formattedData, observations } = tooltipFor("empty");
    expect(enrichedData.valuesByEntity.operator.get("empty")).toBeNull();
    expect(observations?.[0].value).toBeNull();
    expect(formattedData?.values.map((v) => v.formattedValue)).toEqual([""]);
  });
});
