import {
  ElectricityCategory,
  TariffCategory,
  NetworkLevel,
} from "src/domain/data";
import { query } from "src/lib/db/duckdb";
import { PeerGroupMedianValuesParams } from "src/lib/db/sunshine-data";

export const getNetworkCosts = async ({
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

export const getOperationalStandards = async ({
  operatorId,
  period,
}: {
  operatorId: number;
  period?: number;
}): Promise<OperationalStandardRecord[]> => {
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
export const getStabilityMetrics = async ({
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

  console.log(sql);
  const result = await query<StabilityMetricRecord>(sql);
  console.log(result);
  return result;
};
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
        rate
      FROM tariffs
      WHERE ${operatorFilter} ${periodFilter} ${categoryFilter} ${tariffTypeFilter} ${settlementDensityFilter} ${energyDensityFilter}
      ORDER BY period DESC, operator_id, category, tariff_type
    `;

  const result = await query<TariffRecord>(sql);
  return result;
};
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
export const getLatestYearSunshine = async (operatorId: number) => {
  const latestYearData = await query<{ year: string }>(`
      SELECT MAX(period) as year FROM sunshine_all WHERE partner_id = ${operatorId}
    `);
  return parseInt(latestYearData[0]?.year || "2024", 10);
};
export const getLatestYearPowerStability = async (
  operatorId: number
): Promise<string> => {
  const latestYearData = await query<{ year: string }>(`
    SELECT MAX(period) as year FROM sunshine_all
    WHERE partner_id = ${operatorId}
    AND (saidi_total IS NOT NULL OR saidi_unplanned IS NOT NULL OR saifi_total IS NOT NULL OR saifi_unplanned IS NOT NULL)
  `);
  return latestYearData[0]?.year || "2024";
};

export const getPeerGroup = async (
  operatorId: number | string
): Promise<{
  settlementDensity: string;
  energyDensity: string;
}> => {
  const peerGroupData = await query<{
    settlement_density: string;
    energy_density: string;
  }>(`
    SELECT operator_id, settlement_density, energy_density
    FROM operator_data
    WHERE operator_id = ${operatorId}
  `);

  if (peerGroupData.length === 0) {
    throw new Error(`No peer group data found for operator ID: ${operatorId}`);
  }
  return {
    settlementDensity: peerGroupData[0].settlement_density,
    energyDensity: peerGroupData[0].energy_density,
  };
};

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

export type TariffRecord = {
  operator_id: number;
  operator_name: string;
  period: number;
  category: TariffCategory;
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
