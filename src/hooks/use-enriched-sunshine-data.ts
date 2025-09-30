import { group } from "d3";
import { useMemo } from "react";

import { ElectricityCategory } from "src/domain/data";
import { NetworkLevel } from "src/domain/sunshine";
import {
  useSunshineDataByIndicatorQuery,
  useOperatorMunicipalitiesQuery,
} from "src/graphql/queries";
import { indexMapper } from "src/lib/array";

interface UseEnrichedSunshineDataParams {
  filter: {
    period: string;
    peerGroup?: string;
    indicator: string;
    saidiSaifiType?: string;
    networkLevel: NetworkLevel["id"];
    category: ElectricityCategory;
  };
  enabled?: boolean;
}

/**
 * Hook for fetching and enriching sunshine data with operator information.
 * Provides O(1) lookups and pre-computed groupings for efficient data access.
 *
 * @param params - Query parameters including filter criteria and enabled state
 * @returns Enriched sunshine data with efficient lookups and computed aggregations
 */
export const useEnrichedSunshineData = ({
  filter,
  enabled = true,
}: UseEnrichedSunshineDataParams) => {
  const {
    period,
    peerGroup,
    indicator,
    saidiSaifiType,
    networkLevel,
    category,
  } = filter;

  // Fetch sunshine data
  const [sunshineDataQuery] = useSunshineDataByIndicatorQuery({
    variables: {
      filter: {
        period,
        peerGroup: peerGroup === "all_grid_operators" ? undefined : peerGroup,
        indicator,
        saidiSaifiType,
        networkLevel,
        category,
      },
    },
    pause: !enabled,
  });

  // TODO Should not use hardcoded category
  // Fetch operator municipalities data for the electricity category C2
  // This is needed to link operators with their geographic areas
  const electricityCategory = "C2" as const;
  const [operatorMunicipalitiesQuery] = useOperatorMunicipalitiesQuery({
    variables: {
      period,
      electricityCategory,
    },
    pause: !enabled,
  });

  // Memoized enriched data computation
  const enrichedData = useMemo(() => {
    // Return null if data is not available or queries are still fetching, or if disabled
    if (
      !enabled ||
      sunshineDataQuery.fetching ||
      operatorMunicipalitiesQuery.fetching ||
      !sunshineDataQuery.data ||
      !operatorMunicipalitiesQuery.data
    ) {
      return null;
    }

    const rawObservations =
      sunshineDataQuery.data.sunshineDataByIndicator?.data || [];
    const median =
      sunshineDataQuery.data.sunshineMedianByIndicator ?? undefined;
    const operatorMunicipalities =
      operatorMunicipalitiesQuery.data.operatorMunicipalities;

    // Create operator index from the observations data
    const uniqueOperators = Array.from(
      new Map(
        rawObservations
          .filter(
            (obs) => obs.operatorId !== null && obs.operatorId !== undefined
          )
          .map((obs) => [
            obs.operatorId?.toString(),
            {
              id: obs.operatorId?.toString(),
              name: obs.name,
              uid: obs.operatorUID,
            },
          ])
      ).values()
    );

    const operatorIndex = indexMapper(
      uniqueOperators,
      (o) => o.id,
      (o) => ({
        id: o.id,
        name: o.name,
        uid: o.uid || o.id,
      })
    );
    // Enrich observations with operator data
    const enrichedObservations = rawObservations.map((observation) => ({
      ...observation,
      operatorData: observation.operatorId
        ? operatorIndex.get(observation.operatorId.toString())
        : undefined,
    }));

    // Pre-compute groupings for efficient access
    const observationsByOperator = group(
      enrichedObservations,
      (obs) => obs.operatorId?.toString() || ""
    );

    return {
      observations: enrichedObservations,
      observationsByOperator,
      operatorMunicipalities,
      operatorIndex,
      median,
    };
  }, [
    enabled,
    sunshineDataQuery.data,
    sunshineDataQuery.fetching,
    operatorMunicipalitiesQuery.data,
    operatorMunicipalitiesQuery.fetching,
  ]);

  return {
    data: enrichedData,
    fetching:
      sunshineDataQuery.fetching || operatorMunicipalitiesQuery.fetching,
    error: sunshineDataQuery.error || operatorMunicipalitiesQuery.error,
    sunshineDataQuery: {
      fetching: sunshineDataQuery.fetching,
      error: sunshineDataQuery.error,
      data: sunshineDataQuery.data,
    },
    operatorMunicipalitiesQuery: {
      fetching: operatorMunicipalitiesQuery.fetching,
      error: operatorMunicipalitiesQuery.error,
      data: operatorMunicipalitiesQuery.data,
    },
  };
};

export type UseEnrichedSunshineDataResult = ReturnType<
  typeof useEnrichedSunshineData
>;
export type EnrichedSunshineData = NonNullable<
  UseEnrichedSunshineDataResult["data"]
>;
export type EnrichedSunshineObservation =
  EnrichedSunshineData["observations"][number];
