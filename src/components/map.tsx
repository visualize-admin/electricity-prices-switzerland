import { GeoJsonLayer } from "@deck.gl/layers";
import { MapController } from "@deck.gl/core";
import DeckGL from "@deck.gl/react";
import { useEffect, useMemo, useState } from "react";
import { feature as topojsonFeature } from "topojson-client";
import { useObservationsQuery, Observation } from "../graphql/queries";
import { group } from "d3-array";

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

  const [observations] = useObservationsQuery({
    variables: {
      filters: {
        period: [(parseInt(year, 10) + 1).toString()],
        category: [
          "https://energy.ld.admin.ch/elcom/energy-pricing/category/H4",
        ],
      },
    },
  });

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
      return obs ? [Math.round(obs.charge * 50), 160, 180] : [0, 0, 0, 20];
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
