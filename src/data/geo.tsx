import {
  Feature,
  FeatureCollection,
  MultiLineString,
  MultiPolygon,
  Polygon,
} from "geojson";
import {
  feature as topojsonFeature,
  mesh as topojsonMesh,
} from "topojson-client";

import { useFetch } from "src/data/use-fetch";

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

type CantonFeatureCollection = FeatureCollection<
  Polygon | MultiPolygon,
  { id: string }
>;

export type MunicipalityFeatureCollection = FeatureCollection<
  Polygon | MultiPolygon,
  { id: string }
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
