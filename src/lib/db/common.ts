import { SunshineIndicator } from "src/domain/sunshine";
import { SunshineDataRow } from "src/graphql/resolver-types";

// Map the structured indicator to field names
export const getFieldName = (
  indicator: SunshineIndicator,
  category?: string,
  networkLevel?: string,
  typology?: string
): keyof SunshineDataRow => {
  switch (indicator) {
    case "networkCosts":
      return `networkCosts${networkLevel as "NE5" | "NE6" | "NE7"}`;
    case "netTariffs":
      return `tariffN${
        category as "C2" | "C3" | "C4" | "C6" | "H2" | "H4" | "H7"
      }`;
    case "energyTariffs":
      return `tariffE${
        category as "C2" | "C3" | "C4" | "C6" | "H2" | "H4" | "H7"
      }`;
    case "saidi":
      return typology === "unplanned" ? "saidiUnplanned" : "saidiTotal";
    case "saifi":
      return typology === "unplanned" ? "saifiUnplanned" : "saifiTotal";
    case "serviceQuality":
      return "francRule"; // Default to franc rule, could be enhanced
    case "compliance":
      return "timely"; // Default to timely, could be enhanced
    default:
      throw new Error(`Unsupported indicator: ${indicator}`);
  }
};
