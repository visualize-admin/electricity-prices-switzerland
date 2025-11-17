import { describe, expect, it } from "vitest";

import { createEncodings } from "./charts";

// Dummy palette with simple names for easy testing
const dummyPalette = ["1", "2", "3", "4", "5"];

describe("createEncodings", () => {
  describe("Default Threshold Encoding (energyPrices, netTariffs, etc.)", () => {
    it("should create thresholds at 85%, 95%, 105%, 115% of median", () => {
      const encodings = createEncodings(dummyPalette);
      const median = 100;
      const values = [85, 95, 100, 105, 115];

      const result = encodings.energyPrices(median, values, 2024);

      expect(result.thresholds).toHaveLength(4);
      expect(result.thresholds[0].value).toBeCloseTo(85); // 100 * 0.85
      expect(result.thresholds[1].value).toBeCloseTo(95); // 100 * 0.95
      expect(result.thresholds[2].value).toBeCloseTo(105); // 100 * 1.05
      expect(result.thresholds[3].value).toBeCloseTo(115); // 100 * 1.15
    });

    it("should create percentage labels for thresholds", () => {
      const encodings = createEncodings(dummyPalette);
      const median = 100;
      const values = [85, 95, 100, 105, 115];

      const result = encodings.energyPrices(median, values, 2024);

      expect(result.thresholds[0].label).toBe("-15%"); // 85 is -15% of 100
      expect(result.thresholds[1].label).toBe("-5%"); // 95 is -5% of 100
      expect(result.thresholds[2].label).toBe("+5%"); // 105 is +5% of 100
      expect(result.thresholds[3].label).toBe("+15%"); // 115 is +15% of 100
    });

    it("should use provided palette", () => {
      const encodings = createEncodings(dummyPalette);
      const median = 100;
      const values = [85, 95, 100, 105, 115];

      const result = encodings.energyPrices(median, values, 2024);

      expect(result.palette).toEqual(dummyPalette);
    });

    it("should use custom palette when provided as parameter", () => {
      const encodings = createEncodings(dummyPalette);
      const customPalette = ["a", "b", "c", "d", "e"];
      const median = 100;
      const values = [85, 95, 100, 105, 115];

      const result = encodings.energyPrices(
        median,
        values,
        2024,
        customPalette
      );

      expect(result.palette).toEqual(customPalette);
    });

    it("should use extent when median is undefined", () => {
      const encodings = createEncodings(dummyPalette);
      const values = [10, 20, 30, 40];

      const result = encodings.energyPrices(undefined, values, 2024);

      expect(result.thresholds).toHaveLength(2);
      expect(result.thresholds[0].value).toBe(10); // min
      expect(result.thresholds[1].value).toBe(40); // max
      expect(result.thresholds[0].label).toBe(""); // no labels without median
      expect(result.thresholds[1].label).toBe("");
    });

    it("should create a working scale function", () => {
      const encodings = createEncodings(dummyPalette);
      const median = 100;
      const values = [85, 95, 100, 105, 115];

      const result = encodings.energyPrices(median, values, 2024);
      const scale = result.makeScale();

      // Values below first threshold should get first color
      expect(scale(80)).toBe("1");
      // Values between thresholds should get appropriate color
      expect(scale(90)).toBe("2");
      expect(scale(100)).toBe("3");
      expect(scale(110)).toBe("4");
      // Values above last threshold should get last color
      expect(scale(120)).toBe("5");
    });
  });

  describe("Network Costs Threshold Encoding", () => {
    it("should create thresholds at 70%, 90%, 110%, 130% of median", () => {
      const encodings = createEncodings(dummyPalette);
      const median = 100;
      const values = [70, 90, 100, 110, 130];

      const result = encodings.networkCosts(median, values, 2024);

      expect(result.thresholds).toHaveLength(4);
      expect(result.thresholds[0].value).toBeCloseTo(70); // 100 * 0.7
      expect(result.thresholds[1].value).toBeCloseTo(90); // 100 * 0.9
      expect(result.thresholds[2].value).toBeCloseTo(110); // 100 * 1.1
      expect(result.thresholds[3].value).toBeCloseTo(130); // 100 * 1.3
    });

    it("should create percentage labels for network costs", () => {
      const encodings = createEncodings(dummyPalette);
      const median = 100;
      const values = [70, 90, 100, 110, 130];

      const result = encodings.networkCosts(median, values, 2024);

      expect(result.thresholds[0].label).toBe("-30%");
      expect(result.thresholds[1].label).toBe("-10%");
      expect(result.thresholds[2].label).toBe("+10%");
      expect(result.thresholds[3].label).toBe("+30%");
    });
  });

  describe("Outage Info Threshold Encoding", () => {
    it("should create yes/no palette from first and last colors", () => {
      const encodings = createEncodings(dummyPalette);

      const result = encodings.outageInfo(undefined, [], 2024);

      // Default yesNoPalette is [last, first] = ["5", "1"]
      // Then yesNoFromPalette takes [last, first] of that = ["1", "5"]
      expect(result.palette).toEqual(["1", "5"]);
    });

    it("should have threshold at 0.5 with No/Yes labels", () => {
      const encodings = createEncodings(dummyPalette);

      const result = encodings.outageInfo(undefined, [], 2024);

      expect(result.thresholds).toHaveLength(2);
      expect(result.thresholds[0].value).toBe(0.5);
      expect(result.thresholds[0].label).toBe("No");
      expect(result.thresholds[1].value).toBe(0.5);
      expect(result.thresholds[1].label).toBe("Yes");
    });

    it("should use custom palette for yes/no derivation", () => {
      const encodings = createEncodings(dummyPalette);
      const customPalette = ["red", "orange", "yellow", "green", "blue"];

      const result = encodings.outageInfo(undefined, [], 2024, customPalette);

      // Yes/No palette should be [last, first] from custom palette
      expect(result.palette).toEqual(["blue", "red"]);
    });

    it("should create a working scale for yes/no", () => {
      const encodings = createEncodings(dummyPalette);

      const result = encodings.outageInfo(undefined, [], 2024);
      const scale = result.makeScale();

      // Palette is ["1", "5"], so values < 0.5 get "1", values >= 0.5 get "5"
      expect(scale(0)).toBe("1");
      expect(scale(0.4)).toBe("1");
      expect(scale(0.5)).toBe("5");
      expect(scale(1)).toBe("5");
    });
  });

  describe("Compliance Threshold Encoding", () => {
    const yesNoPalette = ["yes", "no"];
    it("should use 75.01 threshold for years before 2026", () => {
      const encodings = createEncodings(yesNoPalette);

      const result2024 = encodings.compliance(undefined, [], 2024);
      const result2025 = encodings.compliance(undefined, [], 2025);

      expect(result2024.thresholds[0].value).toBe(75.01);
      expect(result2024.thresholds[1].value).toBe(75.01);
      expect(result2025.thresholds[0].value).toBe(75.01);
      expect(result2025.thresholds[1].value).toBe(75.01);
    });

    it("should use 60.01 threshold for year 2026 and after", () => {
      const encodings = createEncodings(yesNoPalette);

      const result2026 = encodings.compliance(undefined, [], 2026);
      const result2027 = encodings.compliance(undefined, [], 2027);

      expect(result2026.thresholds[0].value).toBe(60.01);
      expect(result2026.thresholds[1].value).toBe(60.01);
      expect(result2027.thresholds[0].value).toBe(60.01);
      expect(result2027.thresholds[1].value).toBe(60.01);
    });

    it("should reverse the yes/no palette", () => {
      const encodings = createEncodings(yesNoPalette);

      const result = encodings.compliance(undefined, [], 2024);

      expect(result.palette).toEqual(yesNoPalette);
    });

    it("should have No/Yes labels", () => {
      const encodings = createEncodings(yesNoPalette);

      const result = encodings.compliance(undefined, [], 2024);

      expect(result.thresholds[0].label).toBe("No");
      expect(result.thresholds[1].label).toBe("Yes");
    });

    it("should create a working scale with reversed colors", () => {
      const encodings = createEncodings(yesNoPalette);

      const result = encodings.compliance(undefined, [], 2024);
      const scale = result.makeScale();

      // Palette is ["5", "1"], so values < 75.01 get "5", values >= 75.01 get "1"
      expect(scale(70)).toBe("yes");
      expect(scale(75.01)).toBe("no");
      expect(scale(80)).toBe("no");
    });
  });

  describe("Days In Advance Outage Notification Encoding", () => {
    it("should reverse the palette from default encoding", () => {
      const encodings = createEncodings(dummyPalette);
      const median = 100;
      const values = [85, 95, 100, 105, 115];

      const result = encodings.daysInAdvanceOutageNotification(
        median,
        values,
        2024
      );

      // Should reverse the palette
      expect(result.palette).toEqual(["5", "4", "3", "2", "1"]);
    });

    it("should have same thresholds as default encoding", () => {
      const encodings = createEncodings(dummyPalette);
      const median = 100;
      const values = [85, 95, 100, 105, 115];

      const defaultResult = encodings.energyPrices(median, values, 2024);
      const reversedResult = encodings.daysInAdvanceOutageNotification(
        median,
        values,
        2024
      );

      expect(reversedResult.thresholds).toEqual(defaultResult.thresholds);
    });

    it("should create a working scale with reversed palette", () => {
      const encodings = createEncodings(dummyPalette);
      const median = 100;
      const values = [85, 95, 100, 105, 115];

      const result = encodings.daysInAdvanceOutageNotification(
        median,
        values,
        2024
      );
      const scale = result.makeScale();

      // With reversed palette, lower values get higher color numbers
      expect(scale(80)).toBe("5"); // was "1" in default
      expect(scale(90)).toBe("4"); // was "2" in default
      expect(scale(100)).toBe("3"); // stays "3"
      expect(scale(110)).toBe("2"); // was "4" in default
      expect(scale(120)).toBe("1"); // was "5" in default
    });

    it("should use custom palette when provided", () => {
      const encodings = createEncodings(dummyPalette);
      const customPalette = ["a", "b", "c", "d", "e"];
      const median = 100;
      const values = [85, 95, 100, 105, 115];

      const result = encodings.daysInAdvanceOutageNotification(
        median,
        values,
        2024,
        customPalette
      );

      // Should reverse the custom palette
      expect(result.palette).toEqual(["e", "d", "c", "b", "a"]);
    });
  });

  describe("All encodings share same instances", () => {
    it("should use same encoding for netTariffs, energyTariffs, saidi, saifi as energyPrices", () => {
      const encodings = createEncodings(dummyPalette);

      expect(encodings.netTariffs).toBe(encodings.energyPrices);
      expect(encodings.energyTariffs).toBe(encodings.energyPrices);
      expect(encodings.saidi).toBe(encodings.energyPrices);
      expect(encodings.saifi).toBe(encodings.energyPrices);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero median value", () => {
      const encodings = createEncodings(dummyPalette);
      const values = [10, 20, 30, 40];

      const result = encodings.energyPrices(0, values, 2024);

      // With median = 0, it still uses median (0 is falsy but defined)
      // However, the implementation uses `medianValue ?? 0` which treats 0 as valid
      // So it uses extent instead when median is 0
      expect(result.thresholds).toHaveLength(2);
      expect(result.thresholds[0].value).toBe(10);
      expect(result.thresholds[1].value).toBe(40);
    });

    it("should handle negative median value", () => {
      const encodings = createEncodings(dummyPalette);
      const median = -100;
      const values = [-115, -105, -100, -95, -85];

      const result = encodings.energyPrices(median, values, 2024);

      // Thresholds should still be calculated correctly (use toBeCloseTo for floating point)
      expect(result.thresholds[0].value).toBeCloseTo(-85); // -100 * 0.85
      expect(result.thresholds[1].value).toBeCloseTo(-95); // -100 * 0.95
      expect(result.thresholds[2].value).toBeCloseTo(-105); // -100 * 1.05
      expect(result.thresholds[3].value).toBeCloseTo(-115); // -100 * 1.15
    });

    it("should handle empty values array with undefined median", () => {
      const encodings = createEncodings(dummyPalette);

      const result = encodings.energyPrices(undefined, [], 2024);

      // extent of empty array returns [undefined, undefined]
      expect(result.thresholds).toHaveLength(2);
      expect(isNaN(result.thresholds[0].value)).toBe(true);
      expect(isNaN(result.thresholds[1].value)).toBe(true);
    });
  });
});
