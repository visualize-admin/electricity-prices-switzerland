import * as z from "zod";

import { ElectricityCategory } from "src/domain/data";
import {
  QueryStateSunshineComplianceType,
  QueryStateSunshineSaidiSaifiType,
} from "src/domain/query-states";
import { WikiPageSlug } from "src/domain/wiki";
import { runtimeEnv } from "src/env/runtime";
import {
  NetworkCostsData,
  NetworkLevel as GraphQLNetworkLevel,
  StabilityData,
  TariffsData,
} from "src/graphql/resolver-types";
import { PeerGroup } from "src/graphql/resolver-types";
export type { PeerGroup } from "src/graphql/resolver-types";
/**
 * Years available for sunshine data queries
 */
export const years = ["2026", "2025", "2024"];

export const sunshineYearsSchema = z
  .enum(years as [string, ...string[]])
  .default(runtimeEnv.CURRENT_PERIOD);

/**
 * Typology options for filtering
 */
export const saidiSaifiTypes = [
  "total",
  "planned",
  "unplanned",
] satisfies QueryStateSunshineSaidiSaifiType[];

export const complianceTypes = [
  "franc-rule",
] satisfies QueryStateSunshineComplianceType[];

/**
 * Indicator options for filtering
 */
export const indicatorOptions = [
  "networkCosts",
  "netTariffs",
  "energyTariffs",
  "saidi", // Power Outage Duration
  "saifi", // Power Outage Frequency
  "outageInfo",
  "daysInAdvanceOutageNotification",
  "compliance",
] satisfies SunshineIndicator[];

/**
 * Network level options for filtering
 */
export const networkLevelOptions: GraphQLNetworkLevel["id"][] = [
  "NE5",
  "NE6",
  "NE7",
];

export const netElectricityCategoryOptions: ElectricityCategory[] = [
  "C2",
  "C3",
  "C4",
  "C6",
  "H2",
  "H4",
  "H7",
];

export const peerGroupOperatorId = 10000;
export const peerGroupOperatorName = "MEDIAN_PEER_GROUP";

export const sunshineIndicatorSchema = z.enum([
  "networkCosts",
  "netTariffs",
  "energyTariffs",
  "saidi",
  "saifi",
  "outageInfo",
  "daysInAdvanceOutageNotification",
  "compliance",
] as const);

export type SunshineIndicator = z.infer<typeof sunshineIndicatorSchema>;
export type SunshineCostsAndTariffsData = {
  latestYear: string;
  netTariffs: TariffsData;
  energyTariffs: TariffsData;
  networkCosts: NetworkCostsData;
  operator: {
    peerGroup: PeerGroup;
  };
  updateDate: string;
};

export type SunshinePowerStabilityData = {
  latestYear: string;
  saidi: StabilityData;
  saifi: StabilityData;

  operator: {
    peerGroup: PeerGroup;
  };
  updateDate: string;
};

export type SunshineOperationalStandardsData = {
  latestYear: string;
  productVariety: {
    ecoFriendlyProductsOffered: number;
    productCombinationsOptions: boolean;
    operatorsProductsOffered: {
      operatorId: string;
      ecoFriendlyProductsOffered: number;
      year: string;
    }[];
  };
  serviceQuality: {
    notificationPeriodDays: number;
    informingCustomersOfOutage: boolean;
    operatorsNotificationPeriodDays: {
      operatorId: string;
      days: number;
      year: string;
    }[];
  };

  compliance: {
    francsRule: string;
    timelyPaperSubmission: boolean;
    operatorsFrancsPerInvoice: {
      operatorId: string;
      francsPerInvoice: number;
      year: string;
    }[];
  };
  operator: {
    peerGroup: PeerGroup;
  };
  updateDate: string;
};
export type NetworkLevel = {
  id: "NE5" | "NE6" | "NE7";
};

export const asNetworkLevel = (id: string): NetworkLevel["id"] => {
  if (id === "NE5" || id === "NE6" || id === "NE7") {
    return id as NetworkLevel["id"];
  }
  throw new Error(`Invalid network level: ${id}`);
};

export const indicatorWikiPageSlugMapping: Record<
  SunshineIndicator,
  WikiPageSlug
> = {
  networkCosts: "help-network-costs",
  netTariffs: "help-net-tariffs",
  energyTariffs: "help-energy-tariffs",
  saidi: "help-saidi",
  saifi: "help-saifi",
  outageInfo: "help-compliance",
  daysInAdvanceOutageNotification: "help-compliance",
  compliance: "help-compliance",
};
