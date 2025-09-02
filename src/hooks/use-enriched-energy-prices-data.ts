import { extent, group } from "d3";
import { useMemo } from "react";

import { getObservationsWeightedMean } from "src/domain/data";
import {
  useAllMunicipalitiesQuery,
  useObservationsQuery,
} from "src/graphql/queries";
import { PriceComponent } from "src/graphql/resolver-types";
import { indexMapper } from "src/lib/array";

interface UseEnrichedEnergyPricesDataParams {
  locale: string;
  priceComponent: PriceComponent;
  filters: {
    period: string[];
    category: string[];
    product: string[];
  };
  enabled?: boolean;
}

/**
 * Hook for fetching and enriching energy prices data with municipalities and cantons.
 * Provides O(1) lookups and pre-computed groupings for efficient data access.
 *
 * @param params - Query parameters including locale, filters, and enabled state
 * @returns Enriched data with efficient lookups and computed aggregations
 */
export const useEnrichedEnergyPricesData = ({
  locale,
  priceComponent,
  filters,
  enabled = true,
}: UseEnrichedEnergyPricesDataParams) => {
  const [observationsQuery] = useObservationsQuery({
    variables: {
      locale,
      priceComponent,
      filters,
    },
    pause: !enabled,
  });

  const [municipalitiesQuery] = useAllMunicipalitiesQuery({
    variables: { locale },
    pause: !enabled,
  });

  const enrichedData = useMemo(() => {
    if (
      observationsQuery.fetching ||
      municipalitiesQuery.fetching ||
      !observationsQuery.data ||
      !municipalitiesQuery.data
    ) {
      return null;
    }

    const rawObservations = observationsQuery.data.observations || [];
    const municipalities = municipalitiesQuery.data.municipalities || [];
    const cantonMedianObservations =
      observationsQuery.data.cantonMedianObservations || [];
    const swissMedianObservations =
      observationsQuery.data.swissMedianObservations || [];

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

    const observationsByMunicipality = group(
      observations,
      (obs) => obs.municipality
    );
    const observationsByCanton = group(observations, (obs) => obs.canton);

    const medianValue = swissMedianObservations[0]?.value;
    const means = Array.from(observationsByMunicipality.values()).map(
      (observations) => getObservationsWeightedMean(observations)
    );
    const valuesExtent = extent(means) as [number, number];

    return {
      observations,
      observationsByMunicipality,
      observationsByCanton,
      cantonMedianObservations,
      swissMedianObservations,
      municipalities: municipalities,
      municipalityIndex,
      cantonIndex,
      medianValue,
      valuesExtent,
    };
  }, [
    observationsQuery.data,
    observationsQuery.fetching,
    municipalitiesQuery.data,
    municipalitiesQuery.fetching,
  ]);

  return {
    data: enrichedData,
    fetching: observationsQuery.fetching || municipalitiesQuery.fetching,
    error: observationsQuery.error || municipalitiesQuery.error,
    observationsQuery: {
      fetching: observationsQuery.fetching,
      error: observationsQuery.error,
      data: observationsQuery.data,
    },
    municipalitiesQuery: {
      fetching: municipalitiesQuery.fetching,
      error: municipalitiesQuery.error,
      data: municipalitiesQuery.data,
    },
  };
};

export type EnrichedEnergyPricesData = NonNullable<
  ReturnType<typeof useEnrichedEnergyPricesData>["data"]
>;

export type EnrichedEnergyObservation =
  EnrichedEnergyPricesData["observations"][number];
