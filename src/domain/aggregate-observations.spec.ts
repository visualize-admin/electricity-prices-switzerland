import { describe, expect, it } from "vitest";

import {
  averageResolvedObservationsByOperator,
  getMunicipalityValue,
  getOperatorMeanValue,
  getSunshineOperatorValue,
} from "src/domain/aggregate-observations";

describe("getMunicipalityValue", () => {
  it("weights each operator's value by the share of the municipality it covers", () => {
    expect(
      getMunicipalityValue([
        { value: 20, coverageRatio: 0.75 },
        { value: 30, coverageRatio: 0.25 },
      ])
    ).toBe(22.5);
  });

  it("ignores rows without a value instead of counting them as 0", () => {
    expect(
      getMunicipalityValue([
        { value: 20, coverageRatio: 0.5 },
        { value: null, coverageRatio: 0.5 },
        { coverageRatio: 0.5 },
      ])
    ).toBe(20);
  });

  it("returns null when no row has a value", () => {
    expect(
      getMunicipalityValue([{ value: null, coverageRatio: 1 }])
    ).toBeNull();
    expect(getMunicipalityValue([])).toBeNull();
  });
});

describe("getSunshineOperatorValue", () => {
  it("ignores rows without a value", () => {
    expect(
      getSunshineOperatorValue([{ value: null }, { value: 1 }], "compliance")
    ).toBe(1);
    expect(
      getSunshineOperatorValue([{ value: null }, { value: 2 }], "saidi")
    ).toBe(2);
  });

  it("returns null when no row has a value", () => {
    expect(
      getSunshineOperatorValue([{ value: null }], "compliance")
    ).toBeNull();
    expect(getSunshineOperatorValue([], "saidi")).toBeNull();
  });
});

describe("getOperatorMeanValue", () => {
  it("averages the operator's values across municipalities", () => {
    expect(
      getOperatorMeanValue([{ value: 1.1 }, { value: 1.5 }, { value: 1.4 }])
    ).toBeCloseTo(1.333, 3);
  });

  it("ignores missing values", () => {
    expect(
      getOperatorMeanValue([{ value: 2 }, { value: null }, {}, { value: 4 }])
    ).toBe(3);
  });

  it("returns null when there is no value", () => {
    expect(getOperatorMeanValue([{ value: null }])).toBeNull();
    expect(getOperatorMeanValue([])).toBeNull();
  });
});

describe("averageResolvedObservationsByOperator", () => {
  const obs = (
    operator: string,
    category: string,
    period: string,
    municipality: string,
    total: number | null,
    energy: number
  ) => ({
    operator,
    operatorLabel: `Operator ${operator}`,
    category,
    period,
    municipality,
    municipalityLabel: `Municipality ${municipality}`,
    total,
    energy,
  });

  it("averages each price component per operator, category and period", () => {
    const result = averageResolvedObservationsByOperator(
      [
        obs("bkw", "H4", "2026", "1", 10, 4),
        obs("bkw", "H4", "2026", "2", 20, 6),
        obs("bkw", "H4", "2027", "1", 30, 8),
        obs("bkw", "H4", "2027", "2", null, 10),
        obs("bkw", "C2", "2026", "1", 40, 2),
        obs("ckw", "H4", "2026", "3", 50, 12),
      ],
      ["total", "energy"]
    );

    expect(result).toEqual([
      {
        operator: "bkw",
        operatorLabel: "Operator bkw",
        category: "H4",
        period: "2026",
        total: 15,
        energy: 5,
      },
      {
        operator: "bkw",
        operatorLabel: "Operator bkw",
        category: "H4",
        period: "2027",
        total: 30,
        energy: 9,
      },
      {
        operator: "bkw",
        operatorLabel: "Operator bkw",
        category: "C2",
        period: "2026",
        total: 40,
        energy: 2,
      },
      {
        operator: "ckw",
        operatorLabel: "Operator ckw",
        category: "H4",
        period: "2026",
        total: 50,
        energy: 12,
      },
    ]);
  });
});
