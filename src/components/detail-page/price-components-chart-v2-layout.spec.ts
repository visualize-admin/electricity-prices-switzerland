import { describe, expect, it } from "vitest";

import { data } from "src/mocks/graphql/operator-31-vs-36-h5/ObservationsWithAllPriceComponents";

import {
  computeHighlight,
  computePriceComponentsLayout,
  computeSankeyLayout,
  findNearest,
  toPriceComponentsRows,
} from "./price-components-chart-v2-layout";

const rows = toPriceComponentsRows(data.observations ?? [], "operator");
const layout = computePriceComponentsLayout(rows, {
  width: 800,
  colorDomain: ["31", "36"],
});
const subplot = (pc: string) =>
  layout.subplots.find((s) => s.priceComponent === pc)!;

describe("computePriceComponentsLayout", () => {
  it("counts every row once in each price component", () => {
    for (const s of layout.subplots) {
      expect(s.bars.reduce((sum, b) => sum + b.count, 0)).toBe(rows.length);
    }
  });

  it("puts equal values in the same bar", () => {
    // Grid usage has one value per operator
    expect(subplot("gridusage").bars).toHaveLength(2);
  });
});

describe("computeHighlight", () => {
  it("follows the rows of the hovered bar through the other components", () => {
    const hovered = subplot("gridusage").bars.find((b) =>
      b.segments.every((s) => s.colorKey === "31")
    )!;
    const { matches, connectors } = computeHighlight(
      layout,
      new Set(hovered.segments.flatMap((s) => s.keys))
    );

    // Operator 31 charges the same everywhere: one charge bar lights up
    const chargeMatches = subplot("charge").bars.filter((b) =>
      matches.has(b.id)
    );
    expect(chargeMatches).toHaveLength(1);
    expect(matches.get(chargeMatches[0].id)?.get("31")).toBe(hovered.count);
    expect(connectors.length).toBeGreaterThan(0);
  });
});

describe("computeSankeyLayout", () => {
  it("carries every row from one price component to the next, ending on the total", () => {
    const sankey = computeSankeyLayout(layout, { height: 500 });
    expect(sankey.columns.at(-1)?.priceComponent).toBe("total");
    const linkedRows = sankey.links.reduce((sum, l) => sum + l.keys.length, 0);
    expect(linkedRows).toBe(rows.length * (sankey.columns.length - 1));
  });

  it("draws one sankey per operator", () => {
    const sankey = computeSankeyLayout(layout, { height: 500 });
    expect(sankey.bands.map((b) => b.colorKey)).toEqual(["31", "36"]);
    expect(sankey.links.every((l) => l.counts.length === 1)).toBe(true);
  });
});

describe("findNearest", () => {
  it("picks the closest target, also between them", () => {
    const targets = [
      { x: 0, y: 0, width: 2, height: 10 },
      { x: 10, y: 0, width: 2, height: 10 },
    ];
    expect(findNearest(targets, 4, 5)).toBe(targets[0]);
    expect(findNearest(targets, 8, 5)).toBe(targets[1]);
    expect(findNearest(targets, 100, 5)).toBeUndefined();
  });
});
