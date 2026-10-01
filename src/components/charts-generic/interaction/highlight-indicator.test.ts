import { describe, expect, it } from "vitest";

import {
  getHighlightLabelY,
  pickHighlightDate,
} from "src/components/charts-generic/interaction/highlight-indicator";

const d = (year: number) => new Date(year, 0, 1);

describe("pickHighlightDate", () => {
  const years = [d(2022), d(2023), d(2024)];

  it("uses the last datapoint when no year is set", () => {
    expect(pickHighlightDate(years, undefined)?.getFullYear()).toBe(2024);
  });

  it("picks the exact year when present", () => {
    expect(pickHighlightDate(years, 2023)?.getFullYear()).toBe(2023);
  });

  it("picks the closest year when the exact year is missing", () => {
    expect(pickHighlightDate(years, 2025)?.getFullYear()).toBe(2024);
  });
});

describe("getHighlightLabelY", () => {
  // Label spans x 10..60 and is 10px high; gap defaults to 2
  const base = {
    labelX0: 10,
    labelX1: 60,
    labelHeight: 10,
    chartHeight: 100,
  };

  it("keeps the label at the anchor when no line is in the way", () => {
    expect(
      getHighlightLabelY({
        ...base,
        anchorY: 50,
        lines: [
          [
            { x: 0, y: 90 },
            { x: 100, y: 90 },
          ],
        ],
      })
    ).toBe(50);
  });

  it("moves the label up above the line", () => {
    // Flat line at y=50 under the label: label center goes to 50 - 5 - 2
    expect(
      getHighlightLabelY({
        ...base,
        anchorY: 50,
        lines: [
          [
            { x: 0, y: 50 },
            { x: 100, y: 50 },
          ],
        ],
      })
    ).toBe(43);
  });

  it("uses where the line crosses the label edges, not only its points", () => {
    // Points are outside the label span; the line rises from y=60 to y=40,
    // crossing x=10 at 58 and x=60 at 48
    expect(
      getHighlightLabelY({
        ...base,
        anchorY: 55,
        lines: [
          [
            { x: 0, y: 60 },
            { x: 100, y: 40 },
          ],
        ],
      })
    ).toBe(41);
  });

  it("moves the label down when there is no room above", () => {
    expect(
      getHighlightLabelY({
        ...base,
        anchorY: 5,
        lines: [
          [
            { x: 0, y: 5 },
            { x: 100, y: 5 },
          ],
        ],
      })
    ).toBe(12);
  });

  it("stays inside the chart when there is no free position", () => {
    const y = getHighlightLabelY({
      ...base,
      chartHeight: 12,
      anchorY: 6,
      lines: [
        [
          { x: 0, y: 6 },
          { x: 100, y: 6 },
        ],
      ],
    });
    expect(y).toBeGreaterThanOrEqual(5);
    expect(y).toBeLessThanOrEqual(7);
  });

  it("terminates when rounding keeps the label touching the line", () => {
    // (47.04 - 9.2) + 9.2 > 47.04 in floating point, so the line point still
    // collides after moving the label above it
    const y = getHighlightLabelY({
      ...base,
      labelHeight: 14.4,
      chartHeight: 300,
      anchorY: 47.04,
      lines: [
        [
          { x: 0, y: 47.04 },
          { x: 100, y: 47.04 },
        ],
      ],
    });
    expect(y).toBeCloseTo(37.84);
  });
});
