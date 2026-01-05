import { first, sortBy } from "lodash";

import { ElectricityCategory } from "src/domain/data";
import {
  NetworkLevel,
  peerGroupOperatorId,
  peerGroupOperatorName,
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
import { SunshineDataService } from "src/lib/sunshine-data-service";

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
  category: ElectricityCategory; // Required for tariffs
};

type EnergyTariffsParams = {
  metric: "energy-tariffs";
  peerGroup?: string;
  period?: number;
  category: ElectricityCategory; // Required for tariffs
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
 * Helper function to find current and previous period data from yearly indicator median results
 * @param yearlyData Array of yearly data sorted or unsorted
 * @param targetPeriod The period to find current and previous data for
 * @returns Object containing current and previous period data with their indices
 */
const findCurrentAndPreviousPeriodData = <T extends { period: number }>(
  yearlyData: T[],
  targetPeriod: number
): {
  currentData: T | undefined;
  previousData: T | undefined;
  currentIndex: number;
  previousIndex: number;
  previousYear: number;
} => {
  const sortedByYear = sortBy(yearlyData, [(x) => x.period]);
  const currentIndex = sortedByYear?.findIndex(
    (x) => x.period === targetPeriod
  );
  const previousIndex = currentIndex !== undefined ? currentIndex - 1 : -1;
  const previousData = sortedByYear?.[previousIndex];
  const currentData = sortedByYear?.[currentIndex];
  const previousYear = previousData?.period ?? targetPeriod - 1;

  return {
    currentData,
    previousData,
    currentIndex,
    previousIndex,
    previousYear,
  };
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
    operatorOnly,
  }: {
    operatorId: number;
    networkLevel?: NetworkLevel["id"];
    period?: number;
    operatorOnly?: boolean;
  }
): Promise<NetworkCostsData> => {
  // Get the latest year if period not provided
  let targetPeriod = period;
  if (!targetPeriod) {
    targetPeriod = await db.getLatestYearSunshine(operatorId);
  }
  const operatorData = await db.getOperatorData(operatorId, targetPeriod);

  const yearlyPeerGroupMedianNetworkCosts =
    await db.getYearlyIndicatorMedians<"network_costs">({
      peerGroup: operatorData.peer_group,
      metric: "network_costs",
      networkLevel: networkLevel,
    });

  const {
    currentData: peerGroupMedianNetworkCosts,
    previousData: previousPeerGroupMedianNetworkCosts,
    previousYear,
  } = findCurrentAndPreviousPeriodData(
    yearlyPeerGroupMedianNetworkCosts,
    targetPeriod
  );
  const [operatorNetworkCosts, networkCosts, previousOperatorNetworkCosts] =
    await Promise.all([
      db.getNetworkCosts({
        operatorId,
        networkLevel: networkLevel,
        period: targetPeriod,
      }),
      db.getNetworkCosts({
        networkLevel: networkLevel,
        operatorId: operatorOnly ? operatorId : undefined,
      }),
      db.getNetworkCosts({
        period: previousYear,
        operatorId,
        networkLevel,
      }),
    ]);

  if (operatorNetworkCosts.length > 1) {
    throw new Error(
      "Cannot have multiple network costs records for one operator in one year"
    );
  }

  const operatorNetworkCost = first(operatorNetworkCosts);

  const previousOperatorNetworkCost = previousOperatorNetworkCosts
    ? previousOperatorNetworkCosts[0]
    : undefined;

  const peerGroupMedianAsYearlyData = yearlyPeerGroupMedianNetworkCosts.map(
    (item) => ({
      year: item.period,
      rate: item.median_value,
      operator_id: peerGroupOperatorId,
      operator_name: peerGroupOperatorName,
      network_level: item.network_level,
    })
  );

  // Concatenate peer group median data into yearlyData with special operator_id and name
  const combinedYearlyData = [...networkCosts, ...peerGroupMedianAsYearlyData];

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
    yearlyData: combinedYearlyData,
  };
};

export const fetchNetTariffsData = async (
  db: SunshineDataService,
  {
    operatorId,
    category,
    period,
    operatorOnly,
  }: {
    operatorId: number;
    category: ElectricityCategory;
    period: number;
    operatorOnly?: boolean;
  }
): Promise<TariffsData> => {
  const operatorData = await db.getOperatorData(operatorId, period);

  const yearlyPeerGroupMedianNetTariffs =
    await db.getYearlyIndicatorMedians<"net-tariffs">({
      peerGroup: operatorData.peer_group,
      metric: "net-tariffs",
      category: category,
    });

  const {
    currentData: peerGroupMedianNetTariffs,
    previousData: previousPeerGroupMedianNetTariffs,
    previousYear,
  } = findCurrentAndPreviousPeriodData(yearlyPeerGroupMedianNetTariffs, period);

  const operatorNetTariffs = await db.getTariffs({
    category: category,
    operatorId,
    period: period,
    tariffType: "network",
  });

  if (operatorNetTariffs.length > 1) {
    throw new Error(
      "Cannot have multiple net tariffs records for one operator in one year"
    );
  }

  const operatorNetTariff = first(operatorNetTariffs);

  const previousOperatorNetTariffs = await db.getTariffs({
    category: category,
    operatorId,
    period: previousYear,
    tariffType: "network",
  });

  const previousOperatorNetTariff = first(previousOperatorNetTariffs);

  const netTariffs = await db.getTariffs({
    peerGroup: operatorData.peer_group,
    tariffType: "network",
    category: category,
    operatorId: operatorOnly ? operatorId : undefined,
  });

  const peerGroupMedianAsYearlyData = yearlyPeerGroupMedianNetTariffs.map(
    (item) => ({
      period: item.period,
      rate: item.median_rate,
      operator_id: peerGroupOperatorId,
      operator_name: peerGroupOperatorName,
      category: item.category,
    })
  );

  // Concatenate peer group median data into yearlyData with special operator_id and name
  const combinedYearlyData = [...netTariffs, ...peerGroupMedianAsYearlyData];

  return {
    category: category,
    operatorRate: operatorNetTariff?.rate ?? null,
    operatorTrend: getTrend(
      previousOperatorNetTariff?.rate,
      operatorNetTariff?.rate
    ),
    peerGroupMedianRate: peerGroupMedianNetTariffs?.median_rate ?? null,
    peerGroupMedianTrend: getTrend(
      previousPeerGroupMedianNetTariffs?.median_rate,
      peerGroupMedianNetTariffs?.median_rate
    ),
    yearlyData: combinedYearlyData,
  };
};

export const fetchEnergyTariffsData = async (
  db: SunshineDataService,
  {
    operatorId,
    category,
    period,
    operatorOnly,
  }: {
    operatorId: number;
    category: ElectricityCategory;
    period: number;
    operatorOnly?: boolean;
  }
): Promise<TariffsData> => {
  const operatorData = await db.getOperatorData(operatorId, period);

  //. Get indicator median data for energy tariffs
  const yearlyPeerGroupMedianEnergyTariffs =
    await db.getYearlyIndicatorMedians<"energy-tariffs">({
      peerGroup: operatorData.peer_group,
      metric: "energy-tariffs",
      category: category,
    });

  const {
    currentData: peerGroupMedianEnergyTariffs,
    previousData: previousPeerGroupMedianEnergyTariffs,
    previousYear,
  } = findCurrentAndPreviousPeriodData(
    yearlyPeerGroupMedianEnergyTariffs,
    period
  );

  const operatorEnergyTariffs = await db.getTariffs({
    category: category,
    operatorId: operatorId,
    period: period,
    tariffType: "energy",
  });

  if (operatorEnergyTariffs.length > 1) {
    throw new Error(
      "Cannot have more than 1 energy tariff record for one operator in one year"
    );
  }

  const operatorEnergyTariff = first(operatorEnergyTariffs);

  const previousOperatorEnergyTariffs = await db.getTariffs({
    category: category,
    operatorId: operatorId,
    period: previousYear,
    tariffType: "energy",
  });

  const previousOperatorEnergyTariff = first(previousOperatorEnergyTariffs);

  const energyTariffs = await db.getTariffs({
    peerGroup: operatorData.peer_group,
    category: category,
    tariffType: "energy",
    operatorId: operatorOnly ? operatorId : undefined,
  });

  // Concatenate peer group median data into yearlyData with special operator_id and name
  const peerGroupMedianAsYearlyData = yearlyPeerGroupMedianEnergyTariffs.map(
    (item) => ({
      period: item.period,
      rate: item.median_rate,
      operator_id: peerGroupOperatorId,
      operator_name: peerGroupOperatorName,
      category: item.category,
    })
  );

  const combinedYearlyData = [...energyTariffs, ...peerGroupMedianAsYearlyData];

  return {
    category: category,
    operatorRate: operatorEnergyTariff?.rate ?? null,
    operatorTrend: getTrend(
      previousOperatorEnergyTariff?.rate,
      operatorEnergyTariff?.rate
    ),
    peerGroupMedianRate: peerGroupMedianEnergyTariffs?.median_rate ?? null,
    peerGroupMedianTrend: getTrend(
      previousPeerGroupMedianEnergyTariffs?.median_rate,
      peerGroupMedianEnergyTariffs?.median_rate
    ),
    yearlyData: combinedYearlyData,
  };
};

export const fetchOperatorCostsAndTariffsData = async (
  db: SunshineDataService,
  {
    operatorId: operatorId_,
    networkLevel,
    category,
    period,
    operatorOnly,
  }: {
    operatorId: string;
    networkLevel: NetworkLevel["id"];
    category: ElectricityCategory;
    period?: number;
    operatorOnly?: boolean;
  }
): Promise<SunshineCostsAndTariffsData> => {
  const operatorId = parseInt(operatorId_, 10);

  // Get the latest year if period not provided
  let targetPeriod = period;
  if (!targetPeriod) {
    targetPeriod = await db.getLatestYearSunshine(operatorId);
  }
  const operatorData = await db.getOperatorData(operatorId, targetPeriod);

  const [networkCostsData, netTariffsData, energyTariffsData, updateDate] =
    await Promise.all([
      fetchNetworkCostsData(db, {
        operatorId,
        networkLevel,
        period: targetPeriod,
        operatorOnly,
      }),
      fetchNetTariffsData(db, {
        operatorId,
        category,
        period: targetPeriod,
        operatorOnly,
      }),
      fetchEnergyTariffsData(db, {
        operatorId,
        category,
        period: targetPeriod,
        operatorOnly,
      }),
      db.fetchUpdateDate(),
    ]);

  // Create response object
  return {
    latestYear: `${targetPeriod}`,
    operator: {
      peerGroup: {
        id: operatorData.peer_group,
        settlementDensity: operatorData.settlement_density,
        energyDensity: operatorData.energy_density,
      },
    },
    networkCosts: networkCostsData,
    netTariffs: netTariffsData,
    energyTariffs: energyTariffsData,
    updateDate,
  };
};

/**
 * Fetch power stability data for a specific operator
 * @param operatorId The operator ID
 * @returns Power stability data
 */

type StabilityMetricType = "saidi" | "saifi";

/**
 * Creates a fetcher function for SAIDI or SAIFI metrics
 * @param metricType The type of stability metric ('saidi' or 'saifi')
 * @returns A function that fetches the specified stability metric data
 */
const createStabilityMetricFetcher = (metricType: StabilityMetricType) => {
  return async (
    db: SunshineDataService,
    {
      operatorId,
      period,
      operatorOnly,
    }: {
      operatorId: number;
      period: number;
      operatorOnly?: boolean;
    }
  ): Promise<StabilityData> => {
    const operatorData = await db.getOperatorData(operatorId, period);

    // Get yearly peer group median stability data
    const yearlyPeerGroupMedianStability =
      await db.getYearlyIndicatorMedians<"stability">({
        peerGroup: operatorData.peer_group,
        metric: "stability",
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
      operatorId: operatorOnly ? operatorId : undefined,
    });

    const totalKey = `${metricType}_total` as const;
    const unplannedKey = `${metricType}_unplanned` as const;
    const medianTotalKey = `median_${metricType}_total` as const;
    const medianUnplannedKey = `median_${metricType}_unplanned` as const;

    // Map peer group stability data to yearly format
    const peerGroupYearlyDataFormatted = peerGroupYearlyStability
      .map((x) => ({
        year: x.period,
        total: x[totalKey] ?? null,
        operator_id: x.operator_id,
        operator_name: x.operator_name ?? "",
        unplanned: x[unplannedKey] ?? null,
      }))
      .filter((x) => x.total !== null);

    // Map peer group medians to yearly format
    const peerGroupMedianAsYearlyData = yearlyPeerGroupMedianStability.map(
      (item) => ({
        year: item.period,
        total: item[medianTotalKey],
        unplanned: item[medianUnplannedKey],
        operator_id: peerGroupOperatorId,
        operator_name: peerGroupOperatorName,
      })
    );

    // Combine all yearly data
    const combinedYearlyData = [
      ...peerGroupYearlyDataFormatted,
      ...peerGroupMedianAsYearlyData,
    ];

    return {
      operatorTotal: operatorStability?.[0]?.[totalKey] || 0,
      operatorUnplanned: operatorStability?.[0]?.[unplannedKey] || 0,
      yearlyData: combinedYearlyData,
    };
  };
};

/**
 * Fetch SAIDI (System Average Interruption Duration Index) data for a specific operator
 */
export const fetchSaidi = createStabilityMetricFetcher("saidi");

/**
 * Fetch SAIFI (System Average Interruption Frequency Index) data for a specific operator
 */
export const fetchSaifi = createStabilityMetricFetcher("saifi");

export const fetchPowerStability = async (
  db: SunshineDataService,
  {
    operatorId: operatorId_,
    operatorOnly,
  }: {
    operatorId: string; // Operator ID as a string
    operatorOnly?: boolean;
  }
): Promise<SunshinePowerStabilityData> => {
  const operatorId = parseInt(operatorId_, 10);

  const latestYear = await db.getLatestYearPowerStability(operatorId);
  const operatorData = await db.getOperatorData(
    operatorId,
    parseInt(latestYear, 10)
  );
  const targetYear = parseInt(latestYear, 10);

  const [saidiData, saifiData, updateDate] = await Promise.all([
    fetchSaidi(db, {
      operatorId: operatorId,
      period: targetYear,
      operatorOnly,
    }),
    fetchSaifi(db, {
      operatorId: operatorId,
      period: targetYear,
      operatorOnly,
    }),
    db.fetchUpdateDate(),
  ]);

  return {
    latestYear,
    operator: {
      peerGroup: {
        id: operatorData.peer_group,
        settlementDensity: operatorData.settlement_density,
        energyDensity: operatorData.energy_density,
      },
    },
    saidi: saidiData,
    saifi: saifiData,
    updateDate,
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
    period: periodParam,
  }: {
    operatorId: string;
    period?: number;
  }
): Promise<SunshineOperationalStandardsData> => {
  const operatorId = parseInt(operatorId_, 10);

  // Use provided period or get the latest year
  let period: number;
  if (periodParam !== undefined) {
    period = periodParam;
  } else {
    period = await db.getLatestYearSunshine(operatorId);
  }
  const operatorData = await db.getOperatorData(operatorId, period);
  const [operationalData, updateDate] = await Promise.all([
    db.getOperationalStandards({
      operatorId: operatorId,
      period: period,
    }),
    db.fetchUpdateDate(),
  ]);

  const data = operationalData[0] || {
    frankenRegel: 0,
    infoJaNein: "Nein",
    infoTageImVoraus: 0,
    rechtzeitig: 0,
    produkteAnzahl: 0,
    produkteAuswahl: "Nein",
  };

  const informingCustomersOfOutage = data.info_yes_no;
  const timelyPaperSubmission = data.timely;

  return {
    latestYear: `${period}`,
    operator: {
      peerGroup: {
        id: operatorData.peer_group,
        settlementDensity: operatorData.settlement_density,
        energyDensity: operatorData.energy_density,
      },
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
      francsRule: Number.isFinite(data.franc_rule)
        ? `CHF ${data.franc_rule.toFixed(2)}`
        : "N/A",
      timelyPaperSubmission,
      operatorsFrancsPerInvoice: [
        {
          operatorId: `${operatorId}`, // TODO
          francsPerInvoice: data.franc_rule || 0,
          year: `${period}`,
        },
      ],
    },
    updateDate,
  };
};
