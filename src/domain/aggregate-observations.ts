import { group, mean } from "d3";
import { first } from "lodash";

import { SunshineIndicator } from "src/domain/sunshine";
import {
  Maybe,
  OperatorObservationFieldsFragment,
  SunshineDataIndicatorRow,
} from "src/graphql/queries";
import { isDefined } from "src/utils/is-defined";
import { weightedMean } from "src/utils/weighted-mean";

/*
 * Entity figures. An entity (municipality, operator, canton) is backed by
 * several observation rows; every view (map colors, legend, tooltip, list,
 * detail panel, chart) takes the entity's figure from these functions, never
 * from one of its rows' `value`. The canton figure is the median computed
 * server-side (`cantonMedianObservations`).
 */

/**
 * Municipality-level value: its operators' values weighted by the share of
 * the municipality each one covers. Rows without a value are ignored.
 */
export const getMunicipalityValue = (
  observations: Pick<
    OperatorObservationFieldsFragment,
    "value" | "coverageRatio"
  >[]
): number | null => {
  const withValue = observations.filter((d) => isDefined(d.value));
  if (withValue.length === 0) return null;
  return weightedMean(
    withValue,
    (d) => d.value!,
    (d) => d.coverageRatio
  );
};

/**
 * Operator-level value: mean of the operator's values across the
 * municipalities it serves. Values can differ per municipality, e.g.
 * charges to the community.
 */
export const getOperatorMeanValue = (
  observations: { value?: number | null }[]
): number | null => mean(observations, (d) => d.value ?? undefined) ?? null;

/**
 * One observation per operator and period, valued with `getOperatorMeanValue`.
 * Municipality fields are cleared as the result spans several municipalities.
 */
export const averageOperatorObservationsByPeriod = <
  T extends {
    operator: string;
    period: string;
    value?: number | null;
    municipality: string;
    municipalityLabel?: string | null;
  }
>(
  observations: T[]
): T[] =>
  Array.from(
    group(
      observations,
      (d) => d.operator,
      (d) => d.period
    ).values()
  ).flatMap((observationsByPeriod) =>
    Array.from(observationsByPeriod.values(), (periodObservations) => ({
      ...periodObservations[0],
      municipality: "",
      municipalityLabel: null,
      value: getOperatorMeanValue(periodObservations),
    }))
  );

type AggregatedEnergyOperatorObservation = {
  value: number | null;
  name: string;
  period: string;
};

type EnergyPricesObservation = {
  operatorLabel?: string | null;
  period: string;
  value?: number | null;
};

// Aggregation functions per sunshine indicator
const aggregateFnPerIndicator: Record<
  SunshineIndicator,
  (values: (Maybe<number> | undefined)[]) => Maybe<number>
> = {
  networkCosts: (values) =>
    mean(values.filter((v): v is number => v !== null && v !== undefined)) ??
    null,
  netTariffs: (values) =>
    mean(values.filter((v): v is number => v !== null && v !== undefined)) ??
    null,
  energyTariffs: (values) =>
    mean(values.filter((v): v is number => v !== null && v !== undefined)) ??
    null,
  saidi: (values) =>
    mean(values.filter((v): v is number => v !== null && v !== undefined)) ??
    null,
  saifi: (values) =>
    mean(values.filter((v): v is number => v !== null && v !== undefined)) ??
    null,
  daysInAdvanceOutageNotification: first,
  outageInfo: first,
  compliance: first,
};

/**
 * Operator-level value for a sunshine indicator, from the operator's rows.
 */
export const getSunshineOperatorValue = (
  observations: { value?: Maybe<number> }[],
  indicator: SunshineIndicator,
): Maybe<number> =>
  aggregateFnPerIndicator[indicator](
    // Rows without a value are ignored, as in the list
    observations.map((obs) => obs.value).filter(isDefined),
  ) ?? null;

/**
 * Aggregates sunshine data observations by operator using the appropriate aggregation function
 * based on the indicator type.
 */
export const aggregateSunshineObservationsByOperator = (
  observationsByOperatorMap:
    | Map<string, SunshineDataIndicatorRow[]>
    | undefined,
  indicator: SunshineIndicator,
): Record<string, SunshineDataIndicatorRow> => {
  if (!observationsByOperatorMap) {
    return {};
  }

  return Object.fromEntries(
    Array.from(observationsByOperatorMap.entries()).map(
      ([operatorId, observations]) => [
        operatorId,
        {
          ...observations[0],
          value: getSunshineOperatorValue(observations, indicator),
        },
      ],
    ),
  );
};

/**
 * Aggregates energy prices observations by operator using mean aggregation.
 */
export const aggregateEnergyPricesObservationsByOperator = (
  observationsByOperatorMap: Map<string, EnergyPricesObservation[]> | undefined,
): Record<string, AggregatedEnergyOperatorObservation> => {
  if (!observationsByOperatorMap) {
    return {};
  }

  return Object.fromEntries(
    Array.from(observationsByOperatorMap.entries()).map(
      ([operatorId, observations]) => [
        operatorId,
        {
          name: observations[0].operatorLabel ?? `Operator ${operatorId}`,
          value: getOperatorMeanValue(observations),
          period: observations[0].period,
        },
      ],
    ),
  );
};
