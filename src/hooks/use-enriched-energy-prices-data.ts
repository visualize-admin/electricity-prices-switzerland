import { useMemo } from "react";

import { buildEnrichedEnergyPricesData } from "src/domain/energy-prices-map-data";
import {
  useAllMunicipalitiesQuery,
  useObservationsQuery,
} from "src/graphql/queries";
import { PriceComponent } from "src/graphql/resolver-types";

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

    return buildEnrichedEnergyPricesData({
      observations: observationsQuery.data.observations,
      municipalities: municipalitiesQuery.data.municipalities,
      cantonMedianObservations: observationsQuery.data.cantonMedianObservations,
      swissMedianObservations: observationsQuery.data.swissMedianObservations,
    });
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

export type EnrichedEnergyObservation = Omit<
  EnrichedEnergyPricesData["observations"][number],
  "__typename"
>;
