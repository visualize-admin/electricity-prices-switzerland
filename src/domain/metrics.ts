import { NetworkLevel } from "./data";

export const RP_OVER_KWH = "Rp./kWh";
export const RP_OVER_KM = "Rp./km";

export const getNetworkLevelMetrics = (level: NetworkLevel["id"]) => {
  switch (level) {
    case "NE5":
      return RP_OVER_KWH;
    case "NE6":
      return RP_OVER_KWH;
    case "NE7":
      return RP_OVER_KM;
  }
};
