import { t } from "@lingui/macro";

import { NetworkLevel } from "./sunshine";

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
export const PERCENT = t({
  id: "sunshine.metric-unit.percent",
  message: "%",
});
export const DAYS = t({
  id: "sunshine.metric-unit.days",
  message: "days",
});
export const SWISS_FRANCS = t({
  id: "sunshine.metric-unit.swiss-francs",
  message: "CHF",
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
