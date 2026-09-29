import { describe, expect, it } from "vitest";

import {
  averageOperatorObservationsByPeriod,
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

describe("averageOperatorObservationsByPeriod", () => {
  const obs = (
    operator: string,
    period: string,
    municipality: string,
    value: number | null
  ) => ({
    operator,
    operatorLabel: `Operator ${operator}`,
    period,
    municipality,
    municipalityLabel: `Municipality ${municipality}`,
    value,
  });

  it("returns one observation per operator and period", () => {
    const result = averageOperatorObservationsByPeriod([
      obs("bkw", "2026", "1", 1.0),
      obs("bkw", "2026", "2", 2.0),
      obs("bkw", "2027", "1", 3.0),
      obs("bkw", "2027", "2", null),
      obs("ckw", "2026", "3", 5.0),
    ]);

    expect(result).toEqual([
      {
        operator: "bkw",
        operatorLabel: "Operator bkw",
        period: "2026",
        municipality: "",
        municipalityLabel: null,
        value: 1.5,
      },
      {
        operator: "bkw",
        operatorLabel: "Operator bkw",
        period: "2027",
        municipality: "",
        municipalityLabel: null,
        value: 3.0,
      },
      {
        operator: "ckw",
        operatorLabel: "Operator ckw",
        period: "2026",
        municipality: "",
        municipalityLabel: null,
        value: 5.0,
      },
    ]);
  });
});
