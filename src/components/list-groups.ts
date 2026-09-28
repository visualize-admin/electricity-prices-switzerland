import { mean, rollup } from "d3";

import {
  getMunicipalityValue,
  getOperatorMeanValue,
  getSunshineOperatorValue,
} from "src/domain/aggregate-observations";
import { SunshineIndicator } from "src/domain/sunshine";
import {
  CantonMedianObservationFieldsFragment,
  OperatorObservationFieldsFragment,
  SunshineDataIndicatorRow,
} from "src/graphql/queries";
import { isDefined } from "src/utils/is-defined";

type OperatorListItem = {
  id: string;
  label?: string | null;
  value: number;
};

export function groupsFromElectricityMunicipalities(
  observations: OperatorObservationFieldsFragment[]
) {
  return Array.from(
    rollup(
      observations.filter((x) => isDefined(x.value)),
      (values) => {
        const first = values[0];
        return {
          id: first.municipality,
          label: first.municipalityLabel,
          value: getMunicipalityValue(values) ?? first.value!,
          canton: first.canton,
          cantonLabel: first.cantonLabel,
          operators: values.reduce(
            (acc, o) => {
              if (acc.seen.has(o.operator)) return acc;
              acc.seen.add(o.operator);
              if (isDefined(o.value)) {
                acc.result.push({
                  id: o.operator,
                  label: o.operatorLabel,
                  value: o.value,
                });
              }
              return acc;
            },
            {
              seen: new Set<string>(),
              result: [] as OperatorListItem[],
            }
          ).result,
        };
      },
      (d) => d.municipality
    )
  );
}

export function groupsFromElectricityOperators(
  observations: OperatorObservationFieldsFragment[]
) {
  return Array.from(
    rollup(
      observations.filter((x) => x.value !== undefined && x.value !== null),
      (values) => {
        const first = values[0];
        // first.value asserted above
        const value = getOperatorMeanValue(values) ?? first.value!;
        return {
          id: first.operator,
          label: first.operatorLabel,
          value,
          canton: first.canton,
          cantonLabel: first.cantonLabel,
          operators: [
            {
              id: first.operator,
              label: first.operatorLabel,
              value,
            },
          ],
        };
      },
      (d) => d.operator
    )
  );
}

export function groupsFromCantonElectricityObservations(
  cantonObservations: CantonMedianObservationFieldsFragment[]
): [
  string,
  {
    id: string;
    label: string | null | undefined;
    value: number;
    canton: string;
    cantonLabel: string | null | undefined;
  }
][] {
  return Array.from(
    rollup(
      cantonObservations,
      (values) => {
        const first = values[0];
        return {
          id: first.canton,
          label: first.cantonLabel,
          value: mean(values, (d) => d.value) ?? first.value,
          canton: first.canton,
          cantonLabel: first.cantonLabel,
        };
      },
      (d) => d.canton
    )
  );
}

export const groupsFromSunshineObservations = (
  observations: SunshineDataIndicatorRow[],
  indicator: SunshineIndicator
) => {
  const withValues = observations
    .filter((d) => d.value !== undefined && d.value !== null)
    .map((d) => ({
      ...d,
      value: d.value!,
    }));

  return Array.from(
    rollup(
      withValues,
      (values) => {
        const first = values[0];
        return {
          id: `${first.operatorId}`,
          label: first.name,
          value: getSunshineOperatorValue(values, indicator) ?? first.value,
          canton: "",
          cantonLabel: "",
          operators: values.map((v) => ({
            id: v.operatorId,
            label: v.name,
            value: v.value,
          })),
        };
      },
      (d) => `${d.operatorId}`
    )
  );
};
