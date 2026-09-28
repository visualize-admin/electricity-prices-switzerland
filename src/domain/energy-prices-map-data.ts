import { extent, group, index } from "d3";
import { mapValues } from "lodash";

import {
  aggregateEnergyPricesObservationsByOperator,
  getMunicipalityValue,
} from "src/domain/aggregate-observations";
import { Entity } from "src/domain/data";
import { thresholdEncodings } from "src/domain/map-encodings";
import { AllMunicipalitiesQuery, ObservationsQuery } from "src/graphql/queries";
import { indexMapper } from "src/lib/array";

/**
 * Pure computation shared by `useEnrichedEnergyPricesData` (React) and the
 * energy-prices CLI, so both derive the map's groupings/median/color inputs
 * from the exact same logic.
 */
export const buildEnrichedEnergyPricesData = ({
  observations: rawObservationsInput,
  municipalities: municipalitiesInput,
  cantonMedianObservations: rawCantonMedianObservationsInput,
  swissMedianObservations: swissMedianObservationsInput,
}: {
  observations: ObservationsQuery["observations"];
  municipalities: AllMunicipalitiesQuery["municipalities"];
  cantonMedianObservations: ObservationsQuery["cantonMedianObservations"];
  swissMedianObservations: ObservationsQuery["swissMedianObservations"];
}) => {
  const rawObservations = rawObservationsInput ?? [];
  const municipalities = municipalitiesInput ?? [];
  const rawCantonMedianObservations = rawCantonMedianObservationsInput ?? [];
  const swissMedianObservations = swissMedianObservationsInput ?? [];
  const municipalityIndex = indexMapper(
    municipalities,
    (municipality) => municipality.id,
    (municipality) => ({
      id: municipality.id,
      name: municipality.name,
    })
  );

  const cantonIndex = indexMapper(
    rawObservations.filter((obs) => obs.canton && obs.cantonLabel),
    (obs) => obs.canton,
    (obs) => ({
      id: obs.canton,
      name: obs.cantonLabel,
    })
  );

  // Enrich observations with municipality and canton data
  const observations = rawObservations.map((observation) => ({
    ...observation,
    municipalityData: municipalityIndex.get(observation.municipality),
    cantonData: cantonIndex.get(observation.canton),
  }));

  const cantonMedianObservations = rawCantonMedianObservations.map(
    (observation) => ({
      ...observation,
      municipalityData: undefined,
      cantonData: cantonIndex.get(observation.canton),
      municipalityLabel: undefined,
      municipality: "",
      coverageRatio: 1,
      operator: "",
    })
  );

  const observationsByMunicipality = group(
    observations,
    (obs) => obs.municipality
  );
  const observationsByOperator = group(observations, (obs) => obs.operator);
  const observationsByOperatorAggregated =
    aggregateEnergyPricesObservationsByOperator(observationsByOperator);
  const cantonMedianObservationsByCanton = index(
    cantonMedianObservations,
    (x) => x.canton
  );

  // Each entity's figure by id, see "Entity figures" in
  // src/domain/aggregate-observations.ts
  const valuesByEntity: Record<Entity, Map<string, number | null>> = {
    municipality: new Map(
      Array.from(observationsByMunicipality, ([id, observations]) => [
        id,
        getMunicipalityValue(observations),
      ])
    ),
    canton: new Map(
      cantonMedianObservations.map((obs) => [obs.canton, obs.value])
    ),
    operator: new Map(
      Object.entries(observationsByOperatorAggregated).map(([id, obs]) => [
        id,
        obs.value,
      ])
    ),
  };
  // Legend min and max: the range of the figures drawn for each entity
  const valuesExtentByEntity = mapValues(
    valuesByEntity,
    (values) =>
      extent(values.values(), (v) => v ?? undefined) as [number, number]
  );

  const medianValue = swissMedianObservations[0]?.value;

  return {
    observations,
    observationsByMunicipality,
    valuesByEntity,
    observationsByOperator,
    observationsByOperatorAggregated,
    cantonMedianObservations,
    cantonMedianObservationsByCanton,
    swissMedianObservations,
    municipalities,
    municipalityIndex,
    cantonIndex,
    medianValue,
    valuesExtentByEntity,
  };
};

/**
 * Legend names for the 5-step GreenToOrange palette used by
 * `thresholdEncodings.energyPrices`, in palette order (lowest to highest value).
 */
const ENERGY_PRICE_LEGEND_COLOR_NAMES = [
  "dark green",
  "light green",
  "yellow",
  "light orange",
  "dark orange",
] as const;

type EnergyPriceLegendColorName =
  (typeof ENERGY_PRICE_LEGEND_COLOR_NAMES)[number];

/**
 * Maps a municipality/operator value to the same legend color the map
 * assigns it, using the exact same threshold encoding as `EnergyPricesMap`.
 */
export const getEnergyPriceLegendColor = ({
  medianValue,
  values,
  year,
  value,
}: {
  medianValue: number | undefined;
  values: number[];
  year: number;
  value: number;
}): EnergyPriceLegendColorName | undefined => {
  const { palette, makeScale } = thresholdEncodings.energyPrices(
    medianValue,
    values,
    year
  );
  const hexColor = makeScale()(value);
  const index = palette.indexOf(hexColor);
  return index === -1 ? undefined : ENERGY_PRICE_LEGEND_COLOR_NAMES[index];
};
