import {
  ElectricityCategory,
  NetworkCategory,
  NetworkLevel,
  SunshineCostsAndTariffsData,
  SunshineOperationalStandardsData,
  SunshinePowerStabilityData,
} from "src/domain/data";

import { ensureDatabaseInitialized, query } from "./duckdb";

type NetworkCostRecord = {
  operator_id: number;
  operator_name: string;
  year: number;
  network_level: NetworkLevel["id"];
  rate: number;
};

type OperationalStandardRecord = {
  operator_id: number;
  operator_name: string;
  period: number;
  franc_rule: number;
  info_yes_no: string;
  info_days_in_advance: number;
  timely: number;
  settlement_density: string;
  energy_density: string;
};
type StabilityMetricRecord = {
  operator_id: number;
  operator_name: string;
  period: number;
  saidi_total: number;
  saidi_unplanned: number;
  saifi_total: number;
  saifi_unplanned: number;
};

type TariffRecord = {
  operator_id: number;
  operator_name: string;
  period: number;
  category: NetworkCategory;
  tariff_type: string;
  rate: number;
};

type OperatorDataRecord = {
  operator_id: number;
  operator_uid: string;
  operator_name: string;
  period: number;
  settlement_density: string;
  energy_density: string;
};

const getNetworkCosts = async ({
  operatorId,
  period,
  settlementDensity,
  energyDensity,
  networkLevel,
}: {
  operatorId?: number;
  period?: number;
  settlementDensity?: string;
  energyDensity?: string;
  networkLevel?: NetworkLevel["id"];
} = {}): Promise<NetworkCostRecord[]> => {
  const operatorFilter = operatorId ? `operator_id = ${operatorId}` : "1=1"; // Default to all operators
  // Instead of querying sunshine_all with filters
  const periodFilter = period ? `AND period = ${period}` : "";
  const settlementDensityFilter = settlementDensity
    ? `AND settlement_density = '${settlementDensity}'`
    : "";
  const energyDensityFilter = energyDensity
    ? `AND energy_density = '${energyDensity}'`
    : "";
  const networkLevelFilter = networkLevel
    ? `AND network_level = '${networkLevel}'`
    : "";
  const sql = `
      SELECT
        operator_id,
        operator_name,
        period as year, -- TODO
        network_level,
        cost as rate, -- TODO
      FROM network_costs
      WHERE ${operatorFilter} ${periodFilter} ${settlementDensityFilter} ${energyDensityFilter} ${networkLevelFilter}
      ORDER BY period DESC, operator_id, network_level
    `;

  const result = await query<NetworkCostRecord>(sql);
  return result;
};

// For operational standards, will be used in the future
/** @knipignore */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getOperationalStandards = async (
  operatorId: number,
  period?: number
): Promise<OperationalStandardRecord[]> => {
  const periodFilter = period ? `AND period = ${period}` : "";

  const sql = `
      SELECT
        operator_id,
        operator_name,
        period,
        franc_rule,
        info_yes_no,
        info_days_in_advance,
        timely,
        settlement_density,
        energy_density
      FROM operational_standards
      WHERE operator_id = ${operatorId} ${periodFilter}
      ORDER BY period DESC, operator_id
    `;

  const result = await query<OperationalStandardRecord>(sql);
  return result;
};

// For stability metrics
const getStabilityMetrics = async ({
  operatorId,
  period,
  settlement_density,
  energy_density,
}: {
  operatorId?: number;
  period?: number;
  settlement_density?: string;
  energy_density?: string;
}): Promise<StabilityMetricRecord[]> => {
  const operatorFilter = operatorId ? `operator_id = ${operatorId}` : "1=1"; // Default to all operators
  const periodFilter = period ? `AND period = ${period}` : "";
  const settlementDensityFilter = settlement_density
    ? `AND settlement_density = '${settlement_density}'`
    : "";
  const energyDensityFilter = energy_density
    ? `AND energy_density = '${energy_density}'`
    : "";

  const sql = `
      SELECT
        operator_id,
        operator_name,
        period,
        saidi_total,
        saidi_unplanned,
        saifi_total,
        saifi_unplanned
      FROM stability_metrics
      WHERE ${operatorFilter} ${periodFilter} ${settlementDensityFilter} ${energyDensityFilter} 
      ORDER BY period DESC, operator_id
    `;

  const result = await query<StabilityMetricRecord>(sql);
  return result;
};

const getTariffs = async ({
  operatorId,
  period,
  category,
  tariffType,
  settlementDensity,
  energyDensity,
}: {
  operatorId?: number;
  period?: number;
  category?: string;
  tariffType?: "network" | "energy";
  settlementDensity?: string;
  energyDensity?: string;
} = {}): Promise<TariffRecord[]> => {
  const operatorFilter = operatorId ? `operator_id = ${operatorId}` : "1=1"; // Default to all operators
  const periodFilter = period ? `AND period = ${period}` : "";
  const categoryFilter = category ? `AND category = '${category}'` : "";
  const settlementDensityFilter = settlementDensity
    ? `AND settlement_density = '${settlementDensity}'`
    : "";
  const energyDensityFilter = energyDensity
    ? `AND energy_density = '${energyDensity}'`
    : "";
  const tariffTypeFilter = tariffType
    ? `AND tariff_type = '${tariffType}'`
    : "";

  const sql = `
      SELECT
        CAST(operator_id AS INTEGER) AS operator_id,
        operator_name,
        period,
        category,
        tariff_type,
        rate
      FROM tariffs
      WHERE ${operatorFilter} ${periodFilter} ${categoryFilter} ${tariffTypeFilter} ${settlementDensityFilter} ${energyDensityFilter}
      ORDER BY period DESC, operator_id, category, tariff_type
    `;

  const result = await query<TariffRecord>(sql);
  return result;
};

const getOperatorData = async (
  operatorId: number,
  period?: number
): Promise<OperatorDataRecord> => {
  const periodFilter = period ? `AND period = ${period}` : "";

  const sql = `
      SELECT
        operator_id,
        operator_uid,
        operator_name,
        period,
        settlement_density,
        energy_density
      FROM operator_data
      WHERE operator_id = ${operatorId} ${periodFilter}
      ORDER BY period DESC
    `;

  const result = await query<OperatorDataRecord>(sql);
  if (result.length === 0) {
    throw new Error(`No data found for operator ID: ${operatorId}`);
  }
  return result[0];
};

type NetworkCostsParams = {
  metric: "network_costs";
  settlementDensity: string;
  energyDensity: string;
  period?: number;
  networkLevel: NetworkLevel["id"]; // Required for network_costs
};

type StabilityParams = {
  metric: "stability";
  settlementDensity: string;
  energyDensity: string;
  period?: number;
};

type OperationalParams = {
  metric: "operational";
  settlementDensity: string;
  energyDensity: string;
  period?: number;
};

type NetTariffsParams = {
  metric: "net-tariffs";
  settlementDensity: string;
  energyDensity: string;
  period?: number;
  category: NetworkCategory; // Required for tariffs
};

type EnergyTariffsParams = {
  metric: "energy-tariffs";
  settlementDensity: string;
  energyDensity: string;
  period?: number;
  category: NetworkCategory; // Required for tariffs
};

type PeerGroupMedianValuesParams =
  | NetworkCostsParams
  | StabilityParams
  | OperationalParams
  | NetTariffsParams
  | EnergyTariffsParams;

type PeerGroupRecord<Metric extends PeerGroupMedianValuesParams["metric"]> =
  Metric extends "network_costs"
    ? {
        network_level: NetworkLevel["id"];
        median_value: number;
      }
    : Metric extends "stability"
    ? {
        median_saidi_total: number;
        median_saidi_unplanned: number;
        median_saifi_total: number;
        median_saifi_unplanned: number;
      }
    : Metric extends "operational"
    ? {
        median_franc_rule: number;
        median_info_days: number;
        median_timely: number;
      }
    : Metric extends "energy-tariffs"
    ? {
        category: ElectricityCategory;
        tariff_type: string;
        median_rate: number;
      }
    : Metric extends "net-tariffs"
    ? {
        category: ElectricityCategory;
        tariff_type: string;
        median_rate: number;
      }
    : never;

const getPeerGroupMedianValues = async <
  Metric extends PeerGroupMedianValuesParams["metric"]
>(
  params: PeerGroupMedianValuesParams
) => {
  const { settlementDensity, energyDensity, metric, period } = params;

  const peerGroupFilter = `
    settlement_density = '${settlementDensity}'
    AND energy_density = '${energyDensity}'
  `;
  const periodFilter = period ? `AND period = ${period}` : "";
  let sql = "";

  switch (metric) {
    case "network_costs": {
      const { networkLevel } = params;
      sql = `
        SELECT
          network_level,
          MEDIAN(cost) as median_value
        FROM network_costs
        WHERE 
          ${peerGroupFilter}
          ${periodFilter}
          AND network_level = '${networkLevel}'
        GROUP BY network_level
        ORDER BY network_level
      `;
      break;
    }

    case "stability":
      sql = `
        SELECT
          MEDIAN(saidi_total) as median_saidi_total,
          MEDIAN(saidi_unplanned) as median_saidi_unplanned,
          MEDIAN(saifi_total) as median_saifi_total,
          MEDIAN(saifi_unplanned) as median_saifi_unplanned
        FROM stability_metrics
        WHERE 
          ${peerGroupFilter}
          ${periodFilter}
      `;
      break;

    case "operational":
      sql = `
        SELECT
          MEDIAN(franc_rule) as median_franc_rule,
          MEDIAN(info_days_in_advance) as median_info_days,
          MEDIAN(timely) as median_timely
        FROM operational_standards
        WHERE 
          ${peerGroupFilter}
          ${periodFilter}
      `;
      break;

    case "energy-tariffs": {
      const { category } = params;
      sql = `
        SELECT
          category,
          tariff_type,
          MEDIAN(rate) as median_rate
        FROM tariffs
        WHERE 
          ${peerGroupFilter}
          ${periodFilter}
          AND category = '${category}'
          AND tariff_type = 'energy'
        GROUP BY category, tariff_type
        ORDER BY category, tariff_type
      `;
      break;
    }

    case "net-tariffs": {
      const { category } = params;
      sql = `
        SELECT
          category,
          tariff_type,
          MEDIAN(rate) as median_rate
        FROM tariffs
        WHERE 
          ${peerGroupFilter}
          ${periodFilter}
          AND category = '${category}'
          AND tariff_type = 'network'
        GROUP BY category, tariff_type
        ORDER BY category, tariff_type
      `;
      break;
    }
  }

  if (!sql) {
    throw new Error(`Unknown metric: ${metric}`);
  }

  const result = await query<PeerGroupRecord<Metric> | undefined>(sql);
  return result[0];
};

const getLatestYearSunshine = async (operatorId: number) => {
  const latestYearData = await query<{ year: string }>(`
      SELECT MAX(period) as year FROM sunshine_all WHERE partner_id = ${operatorId}
    `);
  return parseInt(latestYearData[0]?.year || "2024", 10);
};

const getLatestYearPowerStability = async (
  operatorId: number
): Promise<string> => {
  const latestYearData = await query<{ year: string }>(`
    SELECT MAX(period) as year FROM sunshine_all
    WHERE partner_id = ${operatorId}
    AND (saidi_total IS NOT NULL OR saidi_unplanned IS NOT NULL OR saifi_total IS NOT NULL OR saifi_unplanned IS NOT NULL)
  `);
  return latestYearData[0]?.year || "2024";
};

/**
 * Fetch costs and tariffs data for a specific operator
 * @param operatorId The operator ID
 * @returns Costs and tariffs data
 */
export const fetchNetworkCostsData = async (
  operatorId: number,
  networkLevel: string = "NE5",
  period?: number
): Promise<{
  networkLevel: { id: string };
  operatorRate: number | null;
  peerGroupMedianRate: number | null;
  yearlyData: NetworkCostRecord[];
}> => {
  await ensureDatabaseInitialized();

  const operatorData = await getOperatorData(operatorId);
  if (!operatorData) {
    throw new Error(`Peer group not found for operator ID: ${operatorId}`);
  }

  // Get the latest year if period not provided
  let targetPeriod = period;
  if (!targetPeriod) {
    targetPeriod = await getLatestYearSunshine(operatorId);
  }

  const peerGroupMedianNetworkCosts =
    await getPeerGroupMedianValues<"network_costs">({
      settlementDensity: operatorData.settlement_density,
      energyDensity: operatorData.energy_density,
      metric: "network_costs",
      networkLevel: networkLevel,
    });

  const networkCosts = (
    await getNetworkCosts({
      period: targetPeriod,
      settlementDensity: operatorData.settlement_density,
      energyDensity: operatorData.energy_density,
      networkLevel: networkLevel,
    })
  )
    // TODO Should be done in the view
    .filter((x) => !Number.isNaN(x.rate) && Number.isFinite(x.rate));

  const operatorNetworkCost = networkCosts.find(
    (cost) =>
      cost.network_level === networkLevel && cost.operator_id === operatorId
  );

  return {
    networkLevel: { id: networkLevel },
    operatorRate: operatorNetworkCost?.rate ?? null,
    peerGroupMedianRate: peerGroupMedianNetworkCosts?.median_value ?? null,
    yearlyData: networkCosts,
  };
};

export const fetchNetTariffsData = async (
  operatorId: number,
  // TODO it seems NC2 is not an ElectricityCategory, but a NetworkCategory
  category: NetworkCategory = "NC2",
  period: number
): Promise<{
  category: NetworkCategory;
  operatorRate: number | null;
  peerGroupMedianRate: number | null;
  yearlyData: TariffRecord[];
}> => {
  await ensureDatabaseInitialized();

  const operatorData = await getOperatorData(operatorId);
  if (!operatorData) {
    throw new Error(`Peer group not found for operator ID: ${operatorId}`);
  }

  // Get the latest year if period not provided
  let targetPeriod = period;
  if (!targetPeriod) {
    targetPeriod = await getLatestYearSunshine(operatorId);
  }

  const peerGroupMedianNetTariffs =
    await getPeerGroupMedianValues<"net-tariffs">({
      settlementDensity: operatorData.settlement_density,
      energyDensity: operatorData.energy_density,
      metric: "net-tariffs",
      category: category,
    });

  const netTariffs = await getTariffs({
    period: targetPeriod,
    settlementDensity: operatorData.settlement_density,
    energyDensity: operatorData.energy_density,
    tariffType: "network",
    category: category,
  });

  const operatorNetTariff = netTariffs.find(
    (tariff) =>
      tariff.category === category && tariff.operator_id === operatorId
  );

  return {
    category: category,
    operatorRate: operatorNetTariff?.rate ?? null,
    peerGroupMedianRate: peerGroupMedianNetTariffs?.median_rate ?? null,
    yearlyData: netTariffs,
  };
};

export const fetchEnergyTariffsData = async (
  operatorId: number,
  category: NetworkCategory,
  period?: number
): Promise<{
  category: NetworkCategory;
  operatorRate: number | null;
  peerGroupMedianRate: number | null;
  yearlyData: TariffRecord[];
}> => {
  await ensureDatabaseInitialized();

  const operatorData = await getOperatorData(operatorId);
  if (!operatorData) {
    throw new Error(`Peer group not found for operator ID: ${operatorId}`);
  }

  // Get the latest year if period not provided
  let targetPeriod = period;
  if (!targetPeriod) {
    targetPeriod = await getLatestYearSunshine(operatorId);
  }

  const peerGroupMedianEnergyTariffs =
    await getPeerGroupMedianValues<"energy-tariffs">({
      settlementDensity: operatorData.settlement_density,
      energyDensity: operatorData.energy_density,
      metric: "energy-tariffs",
      category: category,
    });

  const energyTariffs = await getTariffs({
    period: targetPeriod,
    settlementDensity: operatorData.settlement_density,
    energyDensity: operatorData.energy_density,
    category: category,
  });

  const operatorEnergyTariff = energyTariffs.find(
    (tariff) =>
      tariff.category === category && tariff.operator_id === operatorId
  );

  return {
    category: category,
    operatorRate: operatorEnergyTariff?.rate ?? null,
    peerGroupMedianRate: peerGroupMedianEnergyTariffs?.median_rate ?? null,
    yearlyData: energyTariffs,
  };
};

export const fetchOperatorCostsAndTariffsData = async ({
  operatorId: operatorId_,
  networkLevel,
  category,
  period,
}: {
  operatorId: string;
  networkLevel: NetworkLevel["id"];
  category: NetworkCategory;
  period?: number;
}): Promise<SunshineCostsAndTariffsData> => {
  await ensureDatabaseInitialized();

  const operatorId = parseInt(operatorId_, 10);
  const operatorData = await getOperatorData(operatorId);

  if (!operatorData) {
    throw new Error(`Peer group not found for operator ID: ${operatorId}`);
  }

  // Get the latest year if period not provided
  let targetPeriod = period;
  if (!targetPeriod) {
    targetPeriod = await getLatestYearSunshine(operatorId);
  }

  const networkCostsData = await fetchNetworkCostsData(
    operatorId,
    networkLevel,
    targetPeriod
  );
  const netTariffsData = await fetchNetTariffsData(
    operatorId,
    category,
    targetPeriod
  );
  const energyTariffsData = await fetchEnergyTariffsData(
    operatorId,
    category,
    targetPeriod
  );

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
 * @param operatorId The operator ID
 * @param year Year parameter
 * @returns SAIDI data
 */
export const fetchSaidi = async (
  operatorId: number,
  year: number
): Promise<{
  operatorMinutes: number;
  peerGroupMinutes: number;
  yearlyData: {
    year: number;
    minutes: number;
    operator: number;
    operator_name: string;
    planned: boolean;
  }[];
}> => {
  await ensureDatabaseInitialized();

  const operatorData = await getOperatorData(operatorId);
  if (!operatorData) {
    throw new Error(`Peer group not found for operator ID: ${operatorId}`);
  }

  const targetYear = year;

  // Get peer group median SAIDI
  const peerGroupMedianStability = await getPeerGroupMedianValues<"stability">({
    settlementDensity: operatorData.settlement_density,
    energyDensity: operatorData.energy_density,
    metric: "stability",
    period: targetYear,
  });

  const operatorStability = await getStabilityMetrics({
    operatorId,
    period: targetYear,
  });
  if (operatorStability.length > 1) {
    throw new Error(
      "Cannot have multiple stability records for one operator in one year"
    );
  }
  const peerGroupYearlyStability = await getStabilityMetrics({
    settlement_density: operatorData.settlement_density,
    energy_density: operatorData.energy_density,
    period: targetYear,
  });

  return {
    operatorMinutes: operatorStability?.[0]?.saidi_total || 0,
    peerGroupMinutes: peerGroupMedianStability?.median_saidi_total || 0,
    yearlyData: peerGroupYearlyStability.map((x) => ({
      year: x.period,
      minutes: x.saidi_total,
      operator: x.operator_id,
      operator_name: x.operator_name,
      planned: x.saidi_unplanned === 0,
    })),
  };
};

/**
 * Fetch SAIFI (System Average Interruption Frequency Index) data for a specific operator
 * @param operatorId The operator ID
 * @param year Year parameter
 * @returns SAIFI data
 */
export const fetchSaifi = async (
  operatorId: number,
  year: number
): Promise<{
  operatorMinutes: number;
  peerGroupMinutes: number;
  yearlyData: {
    year: number;
    minutes: number;
    operator: number;
    operator_name: string;
    planned: boolean;
  }[];
}> => {
  await ensureDatabaseInitialized();

  const operatorData = await getOperatorData(operatorId);
  if (!operatorData) {
    throw new Error(`Peer group not found for operator ID: ${operatorId}`);
  }

  const targetYear = year;

  // Get peer group median SAIFI
  const peerGroupMedianStability = await getPeerGroupMedianValues<"stability">({
    settlementDensity: operatorData.settlement_density,
    energyDensity: operatorData.energy_density,
    metric: "stability",
    period: targetYear,
  });

  const operatorStability = await getStabilityMetrics({
    operatorId,
    period: targetYear,
  });
  if (operatorStability.length > 1) {
    throw new Error(
      "Cannot have multiple stability records for one operator in one year"
    );
  }
  const peerGroupYearlyStability = await getStabilityMetrics({
    settlement_density: operatorData.settlement_density,
    energy_density: operatorData.energy_density,
    period: targetYear,
  });

  return {
    operatorMinutes: operatorStability?.[0]?.saifi_total || 0,
    peerGroupMinutes: peerGroupMedianStability?.median_saifi_total || 0,
    yearlyData: peerGroupYearlyStability.map((x) => ({
      year: x.period,
      minutes: x.saifi_total,
      operator: x.operator_id,
      operator_name: x.operator_name,
      planned: x.saifi_unplanned === 0,
    })),
  };
};

export const fetchPowerStability = async (
  _operatorId: string
): Promise<SunshinePowerStabilityData> => {
  await ensureDatabaseInitialized();

  const operatorId = parseInt(_operatorId, 10);
  const operatorData = await getOperatorData(operatorId);

  if (!operatorData) {
    throw new Error(`Peer group not found for operator ID: ${operatorId}`);
  }

  // Get the latest year data for the operator
  const latestYear = await getLatestYearPowerStability(operatorId);

  const targetYear = parseInt(latestYear, 10);

  // Fetch SAIDI and SAIFI data using the new sub-functions
  const saidiData = await fetchSaidi(operatorId, targetYear);
  const saifiData = await fetchSaifi(operatorId, targetYear);

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
 * @param operatorId The operator ID
 * @returns Operational standards data
 */
export const fetchOperationalStandards = async (
  _operatorId: string
): Promise<SunshineOperationalStandardsData> => {
  await ensureDatabaseInitialized();

  const operatorId = parseInt(_operatorId, 10);
  const operatorData = await getOperatorData(operatorId);

  if (!operatorData) {
    throw new Error(`Peer group not found for operator ID: ${operatorId}`);
  }

  // Get the latest year data for the operator

  const period = await getLatestYearSunshine(operatorId);

  // Get operational standards data
  const operationalData = await query<OperationalStandardRecord>(`
    SELECT 
      franc_rule,
      info_yes_no,
      info_days_in_advance,
      timely
    FROM sunshine_all
    WHERE partner_id = ${operatorId} AND period = '${period}'
  `);

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
        // TODO
        settlementDensity: operatorData.settlement_density,
        energyDensity: operatorData.energy_density,
      },
    },
    productVariety: {
      ecoFriendlyProductsOffered: 0, // TODO
      productCombinationsOptions: false, // TODO,
      operatorsProductsOffered: [
        {
          operatorId: _operatorId, // TODO
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
          operatorId: _operatorId, // TODO
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
          operatorId: _operatorId, // TODO
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
