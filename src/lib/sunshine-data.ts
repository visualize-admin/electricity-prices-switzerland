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
import {
  OperatorDataRecord,
  SunshineDataService,
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
    operatorData: operatorData_,
    networkLevel = "NE5",
    period,
    operatorOnly,
  }: {
    operatorId: number;
    operatorData?: OperatorDataRecord;
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
  const operatorData = operatorData_
    ? operatorData_
    : await db.getOperatorData(operatorId, targetPeriod);

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

type TariffType = "net-tariffs" | "energy-tariffs";

/**
 * Creates a fetcher function for tariffs data (net or energy)
 * @param tariffType The type of tariff ('net-tariffs' or 'energy-tariffs')
 * @returns A function that fetches the specified tariff data
 */
const createTariffsFetcher = <T extends TariffType>(tariffType: T) => {
  const dbTariffType = tariffType === "net-tariffs" ? "network" : "energy";

  return async (
    db: SunshineDataService,
    {
      operatorId,
      operatorData: operatorData_,
      category,
      period,
      operatorOnly,
    }: {
      operatorId: number;
      operatorData?: OperatorDataRecord;
      category: ElectricityCategory;
      period: number;
      operatorOnly?: boolean;
    }
  ): Promise<TariffsData> => {
    const operatorData = operatorData_
      ? operatorData_
      : await db.getOperatorData(operatorId, period);

    const yearlyPeerGroupMedianTariffs = await db.getYearlyIndicatorMedians<T>({
      peerGroup: operatorData.peer_group,
      metric: tariffType,
      category: category,
    });

    const {
      currentData: peerGroupMedianTariffs,
      previousData: previousPeerGroupMedianTariffs,
      previousYear,
    } = findCurrentAndPreviousPeriodData(yearlyPeerGroupMedianTariffs, period);

    const [operatorTariffs, previousOperatorTariffs, tariffs] =
      await Promise.all([
        db.getTariffs({
          category: category,
          operatorId,
          period: period,
          tariffType: dbTariffType,
        }),
        db.getTariffs({
          category: category,
          operatorId,
          period: previousYear,
          tariffType: dbTariffType,
        }),
        db.getTariffs({
          category: category,
          operatorId: operatorOnly ? operatorId : undefined,
          peerGroup: operatorData.peer_group,
          tariffType: dbTariffType,
        }),
      ]);

    if (operatorTariffs.length > 1) {
      throw new Error(
        `Cannot have multiple ${tariffType} records for one operator in one year`
      );
    }

    const operatorTariff = first(operatorTariffs);
    const previousOperatorTariff = first(previousOperatorTariffs);

    const peerGroupMedianAsYearlyData = yearlyPeerGroupMedianTariffs.map(
      (item) => ({
        period: item.period,
        rate: item.median_rate,
        operator_id: peerGroupOperatorId,
        operator_name: peerGroupOperatorName,
        category: item.category,
      })
    );

    const combinedYearlyData = [...tariffs, ...peerGroupMedianAsYearlyData];

    return {
      category: category,
      operatorRate: operatorTariff?.rate ?? null,
      operatorTrend: getTrend(
        previousOperatorTariff?.rate,
        operatorTariff?.rate
      ),
      peerGroupMedianRate: peerGroupMedianTariffs?.median_rate ?? null,
      peerGroupMedianTrend: getTrend(
        previousPeerGroupMedianTariffs?.median_rate,
        peerGroupMedianTariffs?.median_rate
      ),
      yearlyData: combinedYearlyData,
    };
  };
};

/**
 * Fetch net tariffs data for a specific operator
 */
export const fetchNetTariffsData = createTariffsFetcher("net-tariffs");

/**
 * Fetch energy tariffs data for a specific operator
 */
export const fetchEnergyTariffsData = createTariffsFetcher("energy-tariffs");

export const fetchOperatorCostsAndTariffsData = async (
  db: SunshineDataService,
  {
    operatorId: operatorId_,
    operatorData: operatorData_,
    networkLevel,
    category,
    period,
    operatorOnly,
  }: {
    operatorId: string;
    operatorData?: OperatorDataRecord;
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
  const operatorData = operatorData_
    ? operatorData_
    : await db.getOperatorData(operatorId, targetPeriod);

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
        operatorData,
        category,
        period: targetPeriod,
        operatorOnly,
      }),
      fetchEnergyTariffsData(db, {
        operatorId,
        operatorData,
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

      operatorData: _operatorData,
      period,
      operatorOnly,
    }: {
      operatorId: number;

      operatorData?: OperatorDataRecord;
      period: number;
      operatorOnly?: boolean;
    }
  ): Promise<StabilityData> => {
    const operatorData = _operatorData
      ? _operatorData
      : await db.getOperatorData(operatorId, period);

    const peerGroupYearlyStability = await db.getStabilityMetrics({
      peerGroup: operatorData.peer_group,
      operatorId: operatorOnly ? operatorId : undefined,
    });

    // Get yearly peer group median stability data
    const yearlyPeerGroupMedianStability =
      await db.getYearlyIndicatorMedians<"stability">({
        peerGroup: operatorData.peer_group,
        metric: "stability",
      });

    const {
      currentData: peerGroupMedianStability,
      previousData: previousPeerGroupMedianStability,
      previousYear,
    } = findCurrentAndPreviousPeriodData(
      yearlyPeerGroupMedianStability,
      period
    );

    const [operatorStability, previousOperatorStability] = await Promise.all([
      db.getStabilityMetrics({
        operatorId,
        period,
      }),
      db.getStabilityMetrics({
        operatorId,
        period: previousYear,
      }),
    ]);

    if (operatorStability.length > 1) {
      throw new Error(
        "Cannot have multiple stability records for one operator in one year"
      );
    }

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

    const peerGroupMedianTotal = peerGroupMedianStability
      ? peerGroupMedianStability[medianTotalKey]
      : 0;
    const peerGroupMedianUnplanned = peerGroupMedianStability
      ? peerGroupMedianStability[medianUnplannedKey]
      : 0;

    const operatorStabilityRecord = operatorStability?.[0];
    const previousOperatorStabilityRecord = previousOperatorStability?.[0];

    return {
      operatorTotal: operatorStabilityRecord?.[totalKey] || 0,
      operatorUnplanned: operatorStabilityRecord?.[unplannedKey] || 0,
      trendTotal: getTrend(
        previousOperatorStabilityRecord?.[totalKey],
        operatorStabilityRecord?.[totalKey]
      ),
      trendUnplanned: getTrend(
        previousOperatorStabilityRecord?.[unplannedKey],
        operatorStabilityRecord?.[unplannedKey]
      ),

      peerGroupMedianTotal: peerGroupMedianTotal,
      peerGroupMedianUnplanned: peerGroupMedianUnplanned,

      peerGroupMedianTrendTotal: getTrend(
        previousPeerGroupMedianStability
          ? previousPeerGroupMedianStability[medianTotalKey]
          : null,
        peerGroupMedianTotal
      ),
      peerGroupMedianTrendUnplanned: getTrend(
        previousPeerGroupMedianStability
          ? previousPeerGroupMedianStability[medianUnplannedKey]
          : null,
        peerGroupMedianUnplanned
      ),

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
    operatorData: operatorData_,
    operatorOnly,
    period,
  }: {
    operatorId: string; // Operator ID as a string
    operatorData?: OperatorDataRecord;
    operatorOnly?: boolean;
    period?: number;
  }
): Promise<SunshinePowerStabilityData> => {
  const operatorId = parseInt(operatorId_, 10);

  // Get the latest year if period not provided
  let targetPeriod = period;
  if (!targetPeriod) {
    targetPeriod = await db.getLatestYearSunshine(operatorId);
  }
  const operatorData = operatorData_
    ? operatorData_
    : await db.getOperatorData(operatorId, targetPeriod);

  const [saidiData, saifiData, updateDate] = await Promise.all([
    fetchSaidi(db, {
      operatorId: operatorId,
      operatorData,
      period: targetPeriod,
      operatorOnly,
    }),
    fetchSaifi(db, {
      operatorId: operatorId,
      operatorData,
      period: targetPeriod,
      operatorOnly,
    }),
    db.fetchUpdateDate(),
  ]);

  return {
    latestYear: `${targetPeriod}`,
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
    operatorData: operatorData_,
    period: periodParam,
  }: {
    operatorId: string;
    operatorData?: OperatorDataRecord;
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

  const operatorData = operatorData_
    ? operatorData_
    : await db.getOperatorData(operatorId, period);
  const [operationalData, peerGroupOperationalData, updateDate] =
    await Promise.all([
      db.getOperationalStandards({
        operatorId: operatorId,
        operatorData,
        period: period,
      }),
      db.getOperationalStandards({
        peerGroup: operatorData.peer_group,
        operatorData,
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

  const operatorsNotificationPeriodDays = peerGroupOperationalData.map(
    (op) => ({
      operatorId: `${op.operator_id}`,
      days: op.info_days_in_advance || 0,
      year: `${op.period}`,
    })
  );

  const operatorsFrancsPerInvoice = peerGroupOperationalData.map((op) => ({
    operatorId: `${op.operator_id}`,
    francsPerInvoice: op.franc_rule || 0,
    year: `${op.period}`,
  }));

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
      operatorsNotificationPeriodDays,
    },
    compliance: {
      francsRule: Number.isFinite(data.franc_rule)
        ? `CHF ${data.franc_rule.toFixed(2)}`
        : "N/A",
      timelyPaperSubmission,
      operatorsFrancsPerInvoice,
    },
    updateDate,
  };
};
