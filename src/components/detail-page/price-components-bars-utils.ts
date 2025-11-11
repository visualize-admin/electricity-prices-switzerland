import { ascending } from "d3";

import { Entity, ObservationValue } from "src/domain/data";
import { getLocalizedLabel } from "src/domain/translation";
import { FlagValue } from "src/flags";
import { PriceComponent } from "src/graphql/queries";

export const EXPANDED_TAG = "expanded";

const addDynamicTariffs = (obj: Record<string, ObservationValue | $FixMe>) => ({
  ...obj,
  max: 65.45,
  min: 12.89,
});

const createSingleObservation = (obs: Record<string, ObservationValue>) => ({
  ...obs,
  label: obs.uniqueId,
});

const createGroupedObservation = (
  group: [ObservationValue, Record<string, ObservationValue>[]],
  priceComponent: PriceComponent,
  entity: Entity
) => {
  const [groupValue, observations] = group;
  const firstObs = observations[0];
  return {
    priceComponent,
    value: groupValue,
    [entity]: firstObs[entity],
    period: firstObs.period,
    uniqueId: `${priceComponent}${firstObs.period}${firstObs.operatorLabel}${firstObs.municipalityLabel}${observations.length}`,
    label: `${firstObs.period}, ${firstObs.operatorLabel}, ${
      observations.length
    } ${getLocalizedLabel({
      id: entity === "operator" ? "municipalities" : "operators",
    })}`,
    entities: group[1],
  };
};

const createExpandedObservation = (
  d: Record<string, ObservationValue>,
  group: [ObservationValue, Record<string, ObservationValue>[]],
  priceComponent: PriceComponent,
  entity: Entity
) => {
  return {
    priceComponent,
    value: d.value,
    [entity]: d[entity],
    period: d.period,
    uniqueId: `${priceComponent}${d.period}${d.operatorLabel}${d.municipalityLabel}${group[1].length}${EXPANDED_TAG}`,
    label: entity === "municipality" ? d.operatorLabel : d.municipalityLabel,
  };
};

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
  return groupedObservations.flatMap((year) =>
    year[1].flatMap((ent) =>
      ent[1]
        .flatMap((group) => {
          const [, observations] = group;
          if (entity === "canton") {
            return createSingleObservation(observations[0]);
          }

          if (view === "collapsed") {
            return observations.length === 1
              ? createSingleObservation(observations[0])
              : createGroupedObservation(group, priceComponent, entity);
          }

          const singleEntities = observations
            .map((d) =>
              createExpandedObservation(d, group, priceComponent, entity)
            )
            .sort((a, b) => ascending(a.label, b.label));

          return [
            createGroupedObservation(group, priceComponent, entity),
            ...singleEntities,
          ];
        })
        .map((obs) => (dynamicTariffsFlag ? addDynamicTariffs(obs) : obs))
    )
  );
};
