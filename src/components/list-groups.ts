import { mean, rollup } from "d3";

import { OperatorObservationFieldsFragment } from "src/graphql/queries";
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
          value: mean(values, (d) => d.value) ?? first.value!,
          canton: first.canton,
          cantonLabel: first.cantonLabel,
          operators: values.reduce(
            (acc, o) => {
              if (acc.seen.has(o.operator)) return acc;
              acc.seen.add(o.operator);
              if (o.value) {
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
