import { Feature, FeatureCollection, MultiLineString } from "geojson";
import { useEffect, useState } from "react";
import {
  feature as topojsonFeature,
  mesh as topojsonMesh,
} from "topojson-client";

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

type FetchDataState<T> =
  | {
      state: "fetching";
    }
  | {
      state: "error";
    }
  | ({
      state: "loaded";
    } & T);

type GeoDataState = FetchDataState<GeoData>;

type GeoData = {
  state: "loaded";
  cantons: FeatureCollection;
  municipalities: FeatureCollection;
  municipalityMesh: MultiLineString;
  cantonMesh: MultiLineString;
  lakes: FeatureCollection | Feature;
};

export const useGeoData = (year: string) => {
  const [geoData, setGeoData] = useState<GeoDataState>({ state: "fetching" });
  useEffect(() => {
    const load = async () => {
      try {
        const geoData = await fetchGeoData(year);
        setGeoData({
          state: "loaded",
          ...geoData,
        });
      } catch {
        setGeoData({ state: "error" });
      }
    };
    load();
  }, [year]);
  return geoData;
};
