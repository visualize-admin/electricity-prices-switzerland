import { describe, expect, it } from "vitest";

import { data } from "src/mocks/graphql/operator-31-vs-36-h5/ObservationsWithAllPriceComponents";

import { computeBarsLayout } from "./price-components-chart-v2-bars-layout";
import {
  computePriceComponentsLayout,
  toPriceComponentsRows,
} from "./price-components-chart-v2-layout";

const rows = toPriceComponentsRows(data.observations ?? [], "operator");
const layout = computePriceComponentsLayout(rows, {
  width: 800,
  colorDomain: ["31", "36"],
});
const { profiles } = computeBarsLayout(rows, layout);

describe("computeBarsLayout", () => {
  it("draws one bar per operator and set of prices, highest total on top", () => {
    // Operator 31 has the same prices everywhere, 36 has 18 sets
    expect(profiles).toHaveLength(19);
    expect(profiles.reduce((sum, p) => sum + p.keys.length, 0)).toBe(
      rows.length
    );
    const totals = profiles.map((p) => p.total);
    expect(totals).toEqual([...totals].sort((a, b) => b - a));
  });

  it("stacks the price components up to the total", () => {
    for (const profile of profiles) {
      const sum = profile.segments.reduce((s, seg) => s + seg.value, 0);
      expect(sum).toBeCloseTo(profile.total);
    }
  });
});
