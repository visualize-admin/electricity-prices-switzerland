import { extent, group, index } from "d3";

import { getObservationsWeightedMean } from "src/domain/data";
import { thresholdEncodings } from "src/domain/map-encodings";
import { AllMunicipalitiesQuery, ObservationsQuery } from "src/graphql/queries";
import { indexMapper } from "src/lib/array";
import { aggregateEnergyPricesObservationsByOperator } from "src/utils/aggregate-observations";

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
  const observationsByCanton = group(observations, (obs) => obs.canton);
  const observationsByOperator = group(observations, (obs) => obs.operator);
  const observationsByOperatorAggregated =
    aggregateEnergyPricesObservationsByOperator(observationsByOperator);
  const cantonMedianObservationsByCanton = index(
    cantonMedianObservations,
    (x) => x.canton
  );

  const medianValue = swissMedianObservations[0]?.value;
  const means = Array.from(observationsByMunicipality.values()).map(
    (observations) => getObservationsWeightedMean(observations)
  );
  const valuesExtent = extent(means) as [number, number];

  return {
    observations,
    observationsByMunicipality,
    observationsByCanton,
    observationsByOperator,
    observationsByOperatorAggregated,
    cantonMedianObservations,
    cantonMedianObservationsByCanton,
    swissMedianObservations,
    municipalities,
    municipalityIndex,
    cantonIndex,
    medianValue,
    valuesExtent,
  };
};

export type EnrichedEnergyPricesData = ReturnType<
  typeof buildEnrichedEnergyPricesData
>;

export type EnrichedEnergyObservation = Omit<
  EnrichedEnergyPricesData["observations"][number],
  "__typename"
>;

/**
 * Legend names for the 5-step GreenToOrange palette used by
 * `thresholdEncodings.energyPrices`, in palette order (lowest to highest value).
 */
export const ENERGY_PRICE_LEGEND_COLOR_NAMES = [
  "dark green",
  "light green",
  "yellow",
  "light orange",
  "dark orange",
] as const;

export type EnergyPriceLegendColorName =
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
