import { first } from "lodash";

import { TariffCategory } from "src/domain/data";
import { NetworkLevel } from "src/domain/sunshine";
import {
  SunshineCostsAndTariffsData,
  SunshineOperationalStandardsData,
  SunshinePowerStabilityData,
} from "src/domain/sunshine";
import {
  NetworkCostsData,
  StabilityData,
  TariffsData,
  Trend,
} from "src/graphql/resolver-types";
import {
  SunshineDataService,
  TariffRecord,
} from "src/lib/sunshine-data-service";

type NetworkCostsParams = {
  metric: "network_costs";
  peerGroup?: string;
  period?: number;
  networkLevel: NetworkLevel["id"]; // Required for network_costs
};

type StabilityParams = {
  metric: "stability";
  peerGroup?: string;
  period?: number;
};

type OperationalParams = {
  metric: "operational";
  peerGroup?: string;
  period?: number;
};

type NetTariffsParams = {
  metric: "net-tariffs";
  peerGroup?: string;
  period?: number;
  category: TariffCategory; // Required for tariffs
};

type EnergyTariffsParams = {
  metric: "energy-tariffs";
  peerGroup?: string;
  period?: number;
  category: TariffCategory; // Required for tariffs
};

export type IndicatorMedianParams =
  | NetworkCostsParams
  | StabilityParams
  | OperationalParams
  | NetTariffsParams
  | EnergyTariffsParams;

const getTrend = (
  previousValue: number | undefined | null,
  currentValue: number | undefined | null
): Trend => {
  if (previousValue === null || currentValue === null) {
    return Trend.Stable; // Cannot determine trend without both values
  }
  if (currentValue === undefined || previousValue === undefined) {
    return Trend.Stable; // Cannot determine trend without both values
  }
  if (currentValue > previousValue) {
    return Trend.Up;
  } else if (currentValue < previousValue) {
    return Trend.Down;
  } else {
    return Trend.Stable;
  }
};

/**
 * Fetch costs and tariffs data for a specific operator
 * @param db Database service
 * @param operatorId The operator ID
 * @returns Costs and tariffs data
 */
export const fetchNetworkCostsData = async (
  db: SunshineDataService,
  {
    operatorId,
    networkLevel = "NE5",
    period,
  }: {
    operatorId: number;
    networkLevel?: NetworkLevel["id"];
    period?: number;
  }
): Promise<NetworkCostsData> => {
  const operatorData = await db.getOperatorData(operatorId);

  // Get the latest year if period not provided
  let targetPeriod = period;
  if (!targetPeriod) {
    targetPeriod = await db.getLatestYearSunshine(operatorId);
  }

  const peerGroupMedianNetworkCosts =
    await db.getIndicatorMedian<"network_costs">({
      peerGroup: operatorData.peer_group,
      metric: "network_costs",
      networkLevel: networkLevel,
      period: targetPeriod,
    });

  // Might be a little fragile, we should get the latest year when there is data
  const previousYear = targetPeriod - 1;

  const previousPeerGroupMedianNetworkCosts =
    await db.getIndicatorMedian<"network_costs">({
      peerGroup: operatorData.peer_group,
      metric: "network_costs",
      networkLevel: networkLevel,

      period: previousYear,
    });

  const operatorNetworkCosts = await db.getNetworkCosts({
    operatorId,
    networkLevel: networkLevel,
    period: targetPeriod,
  });

  if (operatorNetworkCosts.length > 1) {
    throw new Error(
      "Cannot have multiple network costs records for one operator in one year"
    );
  }

  const networkCosts = (
    await db.getNetworkCosts({
      peerGroup: operatorData.peer_group,
      networkLevel: networkLevel,
    })
  )
    // TODO Should be done in the view
    .filter((x) => !Number.isNaN(x.rate) && Number.isFinite(x.rate));

  const operatorNetworkCost = first(operatorNetworkCosts);

  const previousOperatorNetworkCosts = await db.getNetworkCosts({
    period: previousYear,
    operatorId,
    networkLevel,
  });

  const previousOperatorNetworkCost = previousOperatorNetworkCosts
    ? previousOperatorNetworkCosts[0]
    : undefined;

  return {
    networkLevel: { id: networkLevel },
    operatorRate: operatorNetworkCost?.rate ?? null,
    operatorTrend: getTrend(
      previousOperatorNetworkCost?.rate,
      operatorNetworkCost?.rate
    ),
    peerGroupMedianRate: peerGroupMedianNetworkCosts?.median_value ?? null,
    peerGroupMedianTrend: getTrend(
      previousPeerGroupMedianNetworkCosts?.median_value,
      peerGroupMedianNetworkCosts?.median_value
    ),
    yearlyData: networkCosts,
  };
};

export const fetchNetTariffsData = async (
  db: SunshineDataService,
  {
    operatorId,
    category = "NC2",
    period,
  }: {
    operatorId: number;
    category: TariffCategory;
    period: number;
  }
): Promise<{
  category: TariffCategory;
  operatorRate: number | null;
  peerGroupMedianRate: number | null;
  yearlyData: TariffRecord[];
}> => {
  const operatorData = await db.getOperatorData(operatorId);

  const peerGroupMedianNetTariffs = await db.getIndicatorMedian<"net-tariffs">({
    peerGroup: operatorData.peer_group,
    metric: "net-tariffs",
    category: category,
  });

  const operatorNetTariffs = await db.getTariffs({
    period: period,
    tariffType: "network",
    category: category,
    operatorId,
  });

  if (operatorNetTariffs.length > 1) {
    throw new Error(
      "Cannot have multiple net tariffs records for one operator in one year"
    );
  }

  const operatorNetTariff = first(operatorNetTariffs);

  const netTariffs = await db.getTariffs({
    peerGroup: operatorData.peer_group,
    tariffType: "network",
    category: category,
  });

  return {
    category: category,
    operatorRate: operatorNetTariff?.rate ?? null,
    peerGroupMedianRate: peerGroupMedianNetTariffs?.median_rate ?? null,
    yearlyData: netTariffs,
  };
};

export const fetchEnergyTariffsData = async (
  db: SunshineDataService,
  {
    operatorId,
    category,
    period,
  }: {
    operatorId: number;
    category: TariffCategory;
    period: number;
  }
): Promise<TariffsData> => {
  const operatorData = await db.getOperatorData(operatorId);

  const peerGroupMedianEnergyTariffs =
    await db.getIndicatorMedian<"energy-tariffs">({
      peerGroup: operatorData.peer_group,
      metric: "energy-tariffs",
      category: category,
    });

  const operatorEnergyTariffs = await db.getTariffs({
    period: period,
    category: category,
    operatorId: operatorId,
  });

  if (operatorEnergyTariffs.length > 1) {
    throw new Error(
      "Cannot have multiple energy tariffs records for one operator in one year"
    );
  }

  const operatorEnergyTariff = first(operatorEnergyTariffs);

  const energyTariffs = await db.getTariffs({
    peerGroup: operatorData.peer_group,
    category: category,
    operatorId: operatorId,
  });

  return {
    category: category,
    operatorRate: operatorEnergyTariff?.rate ?? null,
    peerGroupMedianRate: peerGroupMedianEnergyTariffs?.median_rate ?? null,
    yearlyData: energyTariffs,
  };
};

export const fetchOperatorCostsAndTariffsData = async (
  db: SunshineDataService,
  {
    operatorId: operatorId_,
    networkLevel,
    category,
    period,
  }: {
    operatorId: string;
    networkLevel: NetworkLevel["id"];
    category: TariffCategory;
    period?: number;
  }
): Promise<SunshineCostsAndTariffsData> => {
  const operatorId = parseInt(operatorId_, 10);
  const operatorData = await db.getOperatorData(operatorId);

  // Get the latest year if period not provided
  let targetPeriod = period;
  if (!targetPeriod) {
    targetPeriod = await db.getLatestYearSunshine(operatorId);
  }

  const networkCostsData = await fetchNetworkCostsData(db, {
    operatorId,
    networkLevel,
    period: targetPeriod,
  });
  const netTariffsData = await fetchNetTariffsData(db, {
    operatorId,
    category,
    period: targetPeriod,
  });
  const energyTariffsData = await fetchEnergyTariffsData(db, {
    operatorId,
    category,
    period: targetPeriod,
  });

  // Create response object
  return {
    latestYear: `${targetPeriod}`,
    operator: {
      peerGroup: {
        settlementDensity: operatorData.settlement_density,
        energyDensity: operatorData.energy_density,
      },
    },
    networkCosts: networkCostsData,
    netTariffs: netTariffsData,
    energyTariffs: energyTariffsData,
    updateDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

/**
 * Fetch power stability data for a specific operator
 * @param operatorId The operator ID
 * @returns Power stability data
 */
/**
 * Fetch SAIDI (System Average Interruption Duration Index) data for a specific operator
 * @param db Database service
 * @param operatorId The operator ID
 * @param period Year parameter
 * @returns SAIDI data
 */
export const fetchSaidi = async (
  db: SunshineDataService,
  {
    operatorId,
    period,
  }: {
    operatorId: number;
    period: number;
  }
): Promise<StabilityData> => {
  const operatorData = await db.getOperatorData(operatorId);

  // Get peer group median SAIDI
  const peerGroupMedianStability = await db.getIndicatorMedian<"stability">({
    peerGroup: operatorData.peer_group,
    metric: "stability",
    period,
  });

  const operatorStability = await db.getStabilityMetrics({
    operatorId,
    period,
  });
  if (operatorStability.length > 1) {
    throw new Error(
      "Cannot have multiple stability records for one operator in one year"
    );
  }
  const peerGroupYearlyStability = await db.getStabilityMetrics({
    peerGroup: operatorData.peer_group,
  });

  return {
    operatorTotal: operatorStability?.[0]?.saidi_total || 0,
    peerGroupTotal: peerGroupMedianStability?.median_saidi_total || 0,
    yearlyData: peerGroupYearlyStability.map((x) => ({
      year: x.period,
      total: x.saidi_total ?? null,
      operator: x.operator_id,
      operator_name: x.operator_name ?? null,
      unplanned: x.saidi_unplanned ?? null,
    })),
  };
};

/**
 * Fetch SAIFI (System Average Interruption Frequency Index) data for a specific operator
 * @param db Database service
 * @param operatorId The operator ID
 * @param year Year parameter
 * @returns SAIFI data
 */
export const fetchSaifi = async (
  db: SunshineDataService,
  {
    operatorId,
    period,
  }: {
    operatorId: number;
    period: number;
  }
): Promise<StabilityData> => {
  const operatorData = await db.getOperatorData(operatorId);
  if (!operatorData) {
    throw new Error(`Peer group not found for operator ID: ${operatorId}`);
  }

  const peerGroupMedianStability = await db.getIndicatorMedian<"stability">({
    peerGroup: operatorData.peer_group,
    metric: "stability",
    period,
  });

  const operatorStability = await db.getStabilityMetrics({
    operatorId,
    period,
  });
  if (operatorStability.length > 1) {
    throw new Error(
      "Cannot have multiple stability records for one operator in one year"
    );
  }
  const peerGroupYearlyStability = await db.getStabilityMetrics({
    peerGroup: operatorData.peer_group,
  });

  return {
    operatorTotal: operatorStability?.[0]?.saifi_total || 0,
    peerGroupTotal: peerGroupMedianStability?.median_saifi_total || 0,
    yearlyData: peerGroupYearlyStability.map((x) => ({
      year: x.period,
      total: x.saifi_total ?? null,
      operator: x.operator_id,
      operator_name: x.operator_name,
      unplanned: x.saifi_unplanned ?? null,
    })),
  };
};

export const fetchPowerStability = async (
  db: SunshineDataService,
  {
    operatorId: operatorId_,
  }: {
    operatorId: string; // Operator ID as a string
  }
): Promise<SunshinePowerStabilityData> => {
  const operatorId = parseInt(operatorId_, 10);
  const operatorData = await db.getOperatorData(operatorId);

  const latestYear = await db.getLatestYearPowerStability(operatorId);
  const targetYear = parseInt(latestYear, 10);
  const saidiData = await fetchSaidi(db, {
    operatorId: operatorId,
    period: targetYear,
  });
  const saifiData = await fetchSaifi(db, {
    operatorId: operatorId,
    period: targetYear,
  });

  return {
    latestYear,
    operator: {
      peerGroup: {
        settlementDensity: operatorData.settlement_density,
        energyDensity: operatorData.energy_density,
      },
    },
    saidi: saidiData,
    saifi: saifiData,
    updateDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

/**
 * Fetch operational standards data for a specific operator
 * @param db Database service
 * @param operatorId The operator ID
 * @returns Operational standards data
 */
export const fetchOperationalStandards = async (
  db: SunshineDataService,
  {
    operatorId: operatorId_,
  }: {
    operatorId: string;
  }
): Promise<SunshineOperationalStandardsData> => {
  const operatorId = parseInt(operatorId_, 10);
  const operatorData = await db.getOperatorData(operatorId);
  const period = await db.getLatestYearSunshine(operatorId);
  const operationalData = await db.getOperationalStandards({
    operatorId: operatorId,
    period: period,
  });

  const data = operationalData[0] || {
    frankenRegel: 0,
    infoJaNein: "Nein",
    infoTageImVoraus: 0,
    rechtzeitig: 0,
    produkteAnzahl: 0,
    produkteAuswahl: "Nein",
  };

  const informingCustomersOfOutage = data.info_yes_no === "Ja";
  const timelyPaperSubmission = data.timely === 1;

  return {
    latestYear: `${period}`,
    operator: {
      peerGroup: {
        settlementDensity: operatorData.settlement_density,
        energyDensity: operatorData.energy_density,
      },
    },
    productVariety: {
      ecoFriendlyProductsOffered: 0, // TODO
      productCombinationsOptions: false, // TODO,
      operatorsProductsOffered: [
        {
          operatorId: `${operatorId}`, // TODO
          ecoFriendlyProductsOffered: 0, // TODO
          year: `${period}`,
        },
      ],
    },
    serviceQuality: {
      notificationPeriodDays: data.info_days_in_advance || 0,
      informingCustomersOfOutage,
      operatorsNotificationPeriodDays: [
        {
          operatorId: `${operatorId}`, // TODO
          days: data.info_days_in_advance || 0,
          year: `${period}`,
        },
      ],
    },
    compliance: {
      francsRule: `CHF ${data.franc_rule.toFixed(2)}`,
      timelyPaperSubmission,
      operatorsFrancsPerInvoice: [
        {
          operatorId: `${operatorId}`, // TODO
          francsPerInvoice: data.franc_rule || 0,
          year: `${period}`,
        },
      ],
    },
    updateDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};
