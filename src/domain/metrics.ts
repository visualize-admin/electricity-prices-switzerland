import { t } from "@lingui/macro";

import { NetworkLevel } from "./data";

export const RP_PER_KWH = t({
  id: "sunshine.metric-unit.rp-kwh",
  message: "Rp./kWh",
});
export const RP_PER_KM = t({
  id: "sunshine.metric-unit.rp-km",
  message: "Rp./km",
});
export const MIN_PER_YEAR = t({
  id: "sunshine.metric-unit.min-year",
  message: "Min./year",
});

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
