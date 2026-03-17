import { describe, expect, it, vi } from "vitest";

import { createSunshineDataService } from "src/rdf/sunshine";

// Helpers to build SPARQL term objects that mirror sparql-http-client output
const sparqlValue = (v: string) => ({ value: v });
const sparqlUndefined = () => ({
  datatype: { value: "https://cube.link/Undefined" },
});

async function* asyncRows<T>(rows: T[]) {
  for (const row of rows) {
    yield row;
  }
}

const createMockClient = (rows: Array<Record<string, unknown>>) =>
  ({
    query: {
      select: vi.fn().mockResolvedValue(asyncRows(rows)),
    },
  }) as never;

describe("createSunshineDataService", () => {
  describe("getYearlyIndicatorMedians (stability)", () => {
    it("returns null for stability metrics that are cube:Undefined in the SPARQL source, not 0", async () => {
      // Before fix 29db1a2f, `undefined || "0"` coerced undefined SPARQL values to
      // parseFloatOrNull("0") = 0. After the fix, `undefined || undefined` produces null.
      const client = createMockClient([
        {
          period: sparqlValue("2023"),
          group: sparqlValue(
            "https://energy.ld.admin.ch/elcom/electricityprice/group/1"
          ),
          saidi_total: sparqlUndefined(),
          saidi_unplanned: sparqlUndefined(),
          saifi_total: sparqlUndefined(),
          saifi_unplanned: sparqlUndefined(),
        },
      ]);

      const db = createSunshineDataService(client);
      const result = await db.getYearlyIndicatorMedians({
        peerGroup: "1",
        metric: "stability",
      });

      expect(result).toHaveLength(1);
      expect(result[0].median_saidi_total).toBeNull();
      expect(result[0].median_saidi_unplanned).toBeNull();
      expect(result[0].median_saifi_total).toBeNull();
      expect(result[0].median_saifi_unplanned).toBeNull();
    });

    it("returns numeric values when stability metrics are present", async () => {
      const client = createMockClient([
        {
          period: sparqlValue("2023"),
          group: sparqlValue(
            "https://energy.ld.admin.ch/elcom/electricityprice/group/1"
          ),
          saidi_total: sparqlValue("45.5"),
          saidi_unplanned: sparqlValue("20.0"),
          saifi_total: sparqlValue("1.2"),
          saifi_unplanned: sparqlValue("0.4"),
        },
      ]);

      const db = createSunshineDataService(client);
      const result = await db.getYearlyIndicatorMedians({
        peerGroup: "1",
        metric: "stability",
      });

      expect(result).toHaveLength(1);
      expect(result[0].median_saidi_total).toBe(45.5);
      expect(result[0].median_saidi_unplanned).toBe(20.0);
      expect(result[0].median_saifi_total).toBe(1.2);
      expect(result[0].median_saifi_unplanned).toBe(0.4);
    });
  });
});
