import { ElectricityCategory, TariffCategory } from "src/domain/data";
import { NetworkLevel } from "src/domain/sunshine";
import { SunshineIndicator } from "src/domain/sunshine";
import {
  SunshineDataRow,
  SunshineDataIndicatorRow,
} from "src/graphql/resolver-types";
import { IndicatorMedianParams } from "src/lib/sunshine-data";

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
  category: TariffCategory;
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
    period?: number
  ): Promise<OperatorDataRecord>;

  getIndicatorMedian<Metric extends IndicatorMedianParams["metric"]>(
    params: IndicatorMedianParams
  ): Promise<PeerGroupRecord<Metric> | undefined>;

  getLatestYearSunshine(operatorId: number): Promise<number>;

  getLatestYearPowerStability(operatorId: number): Promise<string>;

  getPeerGroup(operatorId: number | string): Promise<{
    id: string;
    settlementDensity: string;
    energyDensity: string;
  }>;

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
    typology?: string;
  }): Promise<SunshineDataIndicatorRow[]>;
}
