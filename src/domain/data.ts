import { extent, range, scaleThreshold } from "d3";
import { useMemo } from "react";

import buildEnv from "src/env/build";
import { getPeerGroup } from "src/lib/sunshine-csv";
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
    peerGroupMedianRate: number;
    operatorRate: number;
    yearlyData: {
      year: string;
      rate: number;
      operator: number;
      category: ElectricityCategory;
    }[];
  };

  energyTariffs: {
    category: ElectricityCategory;
    peerGroupMedianRate: number;
    operatorRate: number;
    yearlyData: {
      year: string;
      rate: number;
      operator: number;
      category: ElectricityCategory;
    }[];
  };

  networkCosts: {
    networkLevel: {
      id: string;
    };
    peerGroupMedianRate: number;
    operatorRate: number;
    yearlyData: {
      year: string;
      rate: number;
      operator: number;
      category: ElectricityCategory;
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
      year: string;
      minutes: number;
      operator: number;
      planned: boolean;
    }[];
  };
  saifi: {
    operatorMinutes: number;
    peerGroupMinutes: number;
    yearlyData: {
      year: string;
      minutes: number;
      operator: number;
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

const fetchOperatorPeerGroup = async (operatorId: string) => {
  const peerGroup = await getPeerGroup(operatorId);
  return peerGroup;
};

export const fetchOperatorCostsAndTariffsData = async (operatorId: string) => {
  const peerGroup = await fetchOperatorPeerGroup(operatorId);
  if (!peerGroup) {
    throw new Error(`Peer group not found for operator ID: ${operatorId}`);
  }
  return {
    operator: {
      peerGroup,
    },
    networkCosts: {
      networkLevel: {
        id: "NE7",
      },
      operatorRate: 23.4,
      peerGroupMedianRate: 25.6,
      yearlyData: [
        { year: "2022", rate: 21.9, operator: 410, category: "H1" },
        { year: "2023", rate: 22.8, operator: 410, category: "H1" },
        { year: "2024", rate: 23.4, operator: 410, category: "H1" },
        { year: "2022", rate: 20.5, operator: 390, category: "H1" },
        { year: "2023", rate: 21.3, operator: 390, category: "H1" },
        { year: "2024", rate: 22.0, operator: 390, category: "H1" },
        { year: "2022", rate: 19.0, operator: 370, category: "H1" },
        { year: "2023", rate: 19.8, operator: 370, category: "H1" },
        { year: "2024", rate: 20.5, operator: 370, category: "H1" },
      ],
    },
    netTariffs: {
      category: "H1",
      operatorRate: 0.12,
      peerGroupMedianRate: 0.15,
      yearlyData: [
        { year: "2022", rate: 0.11, operator: 0.1, category: "H1" },
        { year: "2023", rate: 0.12, operator: 0.11, category: "H1" },
        { year: "2024", rate: 0.12, operator: 0.12, category: "H1" },
      ],
    },
    energyTariffs: {
      category: "H1",
      operatorRate: 0.12,
      peerGroupMedianRate: 0.15,
      yearlyData: [
        { year: "2022", rate: 0.11, operator: 0.1, category: "H1" },
        { year: "2023", rate: 0.12, operator: 0.11, category: "H1" },
        { year: "2024", rate: 0.12, operator: 0.12, category: "H1" },
      ],
    },
    latestYear: "2024",

    updateDate: "March 7, 2024, 1:28 PM",
  } satisfies SunshineCostsAndTariffsData;
};

export const fetchPowerStability = async (operatorId: string) => {
  const peerGroup = await fetchOperatorPeerGroup(operatorId);
  if (!peerGroup) {
    throw new Error(`Peer group not found for operator ID: ${operatorId}`);
  }
  return {
    operator: {
      peerGroup,
    },
    saidi: {
      operatorMinutes: 23.4,
      peerGroupMinutes: 25.6,
      yearlyData: [
        { year: "2022", minutes: 21.9, operator: 410, planned: true },
        { year: "2023", minutes: 22.8, operator: 410, planned: true },
        { year: "2024", minutes: 23.4, operator: 410, planned: true },
        { year: "2022", minutes: 20.5, operator: 390, planned: true },
        { year: "2023", minutes: 21.3, operator: 390, planned: true },
        { year: "2024", minutes: 22.0, operator: 390, planned: true },
        { year: "2022", minutes: 19.0, operator: 370, planned: true },
        { year: "2023", minutes: 19.8, operator: 370, planned: true },
        { year: "2024", minutes: 20.5, operator: 370, planned: true },
        { year: "2022", minutes: 21.9, operator: 410, planned: false },
        { year: "2023", minutes: 22.8, operator: 410, planned: false },
        { year: "2024", minutes: 23.4, operator: 410, planned: false },
        { year: "2022", minutes: 20.5, operator: 390, planned: false },
        { year: "2023", minutes: 21.3, operator: 390, planned: false },
        { year: "2024", minutes: 22.0, operator: 390, planned: false },
        { year: "2022", minutes: 19.0, operator: 370, planned: false },
        { year: "2023", minutes: 19.8, operator: 370, planned: false },
        { year: "2024", minutes: 20.5, operator: 370, planned: false },
      ],
    },
    saifi: {
      operatorMinutes: 23.4,
      peerGroupMinutes: 25.6,
      yearlyData: [
        { year: "2022", minutes: 21.9, operator: 410, planned: true },
        { year: "2023", minutes: 22.8, operator: 410, planned: true },
        { year: "2024", minutes: 23.4, operator: 410, planned: true },
        { year: "2022", minutes: 20.5, operator: 390, planned: true },
        { year: "2023", minutes: 21.3, operator: 390, planned: true },
        { year: "2024", minutes: 22.0, operator: 390, planned: true },
        { year: "2022", minutes: 19.0, operator: 370, planned: true },
        { year: "2023", minutes: 19.8, operator: 370, planned: true },
        { year: "2024", minutes: 20.5, operator: 370, planned: true },
        { year: "2022", minutes: 21.9, operator: 410, planned: false },
        { year: "2023", minutes: 22.8, operator: 410, planned: false },
        { year: "2024", minutes: 23.4, operator: 410, planned: false },
        { year: "2022", minutes: 20.5, operator: 390, planned: false },
        { year: "2023", minutes: 21.3, operator: 390, planned: false },
        { year: "2024", minutes: 22.0, operator: 390, planned: false },
        { year: "2022", minutes: 19.0, operator: 370, planned: false },
        { year: "2023", minutes: 19.8, operator: 370, planned: false },
        { year: "2024", minutes: 20.5, operator: 370, planned: false },
      ],
    },

    latestYear: "2024",

    updateDate: "March 7, 2024, 1:28 PM",
  } satisfies SunshinePowerStabilityData;
};

export const fetchOperationalStandards = async (operatorId: string) => {
  const peerGroup = await fetchOperatorPeerGroup(operatorId);
  if (!peerGroup) {
    throw new Error(`Peer group not found for operator ID: ${operatorId}`);
  }
  return {
    operator: {
      peerGroup,
    },
    productVariety: {
      ecoFriendlyProductsOffered: 5,
      productCombinationsOptions: true,
      operatorsProductsOffered: [
        { operatorId, ecoFriendlyProductsOffered: 5, year: "2024" },
      ],
    },
    serviceQuality: {
      notificationPeriodDays: 3,
      informingCustomersOfOutage: true,
      operatorsNotificationPeriodDays: [{ operatorId, days: 3, year: "2024" }],
    },
    compliance: {
      francsRule: "CHF 5",
      timelyPaperSubmission: true,
      operatorsFrancsPerInvoice: [
        { operatorId, francsPerInvoice: 5, year: "2024" },
      ],
    },
    latestYear: "2024",

    updateDate: "March 7, 2024, 1:28 PM",
  } satisfies SunshineOperationalStandardsData;
};
