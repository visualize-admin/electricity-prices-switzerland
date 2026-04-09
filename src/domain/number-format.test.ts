import { describe, expect, it } from "vitest";

import { d3FormatLocales } from "src/locales/locales";

import {
  DISPLAY_INTEGER_FROM_ABS,
  formatAxisNumber,
  formatDisplayNumber,
} from "./number-format";

const formatDe = d3FormatLocales.de.format;
const formatEn = d3FormatLocales.en.format;

describe("formatDisplayNumber (de/fr/it/aa — Swiss separators)", () => {
  it("two fixed decimals below threshold", () => {
    expect(formatDisplayNumber(0.12, formatDe)).toBe("0.12");
    expect(formatDisplayNumber(2.4, formatDe)).toBe("2.40");
    expect(formatDisplayNumber(152.12, formatDe)).toBe("152.12");
  });

  it("grouped integers from threshold", () => {
    expect(DISPLAY_INTEGER_FROM_ABS).toBe(1000);
    expect(formatDisplayNumber(1000, formatDe)).toBe("1'000");
    expect(formatDisplayNumber(56028, formatDe)).toBe("56'028");
  });

  it("negatives use ASCII minus", () => {
    expect(formatDisplayNumber(-54.23, formatDe)).toBe("-54.23");
    expect(formatDisplayNumber(-1021, formatDe)).toBe("-1'021");
  });
});

describe("formatDisplayNumber (en — US-style grouping)", () => {
  it("uses comma thousands from threshold", () => {
    expect(formatDisplayNumber(1021, formatEn)).toBe("1,021");
    expect(formatDisplayNumber(56028, formatEn)).toBe("56,028");
  });

  it("keeps two decimals below threshold", () => {
    expect(formatDisplayNumber(54.23, formatEn)).toBe("54.23");
  });

  it("placeholder locale aa uses same number rules as en", () => {
    const formatAa = d3FormatLocales.aa.format;
    expect(formatDisplayNumber(1021, formatAa)).toBe(
      formatDisplayNumber(1021, formatEn)
    );
  });
});

describe("formatAxisNumber", () => {
  it("integers with locale grouping", () => {
    expect(formatAxisNumber(54.23, formatDe)).toBe("54");
    expect(formatAxisNumber(56028, formatDe)).toBe("56'028");
    expect(formatAxisNumber(56028, formatEn)).toBe("56,028");
  });
});
