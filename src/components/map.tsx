import { MapController, WebMercatorViewport } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { Trans } from "@lingui/macro";
import centroid from "@turf/centroid";
import { color, extent, group, mean, rollup } from "d3";
import { ScaleThreshold } from "d3-scale";
import { string } from "io-ts";
import { memoize } from "lodash";
import React, {
  createContext,
  Dispatch,
  Fragment,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Box, Flex, Grid, Text } from "theme-ui";
import {
  feature as topojsonFeature,
  mesh as topojsonMesh,
} from "topojson-client";
import { Entity } from "../domain/data";
import { useFormatCurrency } from "../domain/helpers";
import { OperatorObservationFieldsFragment } from "../graphql/queries";
import { maxBy } from "../lib/array";
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
  if (viewState.width < padding * 2 || viewState.height < padding * 2) {
    return viewState;
  }

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
  <Flex
    sx={{
      width: "100%",
      height: "100%",
      color: "hint",
      margin: "auto",
      textAlign: "center",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
      position: "relative",
    }}
  >
    <Box sx={{ bg: "mutedTransparent", borderRadius: "bigger", p: 2 }}>
      {children}
    </Box>
  </Flex>
);

type GeoDataStateLoaded = {
  state: "loaded";
  cantons: GeoJSON.FeatureCollection;
  municipalities: GeoJSON.FeatureCollection;
  municipalityMesh: GeoJSON.MultiLineString;
  cantonMesh: GeoJSON.MultiLineString;
  lakes: GeoJSON.FeatureCollection | GeoJSON.Feature;
};

type GeoDataState =
  | {
      state: "fetching";
    }
  | {
      state: "error";
    }
  | GeoDataStateLoaded;

export type HighlightValue = {
  entity: Entity;
  id: string;
  label: string;
  value: number;
};

export const HighlightContext = createContext({
  value: undefined as HighlightValue | undefined,
  setValue: (() => undefined) as Dispatch<
    SetStateAction<HighlightValue | undefined>
  >,
});

type HoverState =
  | {
      x: number;
      y: number;
      id: string;
      type: "municipality";
    }
  | {
      x: number;
      y: number;
      id: string;
      type: "canton";
      value: number;
      label: string;
    };

export const ChoroplethMap = ({
  year,
  observations,
  observationsQueryFetching,
  medianValue,
  municipalities,
  colorScale,
  onMunicipalityLayerClick,
}: {
  year: string;
  observations: OperatorObservationFieldsFragment[];
  observationsQueryFetching: boolean;
  medianValue: number | undefined;
  municipalities: { id: string; name: string }[];
  colorScale: ScaleThreshold<number, string> | undefined | 0;
  onMunicipalityLayerClick: (_item: { object: any }) => void;
}) => {
  const [geoData, setGeoData] = useState<GeoDataState>({ state: "fetching" });
  const [hovered, setHovered] = useState<HoverState>();

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
        const topo = await import(
          `swiss-maps/${parseInt(year, 10) - 1}/ch-combined.json`
        );

        const municipalities = topojsonFeature(
          topo,
          topo.objects.municipalities
        );
        const cantons = topojsonFeature(topo, topo.objects.cantons);
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
          municipalities: municipalities as Extract<
            typeof municipalities,
            { features: any }
          >,
          cantons: cantons as Extract<typeof cantons, { features: any }>,
          municipalityMesh,
          cantonMesh,
          lakes,
        });
      } catch {
        setGeoData({ state: "error" });
      }
    };
    load();
  }, [year]);

  const observationsByMunicipalityId = useMemo(() => {
    return group(observations, (d) => d.municipality);
  }, [observations]);

  const municipalityNames = useMemo(() => {
    return rollup(
      municipalities,
      (values) => {
        // FIXME: There is no clear way to distinguish which of the labels should be picked. This case seems only to happen on AbolishedMunicipality classes
        // So for now we just pick the first one.

        // if (values.length > 1) {
        //   console.log("Duplicate munis", values);
        // }
        return values[0];
      },
      (d) => d.id
    );
  }, [municipalities]);

  useEffect(() => {
    if (geoData.state === "loaded" && observationsByMunicipalityId.size > 0) {
      __debugCheckObservationsWithoutShapes(
        observationsByMunicipalityId,
        geoData.municipalities as GeoJSON.FeatureCollection
      );
    }
  }, [geoData, observationsByMunicipalityId]);

  const formatNumber = useFormatCurrency();

  const getColor = (v: number | undefined, highlighted: boolean) => {
    if (v === undefined) {
      return [0, 0, 0];
    }
    const c = colorScale && colorScale(v);
    const rgb =
      c &&
      color(c)
        ?.darker(highlighted ? 1 : 0)
        ?.rgb();
    return rgb ? [rgb.r, rgb.g, rgb.b] : [0, 0, 0];
  };

  const { value: highlightContext } = useContext(HighlightContext);

  const indexes = useMemo(() => {
    if (geoData.state !== "loaded") {
      return;
    }
    const municipalities = geoData?.municipalities;
    const cantons = geoData?.cantons;
    return {
      municipalities: new Map(
        municipalities?.features.map((x) => [x.id, x]) ?? []
      ),
      cantons: new Map(cantons?.features.map((x) => [x.id, x]) ?? []),
    };
  }, [geoData]);

  // Syncs highlight context (coming from the right list hover) with hovered
  useEffect(() => {
    if (!indexes || !highlightContext) {
      setHovered(undefined);
      return;
    }
    const vp = new WebMercatorViewport(viewState);
    const type = highlightContext.entity;
    if (type === "operator") {
      return;
    }
    const index =
      type === "canton"
        ? indexes.cantons
        : type === "municipality"
        ? indexes.municipalities
        : undefined;
    const entity = index?.get(parseInt(highlightContext.id, 10));
    if (!entity) {
      return;
    }
    const center = centroid(entity as Parameters<typeof centroid>[0]);
    const projected = vp.project(
      center.geometry.coordinates as [number, number]
    );
    const newHoverState: HoverState =
      type === "municipality"
        ? {
            x: projected[0],
            y: projected[1],
            id: highlightContext.id,
            type: "municipality",
          }
        : {
            x: projected[0],
            y: projected[1],
            id: highlightContext.id,
            type: "canton",
            label: highlightContext.label,
            value: highlightContext.value,
          };
    setHovered(newHoverState);
  }, [viewState, highlightContext, indexes]);

  const { hoveredMunicipalityName, hoveredObservations, hoveredCanton } =
    useMemo(() => {
      if (!hovered) {
        return {
          hoveredMunicipalityName: undefined,
          hoveredObservations: undefined,
          hoveredCanton: undefined,
        };
      }

      if (hovered.type === "municipality") {
        const hoveredObservations = observationsByMunicipalityId.get(
          hovered.id
        );
        return {
          hoveredMunicipalityName: municipalityNames.get(hovered.id)?.name,
          hoveredObservations,
          hoveredCanton: maxBy(hoveredObservations, (x) => x.period)
            ?.cantonLabel,
        };
      } else {
        return {
          hoveredCanton: hovered.id,
          hoveredObservations: [],
          hoveredMunicipalityName: "",
        };
      }
    }, [hovered]);

  const tooltipContent = hovered
    ? hovered.type === "municipality"
      ? {
          id: hovered.id,
          name: `${hoveredMunicipalityName} ${
            hoveredCanton ? `- ${hoveredCanton}` : ""
          }`,
          observations: observationsByMunicipalityId.get(hovered.id),
        }
      : {
          id: hovered.id,
          name: hovered.label,
          observations: [],
        }
    : undefined;
  const d = extent(observations, (d) => d.value);
  const m = medianValue;

  const getFillColor = useMemo(() => {
    const { entity, id } = highlightContext || {};
    const predicate = entity
      ? (o: OperatorObservationFieldsFragment) => o[entity] === id
      : () => false;
    return (d: $FixMe) => {
      const obs = observationsByMunicipalityId.get(d.id.toString());
      const highlighted = obs?.find(predicate);
      return obs
        ? getColor(
            mean(obs, (d) => d.value),
            !!highlighted
          )
        : [0, 0, 0, 20];
    };
  }, [observationsByMunicipalityId, getColor, highlightContext?.id]);

  return (
    <>
      {geoData.state === "fetching" || observationsQueryFetching ? (
        <HintBox>
          <Loading delayMs={0} />
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
            <Grid
              sx={{
                width: "100%",
                gridTemplateColumns: "1fr auto",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Text variant="meta" sx={{ fontWeight: "bold" }}>
                {tooltipContent.name}
              </Text>
              {hovered.type === "canton" ? (
                <>
                  <Box
                    sx={{
                      borderRadius: "circle",
                      px: 2,
                      display: "inline-block",
                    }}
                    style={{
                      background: colorScale(hovered.value),
                    }}
                  >
                    <Text variant="meta">{formatNumber(hovered.value)}</Text>
                  </Box>
                </>
              ) : null}
            </Grid>
            <Grid
              sx={{
                width: "100%",
                gridTemplateColumns: "1fr auto",
                gap: 1,
                alignItems: "center",
              }}
            >
              {hovered.type === "municipality" ? (
                <>
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
                </>
              ) : null}
            </Grid>
          </MapTooltip>
        )}
        {geoData.state === "loaded" && (
          <WithClassName
            downloadId={DOWNLOAD_ID}
            isFetching={observationsQueryFetching}
          >
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
                up
                id="municipalities"
                data={geoData.municipalities}
                pickable={true}
                stroked={false}
                filled={true}
                extruded={false}
                autoHighlight={true}
                getFillColor={getFillColor}
                highlightColor={[0, 0, 0, 50]}
                getRadius={100}
                getLineWidth={1}
                onHover={({ x, y, object }: $FixMe) => {
                  setHovered(
                    object
                      ? {
                          x: x,
                          y: y,
                          id: object?.id.toString(),
                          type: "municipality",
                        }
                      : undefined
                  );
                }}
                onClick={onMunicipalityLayerClick}
                updateTriggers={{
                  getFillColor: [
                    observationsByMunicipalityId,
                    highlightContext?.id,
                  ],
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
