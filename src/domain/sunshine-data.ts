import {
  QueryStateSunshineIndicator,
  QueryStateSunshineSaidiSaifiTypology,
} from "src/domain/query-states";
import { TariffCategory } from "src/graphql/resolver-mapped-types";
import { NetworkLevel } from "src/graphql/resolver-types";

/**
 * Years available for sunshine data queries
 */
export const years = ["2024", "2023"];

/**
 * View by options for filtering
 */
export const viewByOptions = ["all_grid_operators", "canton", "municipality"];

/**
 * Typology options for filtering
 */
export const typologyOptions = [
  "total",
  "planned",
  "unplanned",
] satisfies QueryStateSunshineSaidiSaifiTypology[];

/**
 * Indicator options for filtering
 */
export const indicatorOptions = [
  "networkCosts",
  "netTariffs",
  "energyTariffs",
  "saidi", // Power Outage Duration
  "saifi", // Power Outage Frequency
  "serviceQuality",
  "compliance",
] satisfies QueryStateSunshineIndicator[];

/**
 * Network level options for filtering
 */
export const networkLevelOptions: NetworkLevel["id"][] = ["NE5", "NE6", "NE7"];

export const energyTariffCategoryOptions: TariffCategory[] = [
  "EC2",
  "EC3",
  "EC4",
  "EC6",
  "EH2",
  "EH4",
  "EH7",
];

export const netTariffCategoryOptions: TariffCategory[] = [
  "NC2",
  "NC3",
  "NC4",
  "NC6",
  "NH2",
  "NH4",
  "NH7",
];
