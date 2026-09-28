import { describe, expect, it } from "vitest";

import {
  averageOperatorObservationsByPeriod,
  getOperatorMeanValue,
} from "src/domain/aggregate-observations";

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
