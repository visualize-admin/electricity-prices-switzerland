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
