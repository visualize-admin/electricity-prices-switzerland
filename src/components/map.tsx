import { MapController, WebMercatorViewport } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { Trans } from "@lingui/macro";
import { color, extent, group, mean } from "d3";
import { ScaleThreshold } from "d3-scale";
import { useRouter } from "next/router";
import {
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Box, Grid, Text } from "theme-ui";
import {
  feature as topojsonFeature,
  mesh as topojsonMesh,
} from "topojson-client";
import { useFormatCurrency } from "../domain/helpers";
import { OperatorObservationFieldsFragment } from "../graphql/queries";
import { TooltipBoxWithoutChartState } from "./charts-generic/interaction/tooltip-box";
import { WithClassName } from "./detail-page/with-classname";
import { Loading, NoDataHint, NoGeoDataHint } from "./hint";
import { MapPriceColorLegend } from "./price-color-legend";

const DOWNLOAD_ID = "map";

const INITIAL_VIEW_STATE = {
  latitude: 46.8182,
  longitude: 8.2275,
  zoom: 2,
  maxZoom: 16,
  minZoom: 2,
  pitch: 0,
  bearing: 0,
};

const LINE_COLOR = [100, 100, 100, 127] as const;

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
  { padding = 24 }: { padding?: number } = {}
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

const __debugCheckObservationsWithoutShapes = (
  observationsByMunicipalityId: Map<
    string,
    OperatorObservationFieldsFragment[]
  >,
  feature: GeoJSON.FeatureCollection
) => {
  const observationIds = new Set(observationsByMunicipalityId.keys());
  const featureIds = new Set(
    feature.features.flatMap((f) => (f.id ? [f.id.toString()] : []))
  );

  if (observationIds.size !== featureIds.size) {
    const obsWithoutFeatures = [...observationIds].filter(
      (id) => !featureIds.has(id)
    );

    if (obsWithoutFeatures.length > 0) {
      console.log("Obervations without features", obsWithoutFeatures);
    }

    const featuresWithoutObs = [...featureIds].filter(
      (id) => !observationIds.has(id)
    );

    if (featuresWithoutObs.length > 0) {
      console.log("Features without observations", featuresWithoutObs);
    }
  } else {
    console.log("Obervations vs. Features OK");
  }
};

const MapTooltip = ({
  x,
  y,
  children,
}: {
  x: number;
  y: number;
  children: ReactNode;
}) => {
  return (
    <TooltipBoxWithoutChartState
      x={x}
      y={y - 20}
      placement={{ x: "center", y: "top" }}
      margins={{ bottom: 0, left: 0, right: 0, top: 0 }}
    >
      <Box sx={{ width: 200 }}>{children}</Box>
    </TooltipBoxWithoutChartState>
  );
};

const HintBox = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      width: "100%",
      height: "100%",
      zIndex: 1,
      position: "relative",
    }}
  >
    {children}
  </Box>
);

type GeoDataState =
  | {
      state: "fetching";
    }
  | {
      state: "error";
    }
  | {
      state: "loaded";
      municipalities: GeoJSON.FeatureCollection | GeoJSON.Feature;
      municipalityMesh: GeoJSON.MultiLineString;
      cantonMesh: GeoJSON.MultiLineString;
      lakes: GeoJSON.FeatureCollection | GeoJSON.Feature;
    };

export const ChoroplethMap = ({
  year,
  observations,
  observationsQueryFetching,
  medianValue,
  colorScale,
}: {
  year: string;
  observations: OperatorObservationFieldsFragment[];
  observationsQueryFetching: boolean;
  medianValue: number | undefined;
  colorScale: ScaleThreshold<number, string> | undefined | 0;
}) => {
  const { push, query } = useRouter();
  const [geoData, setGeoData] = useState<GeoDataState>({ state: "fetching" });
  const [hovered, setHovered] = useState<{
    x: number;
    y: number;
    id: string;
  }>();

  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  const onViewStateChange = useCallback(({ viewState, interactionState }) => {
    setHovered(undefined);

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
      try {
        const res = await fetch(`/topojson/ch-${parseInt(year, 10) - 1}.json`);
        const topo = await res.json();

        const municipalities = topojsonFeature(
          topo,
          topo.objects.municipalities
        );
        const municipalityMesh = topojsonMesh(
          topo,
          topo.objects.municipalities,
          (a, b) => a !== b
        );
        const cantonMesh = topojsonMesh(
          topo,
          topo.objects.cantons
          // (a, b) => a !== b
        );
        const lakes = topojsonFeature(topo, topo.objects.lakes);
        setGeoData({
          state: "loaded",
          municipalities,
          municipalityMesh,
          cantonMesh,
          lakes,
        });
      } catch (e) {
        setGeoData({ state: "error" });
      }
    };
    load();
  }, [year]);

  const observationsByMunicipalityId = useMemo(() => {
    return group(observations, (d) => d.municipality);
  }, [observations]);

  useEffect(() => {
    if (geoData.state === "loaded" && observationsByMunicipalityId.size > 0) {
      __debugCheckObservationsWithoutShapes(
        observationsByMunicipalityId,
        geoData.municipalities as GeoJSON.FeatureCollection
      );
    }
  }, [geoData, observationsByMunicipalityId]);

  const formatNumber = useFormatCurrency();

  const getColor = (v: number | undefined) => {
    if (v === undefined) {
      return [0, 0, 0];
    }
    const c = colorScale && colorScale(v);
    const rgb = c && color(c)?.rgb();
    return rgb ? [rgb.r, rgb.g, rgb.b] : [0, 0, 0];
  };

  const tooltipContent = hovered
    ? {
        id: hovered.id,
        name: observationsByMunicipalityId.get(hovered.id)?.[0]
          ?.municipalityLabel,
        observations: observationsByMunicipalityId.get(hovered.id),
      }
    : undefined;
  const d = extent(observations, (d) => d.value);
  const m = medianValue;
  return (
    <>
      {geoData.state === "fetching" || observationsQueryFetching ? (
        <HintBox>
          <Loading />
        </HintBox>
      ) : observations.length === 0 ? (
        <HintBox>
          <NoDataHint />
        </HintBox>
      ) : geoData.state === "error" ? (
        <HintBox>
          <NoGeoDataHint />
        </HintBox>
      ) : null}
      <>
        {hovered && tooltipContent && colorScale && (
          <MapTooltip x={hovered.x} y={hovered.y}>
            <Text variant="meta" sx={{ fontWeight: "bold", mb: 2 }}>
              {tooltipContent.name}
            </Text>
            <Grid
              sx={{
                width: "100%",
                gridTemplateColumns: "1fr auto",
                gap: 1,
                alignItems: "center",
              }}
            >
              {tooltipContent.observations ? (
                tooltipContent.observations.map((d, i) => {
                  return (
                    <Fragment key={i}>
                      <Text variant="meta" sx={{}}>
                        {d.operatorLabel}
                      </Text>
                      <Box
                        sx={{
                          borderRadius: "circle",
                          px: 2,
                          display: "inline-block",
                        }}
                        style={{ background: colorScale(d.value) }}
                      >
                        <Text variant="meta">{formatNumber(d.value)}</Text>
                      </Box>
                    </Fragment>
                  );
                })
              ) : (
                <Text variant="meta" sx={{ color: "secondary" }}>
                  <Trans id="map.tooltipnodata">Keine Daten</Trans>
                </Text>
              )}
            </Grid>
          </MapTooltip>
        )}

        {geoData.state === "loaded" && (
          <WithClassName downloadId={DOWNLOAD_ID}>
            <Box
              sx={{
                zIndex: 13,
                position: "absolute",
                top: 0,
                left: 0,
                mt: 3,
                ml: 3,
              }}
            >
              <MapPriceColorLegend stats={[d[0], m, d[1]]} />
            </Box>

            <DeckGL
              controller={{ type: MapController }}
              viewState={viewState}
              onViewStateChange={onViewStateChange}
              onResize={onResize}
            >
              <GeoJsonLayer
                id="municipalities"
                data={geoData.municipalities}
                pickable={true}
                stroked={false}
                filled={true}
                extruded={false}
                autoHighlight={true}
                getFillColor={(d: $FixMe) => {
                  const obs = observationsByMunicipalityId.get(d.id.toString());
                  return obs
                    ? getColor(mean(obs, (d) => d.value))
                    : [0, 0, 0, 20];
                }}
                highlightColor={[0, 0, 0, 50]}
                getRadius={100}
                getLineWidth={1}
                onHover={({ x, y, object }: $FixMe) => {
                  setHovered(
                    object
                      ? { x: x, y: y, id: object?.id.toString() }
                      : undefined
                  );
                }}
                onClick={({ layer, object }: $FixMe) => {
                  const href = {
                    pathname: `/municipality/[id]`,
                    query: {
                      ...query,
                      id: object?.id.toString(),
                    },
                  };
                  push(href);
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
                updateTriggers={{
                  getFillColor: [observationsByMunicipalityId],
                }}
              />
              <GeoJsonLayer
                id="municipality-mesh"
                data={geoData.municipalityMesh}
                pickable={false}
                stroked={true}
                filled={false}
                extruded={false}
                lineWidthMinPixels={0.5}
                lineWidthMaxPixels={1}
                getLineWidth={100}
                lineMiterLimit={1}
                getLineColor={LINE_COLOR}
              />
              <GeoJsonLayer
                id="lakes"
                data={geoData.lakes}
                pickable={false}
                stroked={true}
                filled={true}
                extruded={false}
                lineWidthMinPixels={0.5}
                lineWidthMaxPixels={1}
                getLineWidth={100}
                getFillColor={[102, 175, 233]}
                getLineColor={LINE_COLOR}
              />
              <GeoJsonLayer
                id="cantons"
                data={geoData.cantonMesh}
                pickable={false}
                stroked={true}
                filled={false}
                extruded={false}
                lineWidthMinPixels={1.2}
                lineWidthMaxPixels={3.6}
                getLineWidth={200}
                lineMiterLimit={1}
                getLineColor={[120, 120, 120]}
              />
            </DeckGL>
          </WithClassName>
        )}
      </>
    </>
  );
};
