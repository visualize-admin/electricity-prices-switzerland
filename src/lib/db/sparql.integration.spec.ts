import { describe, expect, it } from "vitest";

import { sunshineDataServiceSparql } from "src/lib/db/sparql";

describe("SPARQL Sunshine Data Service", () => {
  describe("service properties", () => {
    it("should have the correct name", () => {
      expect(sunshineDataServiceSparql.name).toBe("sparql");
    });
  });

  describe("getNetworkCosts", () => {
    it("should return network costs for a specific operator and period", async () => {
      const result = await sunshineDataServiceSparql.getNetworkCosts({
        operatorId: 672,
        period: 2025,
        networkLevel: "NE5",
      });

      expect(result).toMatchInlineSnapshot(`[]`);
    });

    it("should return all network levels when networkLevel is not specified", async () => {
      const result = await sunshineDataServiceSparql.getNetworkCosts({
        operatorId: 672,
        period: 2025,
      });

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "network_level": "NE6",
            "operator_id": 672,
            "operator_name": "St.Galler Stadtwerke",
            "rate": 12.366,
            "year": 2025,
          },
          {
            "network_level": "NE7",
            "operator_id": 672,
            "operator_name": "St.Galler Stadtwerke",
            "rate": 26737.657,
            "year": 2025,
          },
        ]
      `);
    });

    // TODO Peer group
    it("should return network costs for peer group", async () => {
      const result = await sunshineDataServiceSparql.getNetworkCosts({
        peerGroup: "A",
        networkLevel: "NE5",
      });

      expect(result.slice(0, 3)).toMatchInlineSnapshot(`
        [
          {
            "network_level": "NE5",
            "operator_id": 105,
            "operator_name": "ELEKTRA ENERGIE Genossenschaft",
            "rate": 8643.865,
            "year": 2026,
          },
          {
            "network_level": "NE5",
            "operator_id": 11,
            "operator_name": "Aare Versorgungs AG (AVAG)",
            "rate": 20486.074,
            "year": 2026,
          },
          {
            "network_level": "NE5",
            "operator_id": 111,
            "operator_name": "Elektra Genossenschaft Auw",
            "rate": 13440.984,
            "year": 2026,
          },
        ]
      `);
    });
  });

  describe("getOperationalStandards", () => {
    it("should return operational standards for a specific operator", async () => {
      const result = await sunshineDataServiceSparql.getOperationalStandards({
        operatorId: 672,
        period: 2025,
      });

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "energy_density": "",
            "franc_rule": 74.276,
            "info_days_in_advance": 2,
            "info_yes_no": "nein",
            "operator_id": 672,
            "operator_name": "St.Galler Stadtwerke",
            "period": 2025,
            "settlement_density": "",
            "timely": 0,
          },
        ]
      `);
    });

    it("should return operational standards for a specific operator without period", async () => {
      const result = await sunshineDataServiceSparql.getOperationalStandards({
        operatorId: 672,
      });

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "energy_density": "",
            "franc_rule": undefined,
            "info_days_in_advance": 2,
            "info_yes_no": "nein",
            "operator_id": 672,
            "operator_name": "St.Galler Stadtwerke",
            "period": 2026,
            "settlement_density": "",
            "timely": 0,
          },
          {
            "energy_density": "",
            "franc_rule": 74.276,
            "info_days_in_advance": 2,
            "info_yes_no": "nein",
            "operator_id": 672,
            "operator_name": "St.Galler Stadtwerke",
            "period": 2025,
            "settlement_density": "",
            "timely": 0,
          },
          {
            "energy_density": "",
            "franc_rule": 74.592,
            "info_days_in_advance": 2,
            "info_yes_no": "nein",
            "operator_id": 672,
            "operator_name": "St.Galler Stadtwerke",
            "period": 2024,
            "settlement_density": "",
            "timely": 0,
          },
        ]
      `);
    });
  });

  describe("getStabilityMetrics", () => {
    // TO Review, is it normal that saidi metrics are undefined
    it("should return stability metrics for a specific operator", async () => {
      const result = await sunshineDataServiceSparql.getStabilityMetrics({
        operatorId: 672,
        period: 2025,
      });

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "operator_id": 672,
            "operator_name": "St.Galler Stadtwerke",
            "period": 2025,
            "saidi_total": 8.806,
            "saidi_unplanned": 0.643,
            "saifi_total": 0.113,
            "saifi_unplanned": 0.014,
          },
        ]
      `);
    });

    it("should return stability metrics for all operators in a period", async () => {
      const result = await sunshineDataServiceSparql.getStabilityMetrics({
        period: 2025,
      });

      expect(result.length).toMatchInlineSnapshot(`588`);
      expect(result.filter((x) => x.saidi_total !== undefined).slice(0, 3))
        .toMatchInlineSnapshot(`
          [
            {
              "operator_id": 11,
              "operator_name": "Aare Versorgungs AG (AVAG)",
              "period": 2025,
              "saidi_total": 11.652,
              "saidi_unplanned": 2.298,
              "saifi_total": 0.169,
              "saifi_unplanned": 0.036,
            },
            {
              "operator_id": 113,
              "operator_name": "EBL (Genossenschaft Elektra Baselland)",
              "period": 2025,
              "saidi_total": 14.674,
              "saidi_unplanned": 8.174,
              "saifi_total": 0.327,
              "saifi_unplanned": 0.18,
            },
            {
              "operator_id": 132,
              "operator_name": "Genossenschaft Elektra, Jegenstorf",
              "period": 2025,
              "saidi_total": 6.214,
              "saidi_unplanned": 0.254,
              "saifi_total": 0.138,
              "saifi_unplanned": 0.002,
            },
          ]
        `); // First 3 results
    });
  });

  describe("getTariffs", () => {
    it("should return tariffs for a specific operator, period, and category", async () => {
      const result = await sunshineDataServiceSparql.getTariffs({
        operatorId: 672,
        period: 2025,
        category: "C2",
      });

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "category": "C2",
            "operator_id": 672,
            "operator_name": "St.Galler Stadtwerke",
            "period": 2025,
            "rate": 14.021,
            "tariff_type": "energy",
          },
          {
            "category": "C2",
            "operator_id": 672,
            "operator_name": "St.Galler Stadtwerke",
            "period": 2025,
            "rate": 11.191,
            "tariff_type": "network",
          },
        ]
      `);
    });

    it("should filter by tariff type when specified", async () => {
      const result = await sunshineDataServiceSparql.getTariffs({
        operatorId: 672,
        period: 2025,
        category: "C2",
        tariffType: "energy",
      });

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "category": "C2",
            "operator_id": 672,
            "operator_name": "St.Galler Stadtwerke",
            "period": 2025,
            "rate": 14.021,
            "tariff_type": "energy",
          },
        ]
      `);
    });

    it("should return network tariffs only", async () => {
      const result = await sunshineDataServiceSparql.getTariffs({
        operatorId: 672,
        period: 2025,
        category: "C2",
        tariffType: "network",
      });

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "category": "C2",
            "operator_id": 672,
            "operator_name": "St.Galler Stadtwerke",
            "period": 2025,
            "rate": 11.191,
            "tariff_type": "network",
          },
        ]
      `);
    });
  });

  describe("getOperatorData", () => {
    it("should return operator data for a specific operator", async () => {
      const result = await sunshineDataServiceSparql.getOperatorData(672, 2025);

      expect(result).toMatchInlineSnapshot(`
        {
          "energy_density": "High",
          "operator_id": 672,
          "operator_name": "St.Galler Stadtwerke",
          "operator_uid": "672",
          "peer_group": "High-High",
          "period": 2025,
          "settlement_density": "High",
        }
      `);
    });

    it("should return operator data for a specific operator and period", async () => {
      const result = await sunshineDataServiceSparql.getOperatorData(672, 2025);

      expect(result).toMatchInlineSnapshot(`
        {
          "energy_density": "High",
          "operator_id": 672,
          "operator_name": "St.Galler Stadtwerke",
          "operator_uid": "672",
          "peer_group": "High-High",
          "period": 2025,
          "settlement_density": "High",
        }
      `);
    });
  });

  describe("getYearlyIndicatorMedians", () => {
    it("should return median network costs for a peer group", async () => {
      const result = await sunshineDataServiceSparql.getYearlyIndicatorMedians({
        // TODO To review, how to get peer groups correctly
        peerGroup: "A",
        metric: "network_costs",
        networkLevel: "NE5",
        period: 2025,
      });

      expect(result).toMatchInlineSnapshot(`[]`);
    });

    it("should return median stability metrics for a peer group", async () => {
      const result = await sunshineDataServiceSparql.getYearlyIndicatorMedians({
        peerGroup: "A",
        metric: "stability",
        period: 2025,
      });

      expect(result).toMatchInlineSnapshot(`[]`);
    });

    it("should return median operational standards for a peer group", async () => {
      const result = await sunshineDataServiceSparql.getYearlyIndicatorMedians({
        peerGroup: "A",
        metric: "operational",
        period: 2025,
      });

      expect(result).toMatchInlineSnapshot(`[]`);
    });

    it("should return median energy tariffs for a peer group", async () => {
      const result = await sunshineDataServiceSparql.getYearlyIndicatorMedians({
        peerGroup: "A",
        metric: "energy-tariffs",
        category: "C2",
      });

      expect(result).toMatchInlineSnapshot(`[]`);
    });

    it("should return median net tariffs for a peer group", async () => {
      const result = await sunshineDataServiceSparql.getYearlyIndicatorMedians({
        peerGroup: "A",
        metric: "net-tariffs",
        category: "C2",
      });

      expect(result).toMatchInlineSnapshot(`[]`);
    });
  });

  describe("getLatestYearSunshine", () => {
    it("should return the latest year for sunshine data", async () => {
      const result = await sunshineDataServiceSparql.getLatestYearSunshine(8);

      expect(result).toMatchInlineSnapshot(`2026`);
    });

    it("should return default year when no data found for non-existent operator", async () => {
      const result = await sunshineDataServiceSparql.getLatestYearSunshine(
        99999
      );

      expect(result).toMatchInlineSnapshot(`2024`);
    });
  });

  describe("getLatestYearPowerStability", () => {
    it("should return the latest year for power stability data", async () => {
      const result =
        await sunshineDataServiceSparql.getLatestYearPowerStability(8);

      expect(result).toMatchInlineSnapshot(`"2026"`);
    });

    it("should return default year when no stability data found for non-existent operator", async () => {
      const result =
        await sunshineDataServiceSparql.getLatestYearPowerStability(99999);

      expect(result).toMatchInlineSnapshot(`"2024"`);
    });
  });

  describe("getPeerGroup", () => {
    it("should return peer group information", async () => {
      const result = await sunshineDataServiceSparql.getOperatorPeerGroup(
        8,
        2024
      );

      expect(result).toMatchInlineSnapshot(`
        {
          "energyDensity": "High",
          "id": "5",
          "settlementDensity": "Rural",
        }
      `);
    });

    it("should return peer group information for string id", async () => {
      const result = await sunshineDataServiceSparql.getOperatorPeerGroup(
        "8",
        2025
      );

      expect(result).toMatchInlineSnapshot(`
        {
          "energyDensity": "High",
          "id": "5",
          "settlementDensity": "Rural",
        }
      `);
    });
  });

  describe("getSunshineData", () => {
    it("should return combined sunshine data for an operator", async () => {
      const result = await sunshineDataServiceSparql.getSunshineData({
        operatorId: 672,
        period: "2025",
      });

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "francRule": 74.276,
            "infoDaysInAdvance": 2,
            "infoYesNo": true,
            "name": "St.Galler Stadtwerke",
            "networkCostsNE5": undefined,
            "networkCostsNE6": 12.366,
            "networkCostsNE7": 26737.657,
            "operatorId": 672,
            "operatorUID": "672",
            "period": "2025",
            "saidiTotal": 8.806,
            "saidiUnplanned": 0.643,
            "saifiTotal": 0.113,
            "saifiUnplanned": 0.014,
            "tariffEC2": 14.021,
            "tariffEC3": 11.711,
            "tariffEC4": 11.387,
            "tariffEC6": 10.821,
            "tariffEH2": 12.95,
            "tariffEH4": 12.987,
            "tariffEH7": 12.492,
            "tariffNC2": 11.191,
            "tariffNC3": 11.25,
            "tariffNC4": 10.795,
            "tariffNC6": 6.701,
            "tariffNH2": 13.821,
            "tariffNH4": 12.175,
            "tariffNH7": 10.425,
            "timely": false,
          },
        ]
      `);
    });

    it("should return sunshine data for all operators in a period", async () => {
      const result = await sunshineDataServiceSparql.getSunshineData({
        period: "2025",
      });

      expect(result.length).toMatchInlineSnapshot(`588`);
      expect(result.slice(0, 2)).toMatchInlineSnapshot(`
        [
          {
            "francRule": 45.594,
            "infoDaysInAdvance": 3,
            "infoYesNo": true,
            "name": "Arosa Energie",
            "networkCostsNE5": undefined,
            "networkCostsNE6": 11.729,
            "networkCostsNE7": 12974.149,
            "operatorId": 10,
            "operatorUID": "10",
            "period": "2025",
            "saidiTotal": undefined,
            "saidiUnplanned": undefined,
            "saifiTotal": undefined,
            "saifiUnplanned": undefined,
            "tariffEC2": 8.093,
            "tariffEC3": 7.637,
            "tariffEC4": 6.998,
            "tariffEC6": 7.632,
            "tariffEH2": 7.73,
            "tariffEH4": 7.648,
            "tariffEH7": 6.769,
            "tariffNC2": 11.052,
            "tariffNC3": 8.807,
            "tariffNC4": 8.284,
            "tariffNC6": 8.326,
            "tariffNH2": 16.123,
            "tariffNH4": 13.51,
            "tariffNH7": 11.067,
            "timely": false,
          },
          {
            "francRule": 71.403,
            "infoDaysInAdvance": 14,
            "infoYesNo": true,
            "name": "ELEKTRA ENERGIE Genossenschaft",
            "networkCostsNE5": 9085.843,
            "networkCostsNE6": 12.023,
            "networkCostsNE7": 11059.218,
            "operatorId": 105,
            "operatorUID": "105",
            "period": "2025",
            "saidiTotal": undefined,
            "saidiUnplanned": undefined,
            "saifiTotal": undefined,
            "saifiUnplanned": undefined,
            "tariffEC2": 16.5,
            "tariffEC3": 0,
            "tariffEC4": 0,
            "tariffEC6": 0,
            "tariffEH2": 16.5,
            "tariffEH4": 16.5,
            "tariffEH7": 15.846,
            "tariffNC2": 14.26,
            "tariffNC3": 14.02,
            "tariffNC4": 13.352,
            "tariffNC6": 0,
            "tariffNH2": 19.54,
            "tariffNH4": 16.98,
            "tariffNH7": 13.711,
            "timely": false,
          },
        ]
      `); // First 2 results
    });

    it("should return sunshine data for an operator across all periods", async () => {
      const result = await sunshineDataServiceSparql.getSunshineData({
        operatorId: 672,
      });

      expect(result.length).toMatchInlineSnapshot(`3`);
      expect(result.slice(0, 2)).toMatchInlineSnapshot(`
        [
          {
            "francRule": undefined,
            "infoDaysInAdvance": 2,
            "infoYesNo": true,
            "name": "St.Galler Stadtwerke",
            "networkCostsNE5": undefined,
            "networkCostsNE6": 13.072,
            "networkCostsNE7": 28346.952,
            "operatorId": 672,
            "operatorUID": "672",
            "period": "2026",
            "saidiTotal": 7.248,
            "saidiUnplanned": 0.926,
            "saifiTotal": 0.093,
            "saifiUnplanned": 0.021,
            "tariffEC2": 14.021,
            "tariffEC3": 11.711,
            "tariffEC4": 11.387,
            "tariffEC6": 10.821,
            "tariffEH2": 12.95,
            "tariffEH4": 12.987,
            "tariffEH7": 12.492,
            "tariffNC2": 11.073,
            "tariffNC3": 11.289,
            "tariffNC4": 10.936,
            "tariffNC6": 5.982,
            "tariffNH2": 11.871,
            "tariffNH4": 11.25,
            "tariffNH7": 10.485,
            "timely": false,
          },
          {
            "francRule": 74.276,
            "infoDaysInAdvance": 2,
            "infoYesNo": true,
            "name": "St.Galler Stadtwerke",
            "networkCostsNE5": undefined,
            "networkCostsNE6": 12.366,
            "networkCostsNE7": 26737.657,
            "operatorId": 672,
            "operatorUID": "672",
            "period": "2025",
            "saidiTotal": 8.806,
            "saidiUnplanned": 0.643,
            "saifiTotal": 0.113,
            "saifiUnplanned": 0.014,
            "tariffEC2": 14.021,
            "tariffEC3": 11.711,
            "tariffEC4": 11.387,
            "tariffEC6": 10.821,
            "tariffEH2": 12.95,
            "tariffEH4": 12.987,
            "tariffEH7": 12.492,
            "tariffNC2": 11.191,
            "tariffNC3": 11.25,
            "tariffNC4": 10.795,
            "tariffNC6": 6.701,
            "tariffNH2": 13.821,
            "tariffNH4": 12.175,
            "tariffNH7": 10.425,
            "timely": false,
          },
        ]
      `); // First 2 results
    });
  });
});
