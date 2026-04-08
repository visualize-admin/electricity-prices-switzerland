import { simplify } from "@turf/turf";
import { useMemo } from "react";

import {
  getOperatorsFeatureCollection,
  MunicipalityFeatureCollection,
  useGeoData,
} from "src/data/geo";
import { useOperatorMunicipalitiesQuery } from "src/graphql/queries";

interface UseOperatorFeatureCollectionOptions {
  period: string;
  electricityCategory?: string;
  networkLevel?: string;
  pause?: boolean;
}

/**
 * Hook to get operator feature collection (geojson) for map visualization.
 *
 * Combines operator-municipality relationships from GraphQL with municipality
 * geometry data to create operator territory features for map rendering.
 * Applies geometry simplification using turf to improve rendering performance.
 *
 * Used by both sunshine map and energy prices map when displaying operator data.
 */
export function useOperatorFeatureCollection({
  period,
  electricityCategory,
  networkLevel,
  pause = false,
}: UseOperatorFeatureCollectionOptions) {
  // Fetch operator-municipality relationships
  const [operatorMunicipalitiesQuery] = useOperatorMunicipalitiesQuery({
    variables: {
      period,
      electricityCategory,
      networkLevel,
    },
    pause,
  });

  // Fetch municipality geometry data
  const geoData = useGeoData(period);

  // Compute operator feature collection from the two data sources
  const operatorFeatureCollection = useMemo(() => {
    if (
      !operatorMunicipalitiesQuery.data?.operatorMunicipalities ||
      geoData.state !== "loaded" ||
      !geoData.data?.municipalities
    ) {
      return {
        type: "FeatureCollection" as const,
        features: [],
        state: "loading" as const,
      };
    }

    const featureCollection = getOperatorsFeatureCollection(
      operatorMunicipalitiesQuery.data.operatorMunicipalities,
      geoData.data.municipalities as MunicipalityFeatureCollection,
    );

    // Simplify the feature collection with turf to reduce complexity
    const simplifiedFeatureCollection = simplify(featureCollection, {
      tolerance: 0.003,
    });

    return {
      ...simplifiedFeatureCollection,
      state: "loaded" as const,
    };
  }, [
    operatorMunicipalitiesQuery.data?.operatorMunicipalities,
    geoData.state,
    geoData.data?.municipalities,
  ]);

  return {
    data: operatorFeatureCollection,
    fetching:
      operatorMunicipalitiesQuery.fetching || geoData.state === "fetching",
    error:
      operatorMunicipalitiesQuery.error ||
      (geoData.state === "error" ? geoData.error : null),
  };
}
