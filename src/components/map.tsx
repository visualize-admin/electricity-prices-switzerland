import { MapController } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { color, interpolateRdYlGn } from "d3";
import { group } from "d3-array";
import { scaleQuantile } from "d3-scale";
import { useEffect, useMemo, useState } from "react";
import { feature as topojsonFeature } from "topojson-client";
import { Observation, useObservationsQuery } from "../graphql/queries";

const INITIAL_VIEW_STATE = {
  latitude: 46.8182,
  longitude: 8.2275,
  zoom: 8,
  maxZoom: 16,
  pitch: 0,
  bearing: 0,
};

export const ChoroplethMap = ({
  year,
  category,
}: {
  year: string;
  category: string;
}) => {
  const [data, setData] = useState<GeoJSON.Feature | undefined>();
  const [hovered, setHovered] = useState();

  const [observations] = useObservationsQuery({
    variables: {
      filters: {
        period: [year],
        category: [category],
      },
    },
  });

  useEffect(() => {
    const load = async () => {
      const topo = await fetch(
        `/topojson/ch-${parseInt(year, 10) - 1}.json`
      ).then((res) => res.json());
      const geojson = topojsonFeature(topo, topo.objects.municipalities);
      setData(geojson);
    };
    load();
  }, [year]);

  const empty = useMemo(() => [], []);

  const municipalityObservations = observations.fetching
    ? empty
    : observations.data?.cubeByIri?.observations ?? empty;

  const observationsByMunicipalityId = useMemo(() => {
    return group<Observation, string>(municipalityObservations, (d) =>
      d.municipality.replace(
        "http://classifications.data.admin.ch/municipality/",
        ""
      )
    );
  }, [municipalityObservations]);

  useEffect(() => {
    if (hovered) {
      console.log(observationsByMunicipalityId.get(hovered));
    }
  }, [hovered]);

  const colorScale = scaleQuantile(
    // @ts-ignore
    municipalityObservations.map((d) => d.gridusage),
    [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
  );

  const getColor = (v: number) => {
    const c = interpolateRdYlGn(1 - colorScale(v));
    const rgb = color(c).rgb();
    return [rgb.r, rgb.g, rgb.b];
  };
  // const layer = useMemo(() => {
  //   console.log("new layer",year)
  //   return new GeoJsonLayer({
  //     id: "municipalities"+year,
  //     data,
  //     pickable: true,
  //     stroked: false,
  //     filled: true,
  //     extruded: false,
  //     // lineWidthScale: 20,
  //     lineWidthMinPixels: 1,
  //     autoHighlight: true,
  //     getFillColor: (d) => {
  //       const obs = observationsByMunicipalityId.get(d.id.toString());
  //       return obs ? [Math.round(obs.charge * 50), 160, 180] : [0, 0, 0, 20];
  //     },
  //     highlightColor: [0, 0, 0, 50],
  //     getLineColor: [255, 255, 255],
  //     getRadius: 100,
  //     getLineWidth: 1,
  //     onHover: (info) => {
  //       setHovered(info.object?.id.toString());
  //     },
  //   });
  // }, [year, observationsByMunicipalityId, data]);

  const layerProps = {
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
      const obs = observationsByMunicipalityId.get(d.id.toString())?.[0];
      return obs ? getColor(obs.gridusage) : [0, 0, 0, 20];
    },
    highlightColor: [0, 0, 0, 50],
    getLineColor: [255, 255, 255],
    getRadius: 100,
    getLineWidth: 1,
    onHover: (info) => {
      setHovered(info.object?.id.toString());
    },
    updateTriggers: { getFillColor: [observationsByMunicipalityId] },
  };

  return (
    <>
      <div>
        {!data && <span>Loading map</span>}
        {observations.fetching && <span>Loading observations</span>}
      </div>

      {data ? (
        <DeckGL
          controller={{ type: MapController }}
          initialViewState={INITIAL_VIEW_STATE}
          // layers={[layer]}
        >
          <GeoJsonLayer {...layerProps} />
        </DeckGL>
      ) : null}
    </>
  );
};
