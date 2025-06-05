import { extent, range, scaleThreshold } from "d3";
import { useMemo } from "react";

import buildEnv from "src/env/build";
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
  accessor: (x: T) => number;
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
];

export type PeerGroup = {
  energyDensity: string;
  settlementDensity: string;
};

export type NetworkLevel = {
  id: string;
};

export type ElectricityCategory =
  | "C1"
  | "C2"
  | "C3"
  | "C4"
  | "C5"
  | "C6"
  | "C7"
  | "C8"
  | "H1"
  | "H2"
  | "H3"
  | "H4"
  | "H5"
  | "H6"
  | "H7"
  | "H8";

export type SunshineCostsAndTariffsData = {
  latestYear: string;
  netTariffs: {
    category: ElectricityCategory;
    peerGroupMedianRate: number | null;
    operatorRate: number | null;
    yearlyData: {
      period: number;
      rate: number;
      operator_id: number;
      category: ElectricityCategory;
      operator_name: string;
    }[];
  };

  energyTariffs: {
    category: ElectricityCategory;
    peerGroupMedianRate: number | null;
    operatorRate: number | null;
    yearlyData: {
      period: number;
      rate: number;
      operator_id: number;
      operator_name: string;
      category: ElectricityCategory;
    }[];
  };

  networkCosts: {
    networkLevel: {
      id: string;
    };
    peerGroupMedianRate: number | null;
    operatorRate: number | null;
    yearlyData: {
      year: number;
      rate: number;
      operator_id: number;
      operator_name: string;
      network_level: NetworkLevel["id"];
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

export type SunshinePowerStabilityData = {
  latestYear: string;
  saidi: {
    operatorMinutes: number;
    peerGroupMinutes: number;
    yearlyData: {
      year: number;
      minutes: number;
      operator: number;
      operator_name: string;
      planned: boolean;
    }[];
  };
  saifi: {
    operatorMinutes: number;
    peerGroupMinutes: number;
    yearlyData: {
      year: number;
      minutes: number;
      operator: number;
      operator_name: string;
      planned: boolean;
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

export { fetchOperationalStandards } from "src/lib/db/sunshine-data";
export { fetchOperatorCostsAndTariffsData } from "src/lib/db/sunshine-data";
export { fetchPowerStability } from "src/lib/db/sunshine-data";
