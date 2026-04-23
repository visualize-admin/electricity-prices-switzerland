import { describe, expect, it, vi } from "vitest";

// lines-state imports translation → @lingui/macro; stub before module load.
vi.mock("src/domain/translation", () => ({
  getLocalizedLabel: ({ id }: { id: string }) => id,
}));
vi.mock("src/domain/metrics", () => ({
  RP_PER_KWH: { id: "rp-kwh" },
}));

import {
  getLineChartYScaleDomain,
  getLineYValue,
} from "src/components/charts-generic/lines/lines-state";
import type { GenericObservation } from "src/domain/data";

describe("getLineChartYScaleDomain", () => {
  it("ignores non-finite y so domain is never NaN (matches useLinesState y-scale comment)", () => {
    const yKey = "value";
    const data: GenericObservation[] = [
      { period: "2020", value: 10 },
      { period: "2021", value: Number.NaN },
      { period: "2022", value: 30 },
    ];
    const [yMin, yMax] = getLineChartYScaleDomain(data, (d) =>
      getLineYValue(d, yKey)
    );
    expect(yMin).toBe(10);
    expect(yMax).toBe(30);
    expect(Number.isFinite(yMin) && Number.isFinite(yMax)).toBe(true);
  });
});
