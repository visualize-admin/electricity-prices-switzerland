import { ascending } from "d3";

import { Entity, ObservationValue } from "src/domain/data";
import { getLocalizedLabel } from "src/domain/translation";
import { FlagValue } from "src/flags";
import { PriceComponent } from "src/graphql/queries";

export const EXPANDED_TAG = "expanded";

export const prepareObservations = ({
  groupedObservations,
  priceComponent,
  entity,
  view,
  dynamicTariffsFlag,
}: {
  groupedObservations: [
    ObservationValue,
    [
      ObservationValue,
      [ObservationValue, Record<string, ObservationValue>[]][]
    ][]
  ][];
  priceComponent: PriceComponent;
  entity: Entity;
  view: string;
  dynamicTariffsFlag: FlagValue;
}) => {
  if (entity === "canton") {
    return groupedObservations.flatMap((year) =>
      year[1].flatMap((ent) =>
        ent[1].flatMap((value) => ({
          ...value[1][0],
          ...(dynamicTariffsFlag ? { max: 65.45, min: 12.89 } : {}),
          label: value[1][0].uniqueId,
        }))
      )
    );
  } else {
    return view === "collapsed"
      ? groupedObservations.flatMap((year) =>
          year[1].flatMap((ent) =>
            ent[1].flatMap((value) =>
              value[1].length === 1
                ? {
                    ...value[1][0],
                    label: value[1][0].uniqueId,
                    ...(dynamicTariffsFlag ? { max: 65.45, min: 12.89 } : {}),
                  }
                : {
                    priceComponent,
                    value: value[0],
                    ...(dynamicTariffsFlag ? { max: 65.45, min: 12.89 } : {}),
                    [entity]: value[1][0][entity],
                    period: value[1][0].period,
                    uniqueId: `${priceComponent}${value[1][0].period}${value[1][0].operatorLabel}${value[1][0].municipalityLabel}${value[1].length}`,
                    label: `${value[1][0].period}, ${
                      value[1][0].operatorLabel
                    }, ${value[1].length} ${getLocalizedLabel({
                      id:
                        entity === "operator" ? "municipalities" : "operators",
                    })}`,
                    entities: value[1],
                  }
            )
          )
        )
      : groupedObservations.flatMap((year) =>
          year[1].flatMap((ent) =>
            ent[1].flatMap((value) => {
              const singleEntities = value[1]
                .flatMap((d) => ({
                  priceComponent,
                  value: d.value,
                  ...(dynamicTariffsFlag ? { max: 65.45, min: 12.89 } : {}),
                  [entity]: d[entity],
                  period: d.period,
                  uniqueId: `${priceComponent}${d.period}${d.operatorLabel}${d.municipalityLabel}${value[1].length}${EXPANDED_TAG}`,
                  label:
                    entity === "municipality"
                      ? d.operatorLabel
                      : d.municipalityLabel,
                }))
                .sort((a, b) => ascending(a.label, b.label));
              const groupPlusSingleValues = [
                {
                  priceComponent,
                  value: value[0],
                  ...(dynamicTariffsFlag ? { max: 65.45, min: 12.89 } : {}),
                  [entity]: value[1][0][entity],
                  period: value[1][0].period,
                  uniqueId: `${priceComponent}${value[1][0].period}${value[1][0].operatorLabel}${value[1][0].municipalityLabel}${value[1].length}`,
                  label: `${value[1][0].period}, ${
                    value[1][0].operatorLabel
                  }, ${value[1].length} ${getLocalizedLabel({
                    id: entity === "operator" ? "municipalities" : "operators",
                  })}`,
                  entities: value[1],
                },
                ...singleEntities,
              ];

              return groupPlusSingleValues;
            })
          )
        );
  }
};
