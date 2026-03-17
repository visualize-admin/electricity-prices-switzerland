import { describe, expect, it, test, vi } from "vitest";

import { Trend } from "src/graphql/resolver-types";
import { fetchSaidi, fetchSaifi } from "src/lib/sunshine-data";
import {
  OperatorDataRecord,
  SunshineDataService,
} from "src/lib/sunshine-data-service";

const mockOperatorData: OperatorDataRecord = {
  operator_id: 100,
  operator_uid: "100",
  operator_name: "Test Operator",
  period: 2023,
  settlement_density: "High",
  energy_density: "High",
  peer_group: "1",
};

const createMockDb = (
  overrides: Partial<SunshineDataService> = {}
): SunshineDataService => ({
  name: "mock",
  getNetworkCosts: vi.fn().mockResolvedValue([]),
  getOperationalStandards: vi.fn().mockResolvedValue([]),
  getStabilityMetrics: vi.fn().mockResolvedValue([]),
  getTariffs: vi.fn().mockResolvedValue([]),
  getOperatorData: vi.fn().mockResolvedValue(mockOperatorData),
  getYearlyIndicatorMedians: vi.fn().mockResolvedValue([]),
  getLatestYearSunshine: vi.fn().mockResolvedValue(2023),
  getOperatorPeerGroup: vi.fn().mockResolvedValue({}),
  getPeerGroups: vi.fn().mockResolvedValue([]),
  getSunshineData: vi.fn().mockResolvedValue([]),
  getSunshineDataByIndicator: vi.fn().mockResolvedValue([]),
  fetchUpdateDate: vi.fn().mockResolvedValue("2024-01-01"),
  ...overrides,
});

type FetchFn = typeof fetchSaidi | typeof fetchSaifi;

type TestMedianRecord = {
  period: number;
  group: string;
  median_saidi_total: number | null | undefined;
  median_saidi_unplanned: number | null | undefined;
  median_saifi_total: number | null | undefined;
  median_saifi_unplanned: number | null | undefined;
};

type MedianScenario = {
  scenario: string;
  yearlyMedians: TestMedianRecord[];
  expectedSaidiMedianTotal: number | null | undefined;
  expectedSaidiMedianUnplanned: number | null | undefined;
  expectedSaifiMedianTotal: number | null | undefined;
  expectedSaifiMedianUnplanned: number | null | undefined;
  expectedTrendTotal: Trend;
  expectedTrendUnplanned: Trend;
};

type MetricConfig = {
  label: string;
  fetchFn: FetchFn;
  totalKey: "saidi_total" | "saifi_total";
  medianTotalKey: "median_saidi_total" | "median_saifi_total";
  medianUnplannedKey: "median_saidi_unplanned" | "median_saifi_unplanned";
};

describe.each([
  {
    label: "fetchSaidi",
    fetchFn: fetchSaidi as FetchFn,
    totalKey: "saidi_total" as const,
    medianTotalKey: "median_saidi_total" as const,
    medianUnplannedKey: "median_saidi_unplanned" as const,
  },
  {
    label: "fetchSaifi",
    fetchFn: fetchSaifi as FetchFn,
    totalKey: "saifi_total" as const,
    medianTotalKey: "median_saifi_total" as const,
    medianUnplannedKey: "median_saifi_unplanned" as const,
  },
] satisfies MetricConfig[])(
  "createStabilityMetricFetcher ($label)",
  ({ fetchFn, totalKey, medianTotalKey, medianUnplannedKey }) => {
    test.each([
      { valueLabel: "undefined", totalValue: undefined },
      { valueLabel: "null", totalValue: null },
    ] satisfies Array<{ valueLabel: string; totalValue: null | undefined }>)(
      "filters out yearly stability records with $valueLabel $totalKey from yearlyData",
      async ({ totalValue }) => {
        const db = createMockDb({
          getStabilityMetrics: vi.fn().mockImplementation(async (params) => {
            if (params.peerGroup) {
              return [
                {
                  operator_id: 200,
                  operator_name: "Operator A",
                  period: 2023,
                  saidi_total: 40,
                  saidi_unplanned: 10,
                  saifi_total: 1.5,
                  saifi_unplanned: 0.5,
                  [totalKey]: totalValue,
                },
                {
                  operator_id: 201,
                  operator_name: "Operator B",
                  period: 2023,
                  saidi_total: 50,
                  saidi_unplanned: 30,
                  saifi_total: 2.0,
                  saifi_unplanned: 0.8,
                },
              ];
            }
            return [];
          }),
        });

        const result = await fetchFn(db, {
          operatorId: 100,
          operatorData: mockOperatorData,
          period: 2023,
        });

        const operatorIds = result.yearlyData.map((d) => d.operator_id);
        expect(operatorIds).not.toContain(200);
        expect(operatorIds).toContain(201);
      }
    );

    it("returns null operatorTotal and null trends when operator has no stability record", async () => {
      const result = await fetchFn(createMockDb(), {
        operatorId: 100,
        operatorData: mockOperatorData,
        period: 2023,
      });

      expect(result.operatorTotal).toBeNull();
      expect(result.operatorUnplanned).toBeNull();
      expect(result.trendTotal).toBeNull();
      expect(result.trendUnplanned).toBeNull();
    });

    test.each([
      {
        scenario: "undefined median values",
        yearlyMedians: [
          {
            period: 2023,
            group: "1",
            median_saidi_total: undefined,
            median_saidi_unplanned: undefined,
            median_saifi_total: undefined,
            median_saifi_unplanned: undefined,
          },
        ],
        expectedSaidiMedianTotal: undefined,
        expectedSaidiMedianUnplanned: undefined,
        expectedSaifiMedianTotal: undefined,
        expectedSaifiMedianUnplanned: undefined,
        expectedTrendTotal: Trend.Stable,
        expectedTrendUnplanned: Trend.Stable,
      },
      {
        // Regression: undefined SPARQL values used to be coerced to 0 via `|| "0"`.
        // The fix (5fea73f) changed this to `|| undefined` so parseFloatOrNull returns
        // null instead of 0. peerGroupMedianTotal must be null, not 0.
        scenario: "null median values (undefined SPARQL source, fix 5fea73f)",
        yearlyMedians: [
          {
            period: 2023,
            group: "1",
            median_saidi_total: null,
            median_saidi_unplanned: null,
            median_saifi_total: null,
            median_saifi_unplanned: null,
          },
        ],
        expectedSaidiMedianTotal: null,
        expectedSaidiMedianUnplanned: null,
        expectedSaifiMedianTotal: null,
        expectedSaifiMedianUnplanned: null,
        expectedTrendTotal: Trend.Stable,
        expectedTrendUnplanned: Trend.Stable,
      },
      {
        scenario: "no previous year median",
        yearlyMedians: [
          {
            period: 2023,
            group: "1",
            median_saidi_total: 45,
            median_saidi_unplanned: 20,
            median_saifi_total: 1.2,
            median_saifi_unplanned: 0.4,
          },
        ],
        expectedSaidiMedianTotal: 45,
        expectedSaidiMedianUnplanned: 20,
        expectedSaifiMedianTotal: 1.2,
        expectedSaifiMedianUnplanned: 0.4,
        expectedTrendTotal: Trend.Stable,
        expectedTrendUnplanned: Trend.Stable,
      },
      {
        scenario: "increasing total, decreasing unplanned",
        yearlyMedians: [
          {
            period: 2022,
            group: "1",
            median_saidi_total: 40,
            median_saidi_unplanned: 20,
            median_saifi_total: 1.0,
            median_saifi_unplanned: 0.3,
          },
          {
            period: 2023,
            group: "1",
            median_saidi_total: 50,
            median_saidi_unplanned: 15,
            median_saifi_total: 1.2,
            median_saifi_unplanned: 0.2,
          },
        ],
        expectedSaidiMedianTotal: 50,
        expectedSaidiMedianUnplanned: 15,
        expectedSaifiMedianTotal: 1.2,
        expectedSaifiMedianUnplanned: 0.2,
        expectedTrendTotal: Trend.Up,
        expectedTrendUnplanned: Trend.Down,
      },
    ] satisfies MedianScenario[])(
      "computes peer group median trends: $scenario",
      async ({
        yearlyMedians,
        expectedSaidiMedianTotal,
        expectedSaidiMedianUnplanned,
        expectedSaifiMedianTotal,
        expectedSaifiMedianUnplanned,
        expectedTrendTotal,
        expectedTrendUnplanned,
      }) => {
        const db = createMockDb({
          getYearlyIndicatorMedians: vi.fn().mockResolvedValue(yearlyMedians),
        });

        const result = await fetchFn(db, {
          operatorId: 100,
          operatorData: mockOperatorData,
          period: 2023,
        });

        const expectedMedianTotal =
          medianTotalKey === "median_saidi_total"
            ? expectedSaidiMedianTotal
            : expectedSaifiMedianTotal;
        const expectedMedianUnplanned =
          medianUnplannedKey === "median_saidi_unplanned"
            ? expectedSaidiMedianUnplanned
            : expectedSaifiMedianUnplanned;

        expect(result.peerGroupMedianTotal).toBe(expectedMedianTotal);
        expect(result.peerGroupMedianUnplanned).toBe(expectedMedianUnplanned);
        expect(result.peerGroupMedianTrendTotal).toBe(expectedTrendTotal);
        expect(result.peerGroupMedianTrendUnplanned).toBe(expectedTrendUnplanned);
      }
    );
  }
);
