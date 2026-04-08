import { mean } from "d3";
import { first } from "lodash";

import { SunshineIndicator } from "src/domain/sunshine";
import { Maybe, SunshineDataIndicatorRow } from "src/graphql/queries";

export type AggregatedEnergyOperatorObservation = {
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

  const aggregateFn = aggregateFnPerIndicator[indicator];

  return Object.fromEntries(
    Array.from(observationsByOperatorMap.entries()).map(
      ([operatorId, observations]) => [
        operatorId,
        {
          ...observations[0],
          value: aggregateFn(
            observations.map((obs) => obs.value).filter((v) => v !== undefined),
          ),
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
          value:
            mean(
              observations
                .map((obs) => obs.value)
                .filter((v): v is number => v !== null && v !== undefined),
            ) ?? null,
          period: observations[0].period,
        },
      ],
    ),
  );
};
