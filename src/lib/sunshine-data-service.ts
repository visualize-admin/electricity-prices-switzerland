import { GetServerSidePropsContext, NextApiRequest } from "next";

import { ElectricityCategory } from "src/domain/data";
import { NetworkLevel, SunshineIndicator } from "src/domain/sunshine";
import server from "src/env/server";
import {
  PeerGroup,
  PeerGroupItem,
  SunshineDataIndicatorRow,
  SunshineDataRow,
} from "src/graphql/resolver-types";
import { sunshineDataServiceSparql } from "src/lib/db/sparql";
import { sunshineDataServiceSql } from "src/lib/db/sql";
import { IndicatorMedianParams } from "src/lib/sunshine-data";
import { parseSessionFromRequest } from "src/session-config";

export type NetworkCostRecord = {
  operator_id: number;
  operator_name: string;
  year: number;
  network_level: NetworkLevel["id"];
  rate: number;
};

export type OperationalStandardRecord = {
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

export type StabilityMetricRecord = {
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
  category: ElectricityCategory;
  tariff_type: string;
  rate: number;
};

export type OperatorDataRecord = {
  operator_id: number;
  operator_uid: string;
  operator_name: string;
  period: number;
  settlement_density: string;
  energy_density: string;
  peer_group: string;
};

export type PeerGroupRecord<Metric extends IndicatorMedianParams["metric"]> =
  Metric extends "network_costs"
    ? {
        network_level: NetworkLevel["id"];
        median_value: number;
        period: number;
      }
    : Metric extends "stability"
    ? {
        median_saidi_total: number;
        median_saidi_unplanned: number;
        median_saifi_total: number;
        median_saifi_unplanned: number;
        period: number;
      }
    : Metric extends "operational"
    ? {
        median_franc_rule: number;
        median_info_days: number;
        median_timely: number;
        period: number;
      }
    : Metric extends "energy-tariffs"
    ? {
        category: ElectricityCategory;
        tariff_type: string;
        median_rate: number;
        period: number;
      }
    : Metric extends "net-tariffs"
    ? {
        category: ElectricityCategory;
        tariff_type: string;
        median_rate: number;
        period: number;
      }
    : never;

export interface SunshineDataService {
  name: string;
  getNetworkCosts(params?: {
    operatorId?: number;
    period?: number;
    peerGroup?: string;
    networkLevel?: NetworkLevel["id"];
  }): Promise<NetworkCostRecord[]>;

  getOperationalStandards(params: {
    operatorId: number;
    period?: number;
  }): Promise<OperationalStandardRecord[]>;

  getStabilityMetrics(params?: {
    operatorId?: number;
    period?: number;
    peerGroup?: string;
  }): Promise<StabilityMetricRecord[]>;

  getTariffs(params?: {
    operatorId?: number;
    period?: number;
    category?: string;
    tariffType?: "network" | "energy";
    peerGroup?: string;
  }): Promise<TariffRecord[]>;

  getOperatorData(
    operatorId: number,
    period: number
  ): Promise<OperatorDataRecord>;

  getYearlyIndicatorMedians<Metric extends IndicatorMedianParams["metric"]>(
    params: IndicatorMedianParams
  ): Promise<PeerGroupRecord<Metric>[]>;

  getLatestYearSunshine(operatorId: number): Promise<number>;

  getLatestYearPowerStability(operatorId: number): Promise<string>;

  getOperatorPeerGroup(
    operatorId: number | string,
    period: number
  ): Promise<PeerGroup>;

  getPeerGroups(locale: string): Promise<PeerGroupItem[]>;

  getSunshineData(params: {
    operatorId?: number | undefined | null;
    period?: string | undefined | null;
    peerGroup?: string | undefined | null;
  }): Promise<SunshineDataRow[]>;

  getSunshineDataByIndicator(params: {
    operatorId?: number | undefined | null;
    period?: string | undefined | null;
    peerGroup?: string | undefined | null;
    indicator: SunshineIndicator;
    category?: string;
    networkLevel?: string;
    saidiSaifiType?: string;
  }): Promise<SunshineDataIndicatorRow[]>;

  fetchUpdateDate(): Promise<string>;
}
const DATABASE_SERVICE_MAP = {
  sql: sunshineDataServiceSql,
  sparql: sunshineDataServiceSparql,
} satisfies Record<string, SunshineDataService>;
type DatabaseServiceKey = keyof typeof DATABASE_SERVICE_MAP;

export const DEFAULT_DATABASE_SERVICE_KEY = server.SUNSHINE_DEFAULT_SERVICE;

/**
 * Gets the sunshine data service based on the current session or fallback to cookie/default.
 */
export function getSunshineDataService(
  serviceKey: (string & {}) | DatabaseServiceKey | undefined
): SunshineDataService {
  if (!serviceKey || !(serviceKey in DATABASE_SERVICE_MAP)) {
    return DATABASE_SERVICE_MAP[DEFAULT_DATABASE_SERVICE_KEY];
  }

  return DATABASE_SERVICE_MAP[serviceKey as DatabaseServiceKey];
}

/**
 * Session-aware function to get sunshine data service from API request.
 * This function first tries to get the service from the admin session,
 * then falls back to the legacy cookie method for backward compatibility.
 */

export async function getSunshineDataServiceFromApiRequest(
  req: NextApiRequest
): Promise<SunshineDataService> {
  const session = await parseSessionFromRequest(req);
  return getSunshineDataService(session?.flags.sunshineDataService);
}
/**
 * Session-aware function to get sunshine data service from GetServerSideProps context.
 * This function first tries to get the service from the admin session,
 * then falls back to the legacy cookie method for backward compatibility.
 */

export async function getSunshineDataServiceFromGetServerSidePropsContext(
  context: GetServerSidePropsContext
): Promise<SunshineDataService> {
  const session = await parseSessionFromRequest(context.req as NextApiRequest);
  return getSunshineDataService(session?.flags.sunshineDataService);
}
