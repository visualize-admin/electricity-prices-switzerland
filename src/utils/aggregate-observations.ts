import { mean } from "d3";
import { first } from "lodash";

import { SunshineIndicator } from "src/domain/sunshine";
import { Maybe, SunshineDataIndicatorRow } from "src/graphql/queries";

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
 * For energy prices, we create a simplified structure that matches what the map layers expect.
 */
export const aggregateEnergyPricesObservationsByOperator = (
  observationsByOperatorMap: Map<string, OperatorObservation[]> | undefined,
): Record<string, SunshineDataIndicatorRow> => {
  if (!observationsByOperatorMap) {
    return {};
  }

  return Object.fromEntries(
    Array.from(observationsByOperatorMap.entries()).map(
      ([operatorId, observations]) => [
        operatorId,
        {
          // Convert energy price observation to sunshine data format for map layers
          __typename: "SunshineDataIndicatorRow" as const,
          name: observations[0].operatorLabel ?? `Operator ${operatorId}`,
          value:
            mean(
              observations
                .map((obs) => obs.value)
                .filter((v): v is number => v !== null),
            ) ?? null,
          period: observations[0].period,
          operatorId: parseInt(operatorId, 10),
          operatorUID: operatorId,
        },
      ],
    ),
  );
};
