import { describe, expect, it } from "vitest";

import { pickHighlightDate } from "src/components/charts-generic/interaction/highlight-indicator";

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
