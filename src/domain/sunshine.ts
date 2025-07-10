import * as z from "zod";

import { ElectricityCategory } from "src/domain/data";
import { QueryStateSunshineSaidiSaifiTypology } from "src/domain/query-states";
import { WikiPageSlug } from "src/domain/wiki";
import {
  NetworkCostsData,
  NetworkLevel as GraphQLNetworkLevel,
  StabilityData,
  TariffsData,
} from "src/graphql/resolver-types";

/**
 * Years available for sunshine data queries
 */
export const years = ["2025", "2024", "2023"];

/**
 * View by options for filtering
 */
export const peerGroupOptions = [
  "all_grid_operators",
  "A", // Urban / High
  "B", // Suburban / Medium-High
  "C", // Suburban / Medium
  "D", // Semi-Rural / Medium-Low
  "E", // Rural / Low
  "F", // Remote Rural / Very Low
  "G", // Alpine / Very Low
  "H", // Special/Industrial / Variable
];

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
] satisfies SunshineIndicator[];

/**
 * Network level options for filtering
 */
export const networkLevelOptions: GraphQLNetworkLevel["id"][] = [
  "NE5",
  "NE6",
  "NE7",
];

export const energyElectricityCategoryOptions: ElectricityCategory[] = [
  "C2",
  "C3",
  "C4",
  "C6",
  "H2",
  "H4",
  "H7",
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

/**
 * Peer group mapping from letters to energy and settlement density
 * FIXME: This is mock data based on the SPARQL hardcoded mapping
 * Should be replaced with actual data from the backend when available
 */
export const peerGroupMapping: Record<
  string,
  { energy_density: string; settlement_density: string }
> = {
  A: { energy_density: "High", settlement_density: "Medium" },
  B: { energy_density: "High", settlement_density: "Rural" },
  C: { energy_density: "High", settlement_density: "Mountain" },
  D: { energy_density: "High", settlement_density: "Unknown" },
  E: { energy_density: "Low", settlement_density: "Medium" },
  F: { energy_density: "Low", settlement_density: "Rural" },
  G: { energy_density: "Low", settlement_density: "Mountain" },
  H: { energy_density: "Low", settlement_density: "Tourist" },
  NA: { energy_density: "N.A.", settlement_density: "N.A." },
};

export const sunshineIndicatorSchema = z.enum([
  "networkCosts",
  "netTariffs",
  "energyTariffs",
  "saidi",
  "saifi",
  "serviceQuality",
  "compliance",
] as const);

export type SunshineIndicator = z.infer<typeof sunshineIndicatorSchema>;
export type PeerGroup = {
  energyDensity: string;
  settlementDensity: string;
};
export type SunshineCostsAndTariffsData = {
  latestYear: string;
  netTariffs: TariffsData;
  energyTariffs: TariffsData;
  networkCosts: NetworkCostsData;
  operator: {
    peerGroup: {
      energyDensity: string;
      settlementDensity: string;
    };
  };
  updateDate: string;
};

export type SunshinePowerStabilityData = {
  latestYear: string;
  saidi: StabilityData;
  saifi: StabilityData;

  operator: {
    peerGroup: {
      energyDensity: string;
      settlementDensity: string;
    };
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
    peerGroup: {
      energyDensity: string;
      settlementDensity: string;
    };
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
  serviceQuality: "help-operational-standards",
  compliance: "help-compliance",
};
