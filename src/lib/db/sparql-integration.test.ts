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
        operatorId: 8,
        period: 2024,
        networkLevel: "NE5",
      });

      expect(result).toMatchInlineSnapshot(`[]`);
    });

    it.only("should return all network levels when networkLevel is not specified", async () => {
      const result = await sunshineDataServiceSparql.getNetworkCosts({
        operatorId: 672,
        period: 2025,
      });

      expect(result).toMatchInlineSnapshot(`[]`);
    });

    it("should return network costs for peer group", async () => {
      const result = await sunshineDataServiceSparql.getNetworkCosts({
        peerGroup: "Tourist-Low",
        networkLevel: "NE5",
      });

      expect(result.slice(0, 3)).toMatchInlineSnapshot(`
        [
          {
            "network_level": "NE5",
            "operator_id": 10,
            "operator_name": "Arosa Energie",
            "rate": 9868.452,
            "year": 2025,
          },
          {
            "network_level": "NE5",
            "operator_id": 105,
            "operator_name": "ELEKTRA ENERGIE Genossenschaft",
            "rate": 9085.843,
            "year": 2025,
          },
          {
            "network_level": "NE5",
            "operator_id": 107,
            "operator_name": "Elektra Andwil Stromversorgung",
            "rate": 25665.086,
            "year": 2025,
          },
        ]
      `);
    });
  });

  describe("getOperationalStandards", () => {
    it("should return operational standards for a specific operator", async () => {
      const result = await sunshineDataServiceSparql.getOperationalStandards({
        operatorId: 8,
        period: 2025,
      });

      expect(result).toMatchInlineSnapshot();
    });

    it("should return operational standards for a specific operator without period", async () => {
      const result = await sunshineDataServiceSparql.getOperationalStandards({
        operatorId: 8,
      });

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "energy_density": "",
            "franc_rule": -206.195,
            "info_days_in_advance": 10,
            "info_yes_no": "nein",
            "operator_id": 8,
            "operator_name": "Comune di Stabio, Elettrica",
            "period": 2025,
            "settlement_density": "",
            "timely": 0,
          },
        ]
      `);
    });
  });

  describe("getStabilityMetrics", () => {
    it("should return stability metrics for a specific operator", async () => {
      const result = await sunshineDataServiceSparql.getStabilityMetrics({
        operatorId: 8,
        period: 2025,
      });

      expect(result).toMatchInlineSnapshot();
    });

    it("should return stability metrics for all operators in a period", async () => {
      const result = await sunshineDataServiceSparql.getStabilityMetrics({
        period: 2025,
      });

      expect(result.length).toMatchInlineSnapshot();
      expect(result.slice(0, 3)).toMatchInlineSnapshot(); // First 3 results
    });
  });

  describe("getTariffs", () => {
    it("should return tariffs for a specific operator, period, and category", async () => {
      const result = await sunshineDataServiceSparql.getTariffs({
        operatorId: 8,
        period: 2024,
        category: "NC2",
      });

      expect(result).toMatchInlineSnapshot(`[]`);
    });

    it("should filter by tariff type when specified", async () => {
      const result = await sunshineDataServiceSparql.getTariffs({
        operatorId: 8,
        period: 2024,
        category: "NC2",
        tariffType: "energy",
      });

      expect(result).toMatchInlineSnapshot(`[]`);
    });

    it("should return network tariffs only", async () => {
      const result = await sunshineDataServiceSparql.getTariffs({
        operatorId: 8,
        period: 2025,
        category: "NC2",
        tariffType: "network",
      });

      expect(result).toMatchInlineSnapshot(`[]`);
    });
  });

  describe("getOperatorData", () => {
    it("should return operator data for a specific operator", async () => {
      const result = await sunshineDataServiceSparql.getOperatorData(8);

      expect(result).toMatchInlineSnapshot(`
        {
          "energy_density": "Low",
          "operator_id": 8,
          "operator_name": "Comune di Stabio, Elettrica",
          "operator_uid": "8",
          "peer_group": "Tourist-Low",
          "period": 2025,
          "settlement_density": "Tourist",
        }
      `);
    });

    it("should return operator data for a specific operator and period", async () => {
      const result = await sunshineDataServiceSparql.getOperatorData(8, 2025);

      expect(result).toMatchInlineSnapshot();
    });
  });

  describe("getPeerGroupMedianValues", () => {
    it("should return median network costs for a peer group", async () => {
      const result = await sunshineDataServiceSparql.getPeerGroupMedianValues({
        peerGroup: "Tourist-Low",
        metric: "network_costs",
        networkLevel: "NE5",
        period: 2024,
      });

      expect(result).toMatchInlineSnapshot(`undefined`);
    });

    it("should return median stability metrics for a peer group", async () => {
      const result = await sunshineDataServiceSparql.getPeerGroupMedianValues({
        peerGroup: "Tourist-Low",
        metric: "stability",
        period: 2025,
      });

      expect(result).toMatchInlineSnapshot(`undefined`);
    });

    it("should return median operational standards for a peer group", async () => {
      const result = await sunshineDataServiceSparql.getPeerGroupMedianValues({
        peerGroup: "Tourist-Low",
        metric: "operational",
        period: 2025,
      });

      expect(result).toMatchInlineSnapshot(`undefined`);
    });

    it("should return median energy tariffs for a peer group", async () => {
      const result = await sunshineDataServiceSparql.getPeerGroupMedianValues({
        peerGroup: "Tourist-Low",
        metric: "energy-tariffs",
        category: "NC2",
      });

      expect(result).toMatchInlineSnapshot(`undefined`);
    });

    it("should return median net tariffs for a peer group", async () => {
      const result = await sunshineDataServiceSparql.getPeerGroupMedianValues({
        peerGroup: "Tourist-Low",
        metric: "net-tariffs",
        category: "NC2",
      });

      expect(result).toMatchInlineSnapshot(`undefined`);
    });
  });

  describe("getLatestYearSunshine", () => {
    it("should return the latest year for sunshine data", async () => {
      const result = await sunshineDataServiceSparql.getLatestYearSunshine(8);

      expect(result).toMatchInlineSnapshot(`2025`);
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

      expect(result).toMatchInlineSnapshot(`"2025"`);
    });

    it("should return default year when no stability data found for non-existent operator", async () => {
      const result =
        await sunshineDataServiceSparql.getLatestYearPowerStability(99999);

      expect(result).toMatchInlineSnapshot(`"2024"`);
    });
  });

  describe("getPeerGroup", () => {
    it("should return peer group information", async () => {
      const result = await sunshineDataServiceSparql.getPeerGroup(8);

      expect(result).toMatchInlineSnapshot(`
        {
          "energyDensity": "Low",
          "id": "Tourist-Low",
          "settlementDensity": "Tourist",
        }
      `);
    });

    it("should return peer group information for string id", async () => {
      const result = await sunshineDataServiceSparql.getPeerGroup("8");

      expect(result).toMatchInlineSnapshot(`
        {
          "energyDensity": "Low",
          "id": "Tourist-Low",
          "settlementDensity": "Tourist",
        }
      `);
    });
  });

  describe("getSunshineData", () => {
    it("should return combined sunshine data for an operator", async () => {
      const result = await sunshineDataServiceSparql.getSunshineData({
        operatorId: 8,
        period: "2024",
      });

      expect(result).toMatchInlineSnapshot(`[]`);
    });

    it("should return sunshine data for all operators in a period", async () => {
      const result = await sunshineDataServiceSparql.getSunshineData({
        period: "2025",
      });

      expect(result.length).toMatchInlineSnapshot();
      expect(result.slice(0, 2)).toMatchInlineSnapshot(); // First 2 results
    });

    it("should return sunshine data for an operator across all periods", async () => {
      const result = await sunshineDataServiceSparql.getSunshineData({
        operatorId: 8,
      });

      expect(result.length).toMatchInlineSnapshot(`1`);
      expect(result.slice(0, 2)).toMatchInlineSnapshot(`
        [
          {
            "francRule": -206.195,
            "infoDaysInAdvance": 10,
            "infoYesNo": false,
            "name": "Comune di Stabio, Elettrica",
            "networkCostsNE5": 24405.513,
            "networkCostsNE6": 4.75,
            "networkCostsNE7": 15894.402,
            "operatorId": 8,
            "operatorUID": "8",
            "period": "2025",
            "saidiTotal": NaN,
            "saidiUnplanned": NaN,
            "saifiTotal": NaN,
            "saifiUnplanned": NaN,
            "tariffEC2": 11.51,
            "tariffEC3": 11.51,
            "tariffEC4": 11.51,
            "tariffEC6": 13.355,
            "tariffEH2": 11.51,
            "tariffEH4": 11.51,
            "tariffEH7": 11.51,
            "tariffNC2": 9.61,
            "tariffNC3": 9.726,
            "tariffNC4": 8.557,
            "tariffNC6": 5.9,
            "tariffNH2": 12.092,
            "tariffNH4": 10.406,
            "tariffNH7": 9.145,
            "timely": false,
          },
        ]
      `); // First 2 results
    });
  });
});
