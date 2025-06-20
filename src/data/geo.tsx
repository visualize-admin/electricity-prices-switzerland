import * as turf from "@turf/turf";
import { sort } from "d3";
import {
  Feature,
  FeatureCollection,
  MultiLineString,
  MultiPolygon,
  Polygon,
} from "geojson";
import { groupBy, keyBy } from "lodash";
import {
  feature as topojsonFeature,
  mesh as topojsonMesh,
} from "topojson-client";

import { useFetch } from "src/data/use-fetch";
import { truthy } from "src/lib/truthy";
import { OperatorMunicipalityRecord } from "src/rdf/queries";

const multiGroupBy = <T,>(arr: T[], iter: (item: T) => string[]) => {
  const res: Record<string, T[]> = {};
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const keys = iter(item);
    for (let j = 0; j < keys.length; j++) {
      const key = keys[j];
      if (!res[key]) {
        res[key] = [];
      }
      res[key].push(item);
    }
  }
  return res;
};

const fetchGeoData = async (year: string) => {
  const topo = await import(
    `swiss-maps/${parseInt(year, 10) - 1}/ch-combined.json`
  );
  const municipalities = topojsonFeature(topo, topo.objects.municipalities);
  const cantons = topojsonFeature(topo, topo.objects.cantons);
  const municipalityMesh = topojsonMesh(
    topo,
    topo.objects.municipalities,
    (a, b) => a !== b
  );
  const cantonMesh = topojsonMesh(topo, topo.objects.cantons);
  const lakes = topojsonFeature(topo, topo.objects.lakes);
  return {
    municipalities: municipalities as Extract<
      typeof municipalities,
      { features: $IntentionalAny }
    >,
    cantons: cantons as Extract<typeof cantons, { features: $IntentionalAny }>,
    municipalityMesh,
    cantonMesh,
    lakes,
  };
};

type CantonLayerProperties = { id: string };

type CantonFeatureCollection = FeatureCollection<
  Polygon | MultiPolygon,
  CantonLayerProperties
>;

type MunicipalityLayerProperties = {
  id: string;
};

export type MunicipalityFeatureCollection = FeatureCollection<
  Polygon | MultiPolygon,
  MunicipalityLayerProperties
>;

export type OperatorLayerProperties = {
  municipalities: number[];
  operators: number[];
  type: "OperatorFeature";
};

export type OperatorFeature = Feature<
  MultiPolygon | Polygon,
  OperatorLayerProperties
>;

export const isOperatorFeature = (
  feature: Feature
): feature is OperatorFeature => {
  return (
    feature.type === "Feature" && feature.properties?.type === "OperatorFeature"
  );
};

type OperatorFeatureCollection = FeatureCollection<
  MultiPolygon | Polygon,
  OperatorLayerProperties
>;

type GeoData = {
  cantons: CantonFeatureCollection;
  municipalities: MunicipalityFeatureCollection;
  municipalityMesh: MultiLineString;
  cantonMesh: MultiLineString;
  lakes: FeatureCollection | Feature;
};

const fetchGeoDataOptions = (year: string) => ({
  queryFn: () => fetchGeoData(year),
  key: `geo-data-${year}`,
});

export const useGeoData = (year: string) => {
  return useFetch<GeoData>(fetchGeoDataOptions(year));
};

/**
 * Operators are treated differently than municipalities and cantons as
 * they are not available from swiss-maps, but are derived from the
 * Lindas observations.
 *
 * In the end, the collection contains a feature for each "operator group",
 * which is a group of municipalities that are served by the same operator(s).
 * A municipality can be part of several operator groups if it is served by
 * multiple operators.
 */
export const getOperatorsFeatureCollection = (
  operatorMunicipalities: OperatorMunicipalityRecord[],
  municipalities: MunicipalityFeatureCollection
): OperatorFeatureCollection => {
  if (!operatorMunicipalities || !municipalities)
    return {
      type: "FeatureCollection",
      features: [],
    };

  const operatorsByMunicipality = groupBy(
    operatorMunicipalities,
    "municipality"
  );
  const municipalitySet = Array.from(
    new Set(operatorMunicipalities.map((x) => x.municipality))
  );

  // Group municipalities by operator, a municipality will be part of several groups if it
  // has several operators, the groups are sorted so that the multiple operators are last
  // Example: Kilchberg is served by EWL and EWA, it will be part of 3 groups
  // EWL, EWA, EWL/EWA
  const municipalitiesByOperators = multiGroupBy(municipalitySet, (x) => {
    const operatorIds = operatorsByMunicipality[x].map((x) => x.operator);
    const all = sort(operatorIds).join("/");
    return [...operatorIds, all];
  });

  const municipalitiesById = keyBy(municipalities.features, "id");
  const operatorFeatures = Object.entries(municipalitiesByOperators)
    .map(([operators, municipalities_]) => {
      const municipalities = Array.from(new Set(municipalities_));
      // Get geometry features for all municipalities of this operator
      const municipalityFeatures = municipalities
        .map((muni) => municipalitiesById[muni])
        .filter(Boolean);

      if (municipalityFeatures.length === 0) {
        console.warn(
          `No geometry found for operator ${operators} with municipalities: ${municipalities
            .map((m) => m)
            .join(", ")}`
        );
        return null;
      }
      const featureCollection = turf.featureCollection(
        municipalityFeatures.map((feat) =>
          turf.feature(feat.geometry as Polygon | MultiPolygon)
        )
      );

      const geometry =
        municipalityFeatures.length > 1
          ? turf.union(featureCollection)?.geometry
          : featureCollection.features[0].geometry;

      if (!geometry) {
        return null;
      }
      return {
        type: "Feature" as const,
        properties: {
          type: "OperatorFeature" as const,
          operators: operators.split("/").map((x) => parseInt(x, 10)),
          municipalities: municipalities,
        },
        geometry: geometry,
      };
    })
    .filter(truthy);

  // Create the final GeoJSON
  return {
    type: "FeatureCollection",
    features: operatorFeatures,
  };
};
