import { MapController, WebMercatorViewport } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { color, interpolateRdYlGn } from "d3";
import { group } from "d3-array";
import { ScaleQuantile, ScaleThreshold, ScaleSequential } from "d3-scale";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  feature as topojsonFeature,
  mesh as topojsonMesh,
} from "topojson-client";
import { Observation } from "../graphql/queries";

const INITIAL_VIEW_STATE = {
  latitude: 46.8182,
  longitude: 8.2275,
  zoom: 2,
  maxZoom: 16,
  minZoom: 2,
  pitch: 0,
  bearing: 0,
};

type BBox = [[number, number], [number, number]];

const CH_BBOX: BBox = [
  [5.956800664952974, 45.81912371940225],
  [10.493446773955753, 47.80741209797084],
];

/**
 * Constrain the viewState to always _contain_ the supplied bbox.
 *
 * (Other implementations ensure that the bbox _covers_ the viewport)
 *
 * @param viewState deck.gl viewState
 * @param bbox Bounding box of the feature to be contained
 */
const constrainZoom = (
  viewState: $FixMe,
  bbox: BBox,
  { padding = 100 }: { padding?: number } = {}
) => {
  const vp = new WebMercatorViewport(viewState);

  const { width, height, zoom, longitude, latitude } = viewState;

  const [x, y] = vp.project([longitude, latitude]);
  const [x0, y1] = vp.project(bbox[0]);
  const [x1, y0] = vp.project(bbox[1]);

  const fitted = vp.fitBounds(bbox, { padding });

  const [cx, cy] = vp.project([fitted.longitude, fitted.latitude]);

  const h = height - padding * 2;
  const w = width - padding * 2;

  const h2 = h / 2;
  const w2 = w / 2;

  const y2 =
    y1 - y0 < h ? cy : y - h2 < y0 ? y0 + h2 : y + h2 > y1 ? y1 - h2 : y;
  const x2 =
    x1 - x0 < w ? cx : x - w2 < x0 ? x0 + w2 : x + w2 > x1 ? x1 - w2 : x;

  const p = vp.unproject([x2, y2]);

  return {
    ...viewState,
    transitionDuration: 0,
    transitionInterpolator: null,
    zoom: Math.max(zoom, fitted.zoom),
    longitude: p[0],
    latitude: p[1],
  };
};

/**
 * Simple fitZoom to bbox
 * @param viewState deck.gl viewState
 */
// const fitZoom = (viewState: $FixMe, bbox: BBox) => {
//   const vp = new WebMercatorViewport(viewState);
//   const fitted = vp.fitBounds(bbox);

//   return {
//     ...viewState,
//     ...fitted,
//   };
// };

export const ChoroplethMap = ({
  year,
  observations,
  colorScale,
}: {
  year: string;
  observations: Observation[];
  colorScale: ScaleThreshold<number, string> | undefined | 0;
}) => {
  const [data, setData] = useState<
    | {
        municipalities: GeoJSON.Feature;
        municipalityMesh: GeoJSON.MultiLineString;
        cantons: GeoJSON.Feature;
        lakes: GeoJSON.Feature;
      }
    | undefined
  >();
  const [hovered, setHovered] = useState<string>();

  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  const onViewStateChange = useCallback(({ viewState, interactionState }) => {
    if (interactionState.inTransition) {
      setViewState(viewState);
    } else {
      setViewState(constrainZoom(viewState, CH_BBOX));
    }
  }, []);

  const onResize = useCallback(
    ({ width, height }) => {
      setViewState((viewState) =>
        constrainZoom({ ...viewState, width, height }, CH_BBOX)
      );
    },
    [setViewState]
  );

  useEffect(() => {
    const load = async () => {
      const topo = await fetch(
        `/topojson/ch-${parseInt(year, 10) - 1}.json`
      ).then((res) => res.json());
      const municipalities = topojsonFeature(topo, topo.objects.municipalities);
      const municipalityMesh = topojsonMesh(
        topo,
        topo.objects.municipalities,
        (a, b) => a !== b
      );
      const cantons = topojsonFeature(topo, topo.objects.cantons);
      const lakes = topojsonFeature(topo, topo.objects.lakes);
      setData({ municipalities, municipalityMesh, cantons, lakes });
    };
    load();
  }, [year]);

  const observationsByMunicipalityId = useMemo(() => {
    return group(observations, (d) =>
      d.municipality!.replace(
        "http://classifications.data.admin.ch/municipality/",
        ""
      )
    );
  }, [observations]);

  useEffect(() => {
    if (hovered) {
      console.log(observationsByMunicipalityId.get(hovered));
    }
  }, [hovered]);

  const getColor = (v: number) => {
    const c = colorScale && colorScale(v);
    const rgb = c && color(c)?.rgb();
    return rgb ? [rgb.r, rgb.g, rgb.b] : [0, 0, 0];
  };

  return (
    <>
      <div>{!data && <span>Loading map</span>}</div>

      {data ? (
        <DeckGL
          controller={{ type: MapController }}
          viewState={viewState}
          onViewStateChange={onViewStateChange}
          onResize={onResize}
        >
          <GeoJsonLayer
            id="municipalities"
            data={data.municipalities}
            pickable={true}
            stroked={false}
            filled={true}
            extruded={false}
            lineWidthScale={20}
            lineWidthMinPixels={0.5}
            autoHighlight={true}
            getFillColor={(d: $FixMe) => {
              const obs = observationsByMunicipalityId.get(
                d.id.toString()
              )?.[0];
              return obs ? getColor(obs.value) : [0, 0, 0, 20];
            }}
            highlightColor={[0, 0, 0, 50]}
            getLineColor={[255, 255, 255, 50]}
            getRadius={100}
            getLineWidth={1}
            onHover={({ layer, object }: $FixMe) => {
              setHovered(object?.id.toString());
            }}
            onClick={({ layer, object }: $FixMe) => {
              // if (object) {
              //   const { viewport } = layer.context;
              //   const bounds = geoBounds(object);
              //   const { zoom, longitude, latitude } = viewport.fitBounds(
              //     bounds
              //   );
              //   setViewState((oldViewState) => ({
              //     ...oldViewState,
              //     zoom,
              //     latitude,
              //     longitude,
              //     transitionDuration: 1000,
              //     transitionInterpolator: new FlyToInterpolator(),
              //   }));
              // }
            }}
            updateTriggers={{ getFillColor: [observationsByMunicipalityId] }}
          />
          <GeoJsonLayer
            id="municipality-mesh"
            data={data.municipalityMesh}
            pickable={false}
            stroked={true}
            filled={false}
            extruded={false}
            lineWidthMinPixels={0.6}
            lineWidthMaxPixels={1}
            lineMiterLimit={1}
            getLineColor={[255, 255, 255, 100]}
          />
          <GeoJsonLayer
            id="cantons"
            data={data.cantons}
            pickable={false}
            stroked={true}
            filled={false}
            extruded={false}
            lineWidthMinPixels={1.2}
            lineWidthMaxPixels={1.2}
            lineMiterLimit={1}
            getLineColor={[255, 255, 255]}
          />
          <GeoJsonLayer
            id="lakes"
            data={data.lakes}
            pickable={false}
            stroked={true}
            filled={true}
            extruded={false}
            lineWidthMinPixels={0.5}
            getLineWidth={0.5}
            getFillColor={[102, 175, 233]}
            getLineColor={[255, 255, 255, 100]}
          />
        </DeckGL>
      ) : null}
    </>
  );
};
