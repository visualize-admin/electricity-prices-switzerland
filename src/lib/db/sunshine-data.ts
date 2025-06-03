import {
  ElectricityCategory,
  NetworkLevel,
  SunshineCostsAndTariffsData,
  SunshineOperationalStandardsData,
  SunshinePowerStabilityData,
} from "src/domain/data";

import { query, setupDatabase, setupDatabaseConnection } from "./duckdb";

// Database initialization will be handled asynchronously on first query
let databaseInitialized = false;

/**
 * Ensure database is initialized before running queries
 */
export const ensureDatabaseInitialized = async (): Promise<void> => {
  if (!databaseInitialized) {
    console.log("Initializing DuckDB database...");
    await setupDatabase();
    console.log("Setup databse connection.");
    await setupDatabaseConnection();
    databaseInitialized = true;
  }
};

type NetworkCostRecord = {
  operator_id: number;
  operator_name: string;
  year: number;
  network_level: NetworkLevel["id"];
  rate: number;
  settlement_density: string;
  energy_density: string;
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
  settlement_density: string;
  energy_density: string;
};

type TariffRecord = {
  operator_id: number;
  operator_name: string;
  period: number;
  category: ElectricityCategory;
  tariff_type: string;
  rate: number;
  settlement_density: string;
  energy_density: string;
};

type OperatorDataRecord = {
  operator_id: number;
  operator_uid: string;
  operator_name: string;
  period: number;
  settlement_density: string;
  energy_density: string;
};

type OperatorPeerGroupRecord = {
  operator_id: number;
  operator_name: string;
  settlement_density: string;
  energy_density: string;
  period: number;
};

type OperatorBasicRecord = {
  operator_id: number;
  operator_name: string;
  period: number;
  settlement_density: string;
  energy_density: string;
};

export const getNetworkCosts = async ({
  operatorId,
  period,
  settlementDensity,
  energyDensity,
}: {
  operatorId?: number;
  period?: number;
  settlementDensity?: string;
  energyDensity?: string;
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
  const sql = `
      SELECT
        operator_id,
        operator_name,
        period as year, -- TODO
        network_level,
        cost as rate, -- TODO
        settlement_density,
        energy_density
      FROM network_costs
      WHERE ${operatorFilter} ${periodFilter} ${settlementDensityFilter} ${energyDensityFilter}
      ORDER BY period DESC, operator_id, network_level
    `;

  const result = await query<NetworkCostRecord>(sql);
  return result;
};

// For operational standards
export const getOperationalStandards = async (
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
export const getStabilityMetrics = async (
  operatorId: number,
  period?: number
): Promise<StabilityMetricRecord[]> => {
  const periodFilter = period ? `AND period = ${period}` : "";

  const sql = `
      SELECT
        operator_id,
        operator_name,
        period,
        saidi_total,
        saidi_unplanned,
        saifi_total,
        saifi_unplanned,
        settlement_density,
        energy_density
      FROM stability_metrics
      WHERE operator_id = ${operatorId} ${periodFilter}
      ORDER BY period DESC, operator_id
    `;

  const result = await query<StabilityMetricRecord>(sql);
  return result;
};

// For tariffs data
export const getTariffs = async ({
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
        rate,
        settlement_density,
        energy_density
      FROM tariffs
      WHERE ${operatorFilter} ${periodFilter} ${categoryFilter} ${tariffTypeFilter} ${settlementDensityFilter} ${energyDensityFilter}
      ORDER BY period DESC, operator_id, category, tariff_type
    `;

  const result = await query<TariffRecord>(sql);
  return result;
};

// For operator basic data
export const getOperatorData = async (
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

// Get list of operators with their latest peer group
export const getOperatorsWithPeerGroup = async (): Promise<
  OperatorPeerGroupRecord[]
> => {
  const sql = `
      WITH latest_periods AS (
        SELECT 
          operator_id, 
          MAX(period) as latest_period
        FROM operator_data
        GROUP BY operator_id
      )
      SELECT
        od.operator_id,
        od.operator_name,
        od.settlement_density,
        od.energy_density,
        od.period
      FROM operator_data od
      INNER JOIN latest_periods lp 
        ON od.operator_id = lp.operator_id 
        AND od.period = lp.latest_period
      ORDER BY od.operator_name
    `;

  const result = await query<OperatorPeerGroupRecord>(sql);
  return result;
};

// Get operators in the same peer group
export const getOperatorsInSamePeerGroup = async (
  settlementDensity: string,
  energyDensity: string,
  period?: number
): Promise<OperatorBasicRecord[]> => {
  const periodFilter = period ? `AND period = ${period}` : "";

  const sql = `
      SELECT DISTINCT
        operator_id,
        operator_name,
        period
      FROM operator_data
      WHERE 
        settlement_density = '${settlementDensity}'
        AND energy_density = '${energyDensity}'
        ${periodFilter}
      ORDER BY operator_name
    `;

  return query<OperatorBasicRecord>(sql);
};

// Get median values for peer group
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
  category: ElectricityCategory; // Required for tariffs
};

type EnergyTariffsParams = {
  metric: "energy-tariffs";
  settlementDensity: string;
  energyDensity: string;
  period?: number;
  category: ElectricityCategory; // Required for tariffs
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

export const getPeerGroupMedianValues = async <
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

/**
 * Fetch costs and tariffs data for a specific operator
 * @param operatorId The operator ID
 * @returns Costs and tariffs data
 */
export const fetchOperatorCostsAndTariffsData = async (
  operatorId_: string
): Promise<SunshineCostsAndTariffsData> => {
  await ensureDatabaseInitialized();

  const networkLevel = { id: "NE5" } as NetworkLevel;
  const category = "NC2" as ElectricityCategory;

  const operatorId = parseInt(operatorId_, 10);
  const operatorData = await getOperatorData(operatorId);

  if (!operatorData) {
    throw new Error(`Peer group not found for operator ID: ${operatorId}`);
  }

  // Get the latest year data for the operator
  const latestYearData = await query<{ year: string }>(`
    SELECT MAX(period) as year FROM sunshine_all WHERE partner_id = ${operatorId}
  `);

  const latestYear = parseInt(latestYearData[0]?.year || "2024", 10);

  const peerGroupMedianNetworkCosts =
    await getPeerGroupMedianValues<"network_costs">({
      settlementDensity: operatorData.settlement_density,
      energyDensity: operatorData.energy_density,
      metric: "network_costs",
      networkLevel: networkLevel.id,
    });

  const peerGroupMedianEnergyTariffs =
    await getPeerGroupMedianValues<"energy-tariffs">({
      settlementDensity: operatorData.settlement_density,
      energyDensity: operatorData.energy_density,
      metric: "energy-tariffs",
      category: category,
    });

  const peerGroupMedianNetTariffs =
    await getPeerGroupMedianValues<"net-tariffs">({
      settlementDensity: operatorData.settlement_density,
      energyDensity: operatorData.energy_density,
      metric: "net-tariffs",
      category: category,
    });

  const networkCosts = await getNetworkCosts({
    period: latestYear,
    settlementDensity: operatorData.settlement_density,
    energyDensity: operatorData.energy_density,
  });

  const netTariffs = await getTariffs({
    period: latestYear,
    settlementDensity: operatorData.settlement_density,
    energyDensity: operatorData.energy_density,
    tariffType: "network",
  });

  const energyTariffs = await getTariffs({
    period: latestYear,
    settlementDensity: operatorData.settlement_density,
    energyDensity: operatorData.energy_density,
  });

  // Based on network level
  const operatorNetworkCost = networkCosts.find(
    (cost) =>
      cost.network_level === networkLevel.id && cost.operator_id === operatorId
  );

  // Based on category
  const operatorNetTariff = netTariffs.find(
    (tariff) =>
      tariff.category === category && tariff.operator_id === operatorId
  );

  const operatorEnergyTariff = energyTariffs.find(
    (tariff) =>
      tariff.category === category && tariff.operator_id === operatorId
  );

  // Create response object
  return {
    latestYear: `${latestYear}`,
    operator: {
      peerGroup: {
        settlementDensity: operatorData.settlement_density,
        energyDensity: operatorData.energy_density,
      },
    },
    networkCosts: {
      networkLevel: {
        id: networkLevel.id,
      },
      operatorRate: operatorNetworkCost?.rate,
      peerGroupMedianRate: peerGroupMedianNetworkCosts?.median_value,
      yearlyData: networkCosts,
    },
    netTariffs: {
      category: category,
      operatorRate: operatorNetTariff?.rate,
      peerGroupMedianRate: peerGroupMedianNetTariffs?.median_rate,
      yearlyData: netTariffs,
    },
    energyTariffs: {
      category: category,
      operatorRate: operatorEnergyTariff?.rate,
      peerGroupMedianRate: peerGroupMedianEnergyTariffs?.median_rate,
      yearlyData: energyTariffs,
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

/**
 * Fetch power stability data for a specific operator
 * @param operatorId The operator ID
 * @returns Power stability data
 */
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
  const latestYearData = await query<{ year: string }>(`
    SELECT MAX(period) as year FROM sunshine_all WHERE partner_id = ${operatorId}
  `);

  const latestYear = latestYearData[0]?.year || "2024";

  // Get SAIDI data
  const saidiData = await query<{ total: number; unplanned: number }>(`
    SELECT 
      saidi_total as total,
      saidi_unplanned as unplanned
    FROM sunshine_all
    WHERE partner_id = ${operatorId} AND period = '${latestYear}'
  `);

  const saidiValues = saidiData[0] || { total: 0, unplanned: 0 };

  // Get SAIFI data
  const saifiData = await query<{ total: number; unplanned: number }>(`
    SELECT 
      saifi_total as total,
      saifi_unplanned as unplanned
    FROM sunshine_all
    WHERE partner_id = ${operatorId} AND period = '${latestYear}'
  `);

  const saifiValues = saifiData[0] || { total: 0, unplanned: 0 };

  // Get peer group median SAIDI
  const peerGroupMedianSaidi = await query<{ median: number }>(`
    SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY saidi_total) as median
    FROM sunshine_all
    WHERE period = '${latestYear}'
    AND partner_id IN (
      SELECT network_operator_id 
      FROM peer_groups 
      WHERE settlement_density = '${operatorData.settlement_density}' 
      AND energy_density = '${operatorData.energy_density}'
    )
  `);

  // Get peer group median SAIFI
  const peerGroupMedianSaifi = await query<{ median: number }>(`
    SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY saifi_total) as median
    FROM sunshine_all
    WHERE period = '${latestYear}'
    AND partner_id IN (
      SELECT network_operator_id 
      FROM peer_groups 
      WHERE settlement_density = '${operatorData.settlement_density}' 
      AND energy_density = '${operatorData.energy_density}'
    )
  `);

  // Get historical SAIDI data - planned and unplanned
  const saidiYearlyData = await query<{
    year: number;
    minutes: number;
    operator: number;
    planned: boolean;
  }>(`
    SELECT
      period as year,
      saidi_total as minutes,
      saidi_total as operator,
      true as planned
    FROM sunshine_all
    WHERE partner_id = ${operatorId}
    UNION ALL
    SELECT
      period as year,
      saidi_unplanned as minutes,
      saidi_unplanned as operator,
      false as planned
    FROM sunshine_all
    WHERE partner_id = ${operatorId}
    ORDER BY year DESC, planned
  `);

  // Get historical SAIFI data - planned and unplanned
  const saifiYearlyData = await query<{
    year: number;
    minutes: number;
    operator: number;
    planned: boolean;
  }>(`
    SELECT
      period as year,
      saifi_total as minutes,
      saifi_total as operator,
      true as planned
    FROM sunshine_all
    WHERE partner_id = ${operatorId}
    UNION ALL
    SELECT
      period as year,
      saifi_unplanned as minutes,
      saifi_unplanned as operator,
      false as planned
    FROM sunshine_all
    WHERE partner_id = ${operatorId}
    ORDER BY year DESC, planned
  `);

  return {
    latestYear,
    operator: {
      peerGroup: {
        settlementDensity: operatorData.settlement_density,
        energyDensity: operatorData.energy_density,
      },
    },
    saidi: {
      operatorMinutes: saidiValues.total,
      peerGroupMinutes: peerGroupMedianSaidi[0]?.median || 0,
      yearlyData: saidiYearlyData,
    },
    saifi: {
      operatorMinutes: saifiValues.total,
      peerGroupMinutes: peerGroupMedianSaifi[0]?.median || 0,
      yearlyData: saifiYearlyData,
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
  const latestYearData = await query<{ year: string }>(`
    SELECT MAX(period) as year FROM sunshine_all WHERE partner_id = ${operatorId}
  `);

  const latestYear = latestYearData[0]?.year || "2024";

  // Get operational standards data
  const operationalData = await query<OperationalStandardRecord>(`
    SELECT 
      franc_rule,
      info_yes_no,
      info_days_in_advance,
      timely
    FROM sunshine_all
    WHERE partner_id = ${operatorId} AND period = '${latestYear}'
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
    latestYear,
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
          year: latestYear,
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
          year: latestYear,
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
          year: latestYear,
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
