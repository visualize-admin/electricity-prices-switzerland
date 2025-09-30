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
export const CHF_PER_KM = t({
  id: "sunshine.metric-unit.chf-km",
  message: "CHF/km",
});
export const CHF_PER_KVA = t({
  id: "sunshine.metric-unit.chf-kva",
  message: "CHF/kVA",
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

export const networkLevelUnits = {
  NE5: "CHF/km",
  NE6: "CHF/kVA",
  NE7: "CHF/km",
} as const;

const translationByUnits = {
  "CHF/km": CHF_PER_KM,
  "CHF/kVA": CHF_PER_KVA,
} as const;

export const getNetworkLevelMetrics = (level: NetworkLevel["id"]) => {
  return translationByUnits[networkLevelUnits[level]];
};
