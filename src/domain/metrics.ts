import { NetworkLevel } from "./data";

export const RP_PER_KWH = "Rp./kWh";
export const RP_PER_KM = "Rp./km";
export const MIN_PER_YEAR = "Min./year";

export const getNetworkLevelMetrics = (level: NetworkLevel["id"]) => {
  switch (level) {
    case "NE5":
      return RP_PER_KWH;
    case "NE6":
      return RP_PER_KM;
    case "NE7":
      return RP_PER_KWH;
  }
};
