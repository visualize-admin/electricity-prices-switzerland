import { extent, range, scaleThreshold } from "d3";
import { useMemo } from "react";

import buildEnv from "src/env/build";
import {
  NetworkCostsData,
  StabilityData,
  TariffsData,
} from "src/graphql/resolver-types";
import { chartPalette } from "src/themes/palette";

export type ObservationValue = string | number | boolean | Date;
export type GenericObservation = Record<string, ObservationValue>;

type ComponentFields_NominalDimension_Fragment = {
  __typename: "NominalDimension";
  iri: string;
  label: string;
};

type ComponentFields_OrdinalDimension_Fragment = {
  __typename: "OrdinalDimension";
  iri: string;
  label: string;
};

type ComponentFields_TemporalDimension_Fragment = {
  __typename: "TemporalDimension";
  iri: string;
  label: string;
};

type ComponentFields_Measure_Fragment = {
  __typename: "Measure";
  iri: string;
  label: string;
};

type ComponentFields_Attribute_Fragment = {
  __typename: "Attribute";
  iri: string;
  label: string;
};

export type ComponentFieldsFragment =
  | ComponentFields_NominalDimension_Fragment
  | ComponentFields_OrdinalDimension_Fragment
  | ComponentFields_TemporalDimension_Fragment
  | ComponentFields_Measure_Fragment
  | ComponentFields_Attribute_Fragment;

const getDomainFromMedianValue = (medianValue: number | undefined) => {
  const m = medianValue ?? 0;
  const domain = [m * 0.85, m * 0.95, m * 1.05, m * 1.15];
  return domain;
};

export const useColorScale = <T>(options: {
  observations: T[];
  medianValue?: number | undefined;
  accessor: (x: T) => number | undefined;
}) => {
  return useMemo(() => {
    const domain =
      "medianValue" in options
        ? getDomainFromMedianValue(options.medianValue)
        : (extent(options.observations, (d) => options.accessor(d)) as [
            number,
            number
          ]);
    const scale = scaleThreshold<number, string>()
      .domain(domain)
      .range(chartPalette.diverging.GreenToOrange);

    return scale;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.medianValue, options.observations, options.accessor]);
};

export type Entity = "municipality" | "operator" | "canton";

if (!buildEnv.FIRST_PERIOD || !buildEnv.CURRENT_PERIOD) {
  throw Error(
    `Please configure FIRST_PERIOD and CURRENT_PERIOD in next.config.js`
  );
}

export const periods = range(
  parseInt(buildEnv.CURRENT_PERIOD, 10),
  parseInt(buildEnv.FIRST_PERIOD, 10) - 1,
  -1
).map((d) => d.toString());

export const priceComponents = [
  "total",
  "gridusage",
  "energy",
  "charge",
  "aidfee",
];
export const products = ["cheapest", "standard"];
export const categories = [
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "H7",
  "H8",
  "C1",
  "C2",
  "C3",
  "C4",
  "C5",
  "C6",
  "C7",
] as const;

export type PeerGroup = {
  energyDensity: string;
  settlementDensity: string;
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

export type ElectricityCategory = (typeof categories)[number];

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

export const tariffCategories = [
  // EC
  "EC2",
  "EC3",
  "EC4",
  "EC6",

  // EH
  "EH2",
  "EH4",
  "EH7",

  // NC
  "NC2",
  "NC3",
  "NC4",
  "NC6",

  // NH
  "NH2",
  "NH4",
  "NH7",
] as const;

export type TariffCategory = (typeof tariffCategories)[number];
// TODO Mapping should be at graphql level, we should be able to remove
// this function when this is done
export const asTariffCategory = (category: string): TariffCategory => {
  if (
    category === "EC2" ||
    category === "EC3" ||
    category === "EC4" ||
    category === "EC6" ||
    category === "EH2" ||
    category === "EH4" ||
    category === "EH7" ||
    category === "NC2" ||
    category === "NC3" ||
    category === "NC4" ||
    category === "NC6" ||
    category === "NH2" ||
    category === "NH4" ||
    category === "NH7"
  ) {
    return category as TariffCategory;
  }
  throw new Error(`Invalid network category: ${category}`);
};

/**
 * Use `bun wiki-content:update-types` to update this variable
 */
export const wikiPageSlugs = {
  available: [
    "help-calculation",
    "help-canton-comparison",
    "help-categories",
    "help-compliance",
    "help-download-raw-data",
    "help-energy-tariffs",
    "help-fixcosts",
    "help-grid-tariffs",
    "help-municipalities-and-grid-operators-info",
    "help-network-costs",
    "help-price-comparison",
    "help-price-components",
    "help-price-distribution",
    "help-price-evolution",
    "help-product-variety",
    "help-products",
    "help-saidi",
    "help-saifi",
    "help-search-list",
    "home-banner",
  ],
  missing: [
    "help-net-tariffs",
    "help-operational-standards",
    "help-net-tariff-category",
    "help-energy-tariff-category",
    "help-indicator",
    "help-typology",
    "help-network-level",
  ],
} as const;

export type WikiPageSlug = (typeof wikiPageSlugs)[
  | "available"
  | "missing"][number];
