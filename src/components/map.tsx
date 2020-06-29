import { GeoJsonLayer } from "@deck.gl/layers";
import { MapController } from "@deck.gl/core";
import DeckGL from "@deck.gl/react";
import { useEffect, useMemo, useState } from "react";
import { feature as topojsonFeature } from "topojson-client";

const INITIAL_VIEW_STATE = {
  latitude: 46.8182,
  longitude: 8.2275,
  zoom: 8,
  maxZoom: 16,
  pitch: 0,
  bearing: 0,
};

export const ChoroplethMap = ({ year }: { year: string }) => {
  const [data, setData] = useState<GeoJSON.Feature | undefined>();
  const [hovered, setHovered] = useState();

  useEffect(() => {
    const load = async () => {
      const topo = await fetch(
        `/topojson/${year}/ch-municipalities.json`
      ).then((res) => res.json());
      const geojson = topojsonFeature(topo, topo.objects.municipalities);
      setData(geojson);
    };
    load();
  }, [year]);

  const layer = useMemo(() => {
    return new GeoJsonLayer({
      id: "municipalities",
      data,
      pickable: true,
      stroked: false,
      filled: true,
      extruded: false,
      // lineWidthScale: 20,
      lineWidthMinPixels: 1,
      autoHighlight: true,
      getFillColor: (d) => {
        return [Math.round(Math.random() * 255), 160, 180];
      },
      highlightColor: [0, 0, 0,50],
      getLineColor: [255, 255, 255],
      getRadius: 100,
      getLineWidth: 1,
      onHover: (info) => {
        setHovered(info.object?.id.toString());
      },
    });
  }, [data]);

  return data ? (
    <DeckGL
      controller={{ type: MapController }}
      initialViewState={INITIAL_VIEW_STATE}
      layers={[layer]}
    />
  ) : (
    <div>Loading</div>
  );
};
