import {
  NetworkCategory,
  NetworkLevel,
  SunshineCostsAndTariffsData,
  SunshineOperationalStandardsData,
  SunshinePowerStabilityData,
} from "src/domain/data";
import {
  getOperatorData,
  getNetworkCosts,
  getTariffs,
  getStabilityMetrics,
  getLatestYearPowerStability,
  getLatestYearSunshine,
  getPeerGroupMedianValues,
  NetworkCostRecord,
  OperationalStandardRecord,
  TariffRecord,
} from "src/lib/db/sql";

import { ensureDatabaseInitialized, query } from "./duckdb";

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

export type PeerGroupMedianValuesParams =
  | NetworkCostsParams
  | StabilityParams
  | OperationalParams
  | NetTariffsParams
  | EnergyTariffsParams;

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
