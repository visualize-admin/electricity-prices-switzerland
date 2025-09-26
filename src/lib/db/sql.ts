import { NetworkLevel, SunshineIndicator } from "src/domain/sunshine";
import {
  PeerGroup,
  PeerGroupItem,
  SunshineDataIndicatorRow,
  SunshineDataRow,
} from "src/graphql/resolver-types";
import { getFieldName } from "src/lib/db/common";
import { query } from "src/lib/db/duckdb";
import { PeerGroupNotFoundError } from "src/lib/db/errors";
import { peerGroupMapping } from "src/lib/db/sql-peer-groups-mapping";
import { IndicatorMedianParams } from "src/lib/sunshine-data";
import type {
  NetworkCostRecord,
  OperationalStandardRecord,
  OperatorDataRecord,
  PeerGroupRecord,
  StabilityMetricRecord,
  SunshineDataService,
  TariffRecord,
} from "src/lib/sunshine-data-service";

const getNetworkCosts = async ({
  operatorId,
  period,
  peerGroup,
  networkLevel,
}: {
  operatorId?: number;
  period?: number;
  peerGroup?: string;
  networkLevel?: NetworkLevel["id"];
} = {}): Promise<NetworkCostRecord[]> => {
  const operatorFilter = operatorId ? `operator_id = ${operatorId}` : "1=1"; // Default to all operators

  // Instead of querying sunshine_all with filters
  const periodFilter = period ? `AND period = ${period}` : "";

  let peerGroupFilter = ""; // Default to no filter (all data)
  if (peerGroup) {
    const { settlementDensity, energyDensity } =
      getSettlementAndEnergyDensity(peerGroup);
    peerGroupFilter = `
      AND settlement_density = '${settlementDensity}'
      AND energy_density = '${energyDensity}'
    `;
  }
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
      WHERE ${operatorFilter} ${periodFilter} ${peerGroupFilter} ${networkLevelFilter}
      ORDER BY period DESC, operator_id, network_level
    `;

  const result = await query<NetworkCostRecord>(sql);
  return result;
};

const getOperationalStandards = async ({
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
const getStabilityMetrics = async ({
  operatorId,
  period,
  peerGroup,
}: {
  operatorId?: number;
  period?: number;
  peerGroup?: string;
}): Promise<StabilityMetricRecord[]> => {
  const operatorFilter = operatorId ? `operator_id = ${operatorId}` : "1=1"; // Default to all operators
  const periodFilter = period ? `AND period = ${period}` : "";

  let peerGroupFilter = ""; // Default to no filter (all data)
  if (peerGroup) {
    const { settlementDensity, energyDensity } =
      getSettlementAndEnergyDensity(peerGroup);
    peerGroupFilter = `
      AND settlement_density = '${settlementDensity}'
      AND energy_density = '${energyDensity}'
    `;
  }

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
      WHERE ${operatorFilter} ${periodFilter} ${peerGroupFilter} 
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
  peerGroup,
}: {
  operatorId?: number;
  period?: number;
  category?: string;
  tariffType?: "network" | "energy";
  peerGroup?: string;
} = {}): Promise<TariffRecord[]> => {
  let peerGroupFilter = ""; // Default to no filter (all data)
  if (peerGroup) {
    const { settlementDensity, energyDensity } =
      getSettlementAndEnergyDensity(peerGroup);
    peerGroupFilter = `
      AND settlement_density = '${settlementDensity}'
      AND energy_density = '${energyDensity}'
    `;
  }
  const operatorFilter = operatorId ? `operator_id = ${operatorId}` : "1=1"; // Default to all operators
  const periodFilter = period ? `AND period = ${period}` : "";
  const categoryFilter = category ? `AND category = '${category}'` : "";
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
      WHERE ${operatorFilter} ${periodFilter} ${categoryFilter} ${tariffTypeFilter} ${peerGroupFilter}
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

  const result = await query<Omit<OperatorDataRecord, "peer_group">>(sql);
  if (result.length === 0) {
    throw new PeerGroupNotFoundError(operatorId);
  }
  return {
    ...result[0],
    peer_group: getPeerGroupIdFromSettlementAndEnergyDensity(
      result[0].settlement_density,
      result[0].energy_density
    ),
  };
};

const getSettlementAndEnergyDensity = (peerGroupId: string): PeerGroup => {
  const {
    settlement_density: settlementDensity,
    energy_density: energyDensity,
  } = peerGroupMapping[peerGroupId];
  if (!settlementDensity || !energyDensity) {
    throw new Error(`Invalid peer group format: ${peerGroupId}`);
  }
  return {
    id: peerGroupId,
    settlementDensity,
    energyDensity,
  };
};

const getPeerGroupIdFromSettlementAndEnergyDensity = (
  settlementDensity: string,
  energyDensity: string
): string => {
  if (!settlementDensity || !energyDensity) {
    throw new Error(
      `Invalid settlement or energy density: ${settlementDensity}, ${energyDensity}`
    );
  }
  const peerGroup = Object.entries(peerGroupMapping).find(
    ([, value]) =>
      value.settlement_density === settlementDensity &&
      value.energy_density === energyDensity
  );
  if (!peerGroup) {
    throw new PeerGroupNotFoundError(
      `No peer group found for settlement density: ${settlementDensity} and energy density: ${energyDensity}`
    );
  }
  return peerGroup[0]; // Return the key (peer group letter)
};

const getYearlyIndicatorMedians = async <
  Metric extends IndicatorMedianParams["metric"]
>(
  params: IndicatorMedianParams
) => {
  const { peerGroup, metric, period } = params;

  // Handle optional peer group
  let peerGroupFilter = "1=1"; // Default to no filter (all data)
  if (peerGroup) {
    const { settlementDensity, energyDensity } =
      getSettlementAndEnergyDensity(peerGroup);
    peerGroupFilter = `
      settlement_density = '${settlementDensity}'
      AND energy_density = '${energyDensity}'
    `;
  }

  const periodFilter = period ? `AND period = ${period}` : "";
  let sql = "";

  switch (metric) {
    case "network_costs": {
      const { networkLevel } = params;
      sql = `
        SELECT
          network_level,
          MEDIAN(cost) as median_value,
          period
        FROM network_costs
        WHERE 
          ${peerGroupFilter}
          ${periodFilter}
          AND network_level = '${networkLevel}'
        GROUP BY network_level, period
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
          MEDIAN(saifi_unplanned) as median_saifi_unplanned,
          period
        FROM stability_metrics
        WHERE 
          ${peerGroupFilter}
          ${periodFilter}
        GROUP BY period
        ORDER BY period
      `;
      break;

    case "operational":
      sql = `
        SELECT
          MEDIAN(franc_rule) as median_franc_rule,
          MEDIAN(info_days_in_advance) as median_info_days,
          MEDIAN(timely) as median_timely,
          period
        FROM operational_standards
        WHERE 
          ${peerGroupFilter}
          ${periodFilter}
        GROUP BY period
        ORDER BY period
      `;
      break;

    case "energy-tariffs": {
      const { category } = params;
      sql = `
        SELECT
          category,
          tariff_type,
          MEDIAN(rate) as median_rate,
          period
        FROM tariffs
        WHERE 
          ${peerGroupFilter}
          ${periodFilter}
          AND category = '${category}'
          AND tariff_type = 'energy'
        GROUP BY category, tariff_type, period
        ORDER BY category, tariff_type, period
      `;
      break;
    }

    case "net-tariffs": {
      const { category } = params;
      sql = `
        SELECT
          category,
          tariff_type,
          MEDIAN(rate) as median_rate,
          period
        FROM tariffs
        WHERE 
          ${peerGroupFilter}
          ${periodFilter}
          AND category = '${category}'
          AND tariff_type = 'network'
        GROUP BY category, tariff_type, period
        ORDER BY category, tariff_type, period
      `;
      break;
    }
  }

  if (!sql) {
    throw new Error(`Unknown metric: ${metric}`);
  }

  const result = await query<PeerGroupRecord<Metric>>(sql);
  return result;
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

const getPeerGroup = async (
  operatorId: number | string
): Promise<PeerGroup> => {
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

  const peerGroupId = getPeerGroupIdFromSettlementAndEnergyDensity(
    peerGroupData[0].settlement_density,
    peerGroupData[0].energy_density
  );

  return {
    settlementDensity: peerGroupData[0].settlement_density,
    energyDensity: peerGroupData[0].energy_density,
    id: peerGroupId,
  };
};

const getPeerGroups = async (_locale: string): Promise<PeerGroupItem[]> => {
  // For SQL implementation, directly return the static mapping
  // This assumes the names are not localized in the SQL version
  return Object.entries(peerGroupMapping).map(([id, mapping]) => ({
    id,
    name: `${mapping.settlement_density} - ${mapping.energy_density}`,
  }));
};

const getSunshineData = async ({
  operatorId,
  period,
  peerGroup,
}: {
  operatorId?: number | undefined | null;
  period?: string | undefined | null;
  peerGroup?: string | undefined | null;
}): Promise<SunshineDataRow[]> => {
  const operatorFilter = operatorId ? `partner_id = ${operatorId}` : "1=1"; // Default to all operators
  const periodFilter = period ? `AND period = ${period}` : "";

  // Handle peer group filtering
  let peerGroupFilter = "";
  if (peerGroup && peerGroup !== "all_grid_operators") {
    const mapping = peerGroupMapping[peerGroup];
    if (mapping) {
      peerGroupFilter = `AND energy_density = '${mapping.energy_density}' AND settlement_density = '${mapping.settlement_density}'`;
    }
  }

  const peerGroupJoin = peerGroup
    ? `JOIN peer_groups pg ON s.partner_id = pg.network_operator_id`
    : ""; // Only join if peer group filtering is applied

  const sql = `
    SELECT *
    FROM sunshine_all s
    ${peerGroupJoin}
    WHERE ${operatorFilter} ${periodFilter} ${peerGroupFilter}
    ORDER BY period DESC, partner_id;
  `;

  const result = await query<{
    partner_id: number;
    uid: string;
    name: string;
    period: number;
    franc_rule: number;
    info_yes_no: string;
    info_days_in_advance: number;
    network_costs_ne5: number;
    network_costs_ne6: number;
    network_costs_ne7: number;
    timely: number;
    saidi_total: number;
    saidi_unplanned: number;
    saifi_total: number;
    saifi_unplanned: number;
    tariff_ec2: number;
    tariff_ec3: number;
    tariff_ec4: number;
    tariff_ec6: number;
    tariff_eh2: number;
    tariff_eh4: number;
    tariff_eh7: number;
    tariff_nc2: number;
    tariff_nc3: number;
    tariff_nc4: number;
    tariff_nc6: number;
    tariff_nh2: number;
    tariff_nh4: number;
    tariff_nh7: number;
    year: number;
  }>(sql);

  return result.map((row) => ({
    operatorId: row.partner_id,
    operatorUID: row.uid,
    name: row.name,
    period: `${row.period}`,
    francRule: row.franc_rule,
    infoYesNo: row.info_yes_no === "ja",
    infoDaysInAdvance: row.info_days_in_advance,
    networkCostsNE5: row.network_costs_ne5,
    networkCostsNE6: row.network_costs_ne6,
    networkCostsNE7: row.network_costs_ne7,
    timely: row.timely === 1,
    saidiTotal: row.saidi_total,
    saidiUnplanned: row.saidi_unplanned,
    saifiTotal: row.saifi_total,
    saifiUnplanned: row.saifi_unplanned,
    tariffEC2: row.tariff_ec2,
    tariffEC3: row.tariff_ec3,
    tariffEC4: row.tariff_ec4,
    tariffEC6: row.tariff_ec6,
    tariffEH2: row.tariff_eh2,
    tariffEH4: row.tariff_eh4,
    tariffEH7: row.tariff_eh7,
    tariffNC2: row.tariff_nc2,
    tariffNC3: row.tariff_nc3,
    tariffNC4: row.tariff_nc4,
    tariffNC6: row.tariff_nc6,
    tariffNH2: row.tariff_nh2,
    tariffNH4: row.tariff_nh4,
    tariffNH7: row.tariff_nh7,
  }));
};

const getSunshineDataByIndicator = async ({
  operatorId,
  period,
  peerGroup,
  indicator,
  category,
  networkLevel,
  typology,
}: {
  operatorId?: number | undefined | null;
  period?: string | undefined | null;
  // FIX ME, Peer group should be a type coming from the domain
  peerGroup?: string | undefined | null;
  indicator: SunshineIndicator;
  category?: string;
  networkLevel?: string;
  typology?: string;
}): Promise<SunshineDataIndicatorRow[]> => {
  // Get the full data with peer group filtering
  const fullData = await getSunshineData({ operatorId, period, peerGroup });

  const fieldName = getFieldName(indicator, category, networkLevel, typology);

  // Extract only the value for the specified indicator and return minimal structure
  return fullData.map((row) => {
    // Get the value for the specified indicator field
    const value = row[fieldName as keyof typeof row] as number | undefined;

    return {
      operatorId: row.operatorId,
      operatorUID: row.operatorUID,
      name: row.name,
      period: row.period,
      value:
        typeof value === "number" && isFinite(value)
          ? value
          : typeof value === "boolean"
          ? value
            ? 1
            : 0
          : null,
    };
  });
};

export const sunshineDataServiceSql = {
  name: "sql",
  getNetworkCosts,
  getOperationalStandards,
  getStabilityMetrics,
  getTariffs,
  getOperatorData,
  getYearlyIndicatorMedians,
  getLatestYearSunshine,
  getLatestYearPowerStability,
  getOperatorPeerGroup: getPeerGroup,
  getPeerGroups,
  getSunshineData,
  getSunshineDataByIndicator,
} satisfies SunshineDataService;
