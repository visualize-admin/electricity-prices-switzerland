import { group } from "d3";
import { useMemo } from "react";

import { useFetch } from "src/data/use-fetch";
import { ElectricityCategory } from "src/domain/data";
import { NetworkLevel } from "src/domain/sunshine";
import { useSunshineDataByIndicatorQuery } from "src/graphql/queries";
import { indexMapper } from "src/lib/array";
import { getOperatorsMunicipalities } from "src/rdf/queries";

interface UseEnrichedSunshineDataParams {
  filter: {
    period: string;
    peerGroup?: string;
    indicator: string;
    typology?: string;
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
  const { period, peerGroup, indicator, typology, networkLevel, category } =
    filter;

  // Fetch sunshine data
  const [sunshineDataQuery] = useSunshineDataByIndicatorQuery({
    variables: {
      filter: {
        period,
        peerGroup: peerGroup === "all_grid_operators" ? undefined : peerGroup,
        indicator,
        typology,
        networkLevel,
        category,
      },
    },
    pause: !enabled,
  });

  // Fetch operator municipalities data for the electricity category C2
  // This is needed to link operators with their geographic areas
  // Note: useFetch doesn't support enabled parameter, so we handle it in the component logic
  const electricityCategory = "C2" as const;
  const operatorMunicipalitiesResult = useFetch({
    key: `operator-municipalities-${period}-${electricityCategory}`,
    queryFn: () => getOperatorsMunicipalities(period, electricityCategory),
  });

  // Memoized enriched data computation
  const enrichedData = useMemo(() => {
    // Return null if data is not available or queries are still fetching, or if disabled
    if (
      !enabled ||
      sunshineDataQuery.fetching ||
      operatorMunicipalitiesResult.state === "fetching" ||
      !sunshineDataQuery.data ||
      !operatorMunicipalitiesResult.data
    ) {
      return null;
    }

    const rawObservations =
      sunshineDataQuery.data.sunshineDataByIndicator?.data || [];
    const median =
      sunshineDataQuery.data.sunshineDataByIndicator?.median ?? undefined;
    const operatorMunicipalities = operatorMunicipalitiesResult.data;

    // Create operator index from the observations data
    const uniqueOperators = Array.from(
      new Map(
        rawObservations
          .filter(
            (obs) => obs.operatorId !== null && obs.operatorId !== undefined
          )
          .map((obs) => [
            obs.operatorId!.toString(),
            {
              id: obs.operatorId!.toString(),
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
    operatorMunicipalitiesResult.data,
    operatorMunicipalitiesResult.state,
  ]);

  return {
    data: enrichedData,
    fetching:
      sunshineDataQuery.fetching ||
      operatorMunicipalitiesResult.state === "fetching",
    error:
      sunshineDataQuery.error ||
      (operatorMunicipalitiesResult.state === "error"
        ? new Error(String(operatorMunicipalitiesResult.error))
        : undefined),
    sunshineDataQuery: {
      fetching: sunshineDataQuery.fetching,
      error: sunshineDataQuery.error,
      data: sunshineDataQuery.data,
    },
    operatorMunicipalitiesResult,
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
