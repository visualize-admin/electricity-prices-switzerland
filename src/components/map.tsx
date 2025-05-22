import {
  Deck,
  MapController,
  PickingInfo,
  WebMercatorViewport,
} from "@deck.gl/core/typed";
import { ViewStateChangeParameters } from "@deck.gl/core/typed/controllers/controller";
import { GeoJsonLayer } from "@deck.gl/layers/typed";
import DeckGL, { DeckGLRef } from "@deck.gl/react/typed";
import { Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import centroid from "@turf/centroid";
import { extent, group, mean, rollup, ScaleThreshold } from "d3";
import html2canvas from "html2canvas";
import React, {
  ComponentProps,
  Fragment,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

import { TooltipBoxWithoutChartState } from "src/components/charts-generic/interaction/tooltip-box";
import { WithClassName } from "src/components/detail-page/with-classname";
import { HighlightContext } from "src/components/highlight-context";
import { Loading, NoDataHint, NoGeoDataHint } from "src/components/hint";
import { getFillColor } from "src/components/map-helpers";
import { MapPriceColorLegend } from "src/components/price-color-legend";
import { useGeoData } from "src/data/geo";
import { useFormatCurrency } from "src/domain/helpers";
import { OperatorObservationFieldsFragment } from "src/graphql/queries";
import { maxBy } from "src/lib/array";

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

const LINE_COLOR = [255, 255, 255, 255] as [number, number, number, number];

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
  { padding = 150 }: { padding?: number } = {}
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
      <Box
        sx={{ width: 200, flexDirection: "column", gap: 1 }}
        display={"flex"}
      >
        {children}
      </Box>
    </TooltipBoxWithoutChartState>
  );
};

const HintBox = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      width: "100%",
      height: "100%",
      color: "hint.main",
      margin: "auto",
      textAlign: "center",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
      position: "relative",
    }}
    display="flex"
  >
    <Box sx={{ bgcolor: "muted.transparent", borderRadius: "bigger", p: 2 }}>
      {children}
    </Box>
  </Box>
);

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

const toBlob = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type);
  });

const SCREENSHOT_IMAGE_SIZE = {
  width: 1120,
  height: 928,
};

const SCREENSHOT_CANVAS_SIZE = {
  width: 1120,
  height: 730,
};

/**
 * Get the map as an image, using the Deck.gl canvas and html2canvas to get
 * the legend as an image.
 */
const getImageData = async (deck: Deck, legend: HTMLElement) => {
  if (!deck || "canvas" in deck === false) {
    return;
  }

  // @ts-expect-error canvas is private
  const canvas = deck.canvas;
  if (!canvas) {
    return;
  }

  const initialSize = {
    width: canvas.width,
    height: canvas.height,
  };

  const imageSize = {
    width: SCREENSHOT_IMAGE_SIZE.width * 2,
    height: SCREENSHOT_IMAGE_SIZE.height * 2,
  };
  const canvasSize = {
    width: SCREENSHOT_CANVAS_SIZE.width * 2,
    height: SCREENSHOT_CANVAS_SIZE.height * 2,
  };

  Object.assign(canvas, canvasSize);
  deck.redraw("New size");

  const newCanvas = document.createElement("canvas");
  newCanvas.width = imageSize.width;
  newCanvas.height = imageSize.height;
  const context = newCanvas.getContext("2d");
  if (!context) {
    return;
  }

  // Using html2canvas, take the legend element, and draw it on the new canvas
  // Make a new canvas element to convert the image to a png
  // We need a new canvas since we will draw the legend onto it
  context.fillStyle = "white";
  context.fillRect(0, 0, newCanvas.width, newCanvas.height);

  const ratio = window.devicePixelRatio;
  context.drawImage(
    canvas,
    (newCanvas.width - canvas.width) / 2,
    (newCanvas.height - canvas.height) / 2,
    canvas.width,
    canvas.height
  );

  const legendCanvas = await html2canvas(legend);

  // We need to draw the legend using the device pixel ratio otherwise we get
  // difference between different browsers (Safari legend would be bigger somehow)
  const { width, height } = legend.getBoundingClientRect();

  const legendPadding = 24;
  context.drawImage(
    legendCanvas,
    legendPadding,
    legendPadding,
    width * ratio,
    height * ratio
  );

  // Returns the canvas as a png
  const res = await toBlob(newCanvas, "image/png").then((blob) =>
    blob ? URL.createObjectURL(blob) : undefined
  );

  Object.assign(canvas, initialSize);
  deck.redraw("Initial size");

  return res;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

export const ChoroplethMap = ({
  year,
  observations,
  observationsQueryFetching,
  medianValue,
  municipalities,
  colorScale,
  onMunicipalityLayerClick,
  controls,
}: {
  year: string;
  observations: OperatorObservationFieldsFragment[];
  observationsQueryFetching: boolean;
  medianValue: number | undefined;
  municipalities: { id: string; name: string }[];
  colorScale: ScaleThreshold<number, string> | undefined;
  onMunicipalityLayerClick: (_item: PickingInfo) => void;
  controls?: React.MutableRefObject<{
    getImageData: () => Promise<string | undefined>;
  } | null>;
}) => {
  const [hovered, setHovered] = useState<HoverState>();

  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [screenshotting, setScreenshotting] = useState(false);

  const onViewStateChange = useCallback(
    ({ viewState, interactionState }: ViewStateChangeParameters) => {
      if (screenshotting) {
        return;
      }
      setHovered(undefined);

      if (interactionState.inTransition) {
        setViewState(viewState as typeof INITIAL_VIEW_STATE);
      } else {
        setViewState(constrainZoom(viewState, CH_BBOX));
      }
    },
    [screenshotting]
  );

  const onResize = useCallback(
    ({ width, height }: { width: number; height: number }) => {
      setViewState((viewState) =>
        constrainZoom({ ...viewState, width, height }, CH_BBOX)
      );
    },
    [setViewState]
  );

  const deckRef = React.useRef<DeckGLRef>(null);
  const legendId = useId();

  const geoData = useGeoData(year);

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

  if (controls) {
    controls.current = {
      getImageData: async () => {
        setScreenshotting(true);
        try {
          await frame();
          await sleep(1000);
          const ref = deckRef.current;
          if (!ref) {
            return;
          }
          const deck = ref.deck;
          if (!deck) {
            return;
          }

          const legend = document.getElementById(legendId);
          if (!legend) {
            return;
          }

          return getImageData(deck, legend);
        } finally {
          {
            setScreenshotting(false);
          }
        }
      },
    };
  }

  useEffect(() => {
    if (geoData.state === "loaded" && observationsByMunicipalityId.size > 0) {
      __debugCheckObservationsWithoutShapes(
        observationsByMunicipalityId,
        geoData.data.municipalities
      );
    }
  }, [geoData, observationsByMunicipalityId]);

  const formatNumber = useFormatCurrency();

  const { value: highlightContext } = useContext(HighlightContext);

  const indexes = useMemo(() => {
    if (geoData.state !== "loaded") {
      return;
    }
    const municipalities = geoData.data.municipalities;
    const cantons = geoData.data.cantons;
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

    const common = {
      x: projected[0],
      y: projected[1] + 10,
      id: highlightContext.id,
    };
    const newHoverState: HoverState =
      type === "municipality"
        ? {
            ...common,
            type: "municipality",
          }
        : {
            ...common,
            type: "canton",
            label: highlightContext.label,
            value: highlightContext.value,
          };
    setHovered(newHoverState);
  }, [viewState, highlightContext, indexes]);

  const { hoveredMunicipalityName, hoveredCanton } = useMemo(() => {
    if (!hovered) {
      return {
        hoveredMunicipalityName: undefined,
        hoveredObservations: undefined,
        hoveredCanton: undefined,
      };
    }

    if (hovered.type === "municipality") {
      const hoveredObservations = observationsByMunicipalityId.get(hovered.id);
      return {
        hoveredMunicipalityName: municipalityNames.get(hovered.id)?.name,
        hoveredObservations,
        hoveredCanton: maxBy(hoveredObservations, (x) => x.period)?.cantonLabel,
      };
    } else {
      return {
        hoveredCanton: hovered.id,
        hoveredObservations: [],
        hoveredMunicipalityName: "",
      };
    }
  }, [hovered, municipalityNames, observationsByMunicipalityId]);

  const tooltipContent = hovered
    ? hovered.type === "municipality"
      ? {
          id: hovered.id,
          name: `${hoveredMunicipalityName ?? "-"} ${
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

  const valuesExtent = useMemo(() => {
    const meansByMunicipality = rollup(
      observations,
      (values) => mean(values, (d) => d.value),
      (d) => d.municipality
    ).values();
    return extent(meansByMunicipality, (d) => d) as [number, number];
  }, [observations]);

  const m = medianValue;

  const layers = useMemo(() => {
    if (geoData.state !== "loaded") {
      return;
    }

    const handleMunicipalityLayerClick: typeof onMunicipalityLayerClick = (
      ev
    ) => {
      if (!indexes || !ev.layer) {
        return;
      }
      const id = ev.object.id as number;
      const type = ev.layer.id === "municipalities" ? "municipality" : "canton";
      if (
        type === "municipality" &&
        !observationsByMunicipalityId.get(`${id}`)
      ) {
        return;
      }
      onMunicipalityLayerClick(ev);
    };

    return [
      new GeoJsonLayer({
        id: "municipalities-base",
        /** @ts-expect-error bad types */
        data: geoData.municipalities,
        pickable: true,
        stroked: false,
        filled: true,
        extruded: false,
        autoHighlight: false,
        getFillColor: (d) => {
          const id = d?.id?.toString();
          if (!id) return [0, 0, 0, 0];

          const obs = observationsByMunicipalityId.get(id);
          return obs
            ? getFillColor(
                colorScale,
                mean(obs, (d) => d.value),
                false
              )
            : [0, 0, 0, 20];
        },
        onHover: ({ x, y, object }: $FixMe) => {
          const id = object?.id?.toString();
          setHovered(
            object && id
              ? {
                  x,
                  y,
                  id,
                  type: "municipality",
                }
              : undefined
          );
        },
        onClick: handleMunicipalityLayerClick,
        updateTriggers: {
          getFillColor: [observationsByMunicipalityId, highlightContext?.id],
        },
      }),
      new GeoJsonLayer({
        id: "municipality-mesh",
        /** @ts-expect-error GeoJsonLayer type seems bad */
        data: geoData.municipalityMesh,
        pickable: false,
        stroked: true,
        filled: false,
        extruded: false,
        lineWidthMinPixels: 0.5,
        lineWidthMaxPixels: 1,
        getLineWidth: 100,
        lineMiterLimit: 1,
        getLineColor: LINE_COLOR,
      }),
      new GeoJsonLayer({
        id: "lakes",
        /** @ts-expect-error GeoJsonLayer type seems bad */
        data: geoData.lakes,
        pickable: false,
        stroked: true,
        filled: true,
        extruded: false,
        lineWidthMinPixels: 0.5,
        lineWidthMaxPixels: 1,
        getLineWidth: 100,
        getFillColor: LINE_COLOR,
        getLineColor: LINE_COLOR,
      }),
      new GeoJsonLayer({
        id: "cantons",

        /** @ts-expect-error GeoJsonLayer type seems bad */
        data: geoData.cantonMesh,
        pickable: false,
        stroked: true,
        filled: false,
        extruded: false,
        lineWidthMinPixels: 1.2,
        lineWidthMaxPixels: 3.6,
        getLineWidth: 200,
        lineMiterLimit: 1,
        getLineColor: LINE_COLOR,
        parameters: {
          depthTest: false,
        },
      }),

      new GeoJsonLayer({
        id: "municipalities-overlay",
        /** @ts-expect-error bad types */
        data: geoData.municipalities,
        pickable: false,
        stroked: true,
        filled: true,
        extruded: false,
        getFillColor: (d) => {
          const id = d?.id?.toString();
          if (!id) return [0, 0, 0, 0];

          if (!hovered || hovered.type !== "municipality") {
            return [0, 0, 0, 0];
          }

          return id === hovered.id ? [0, 0, 0, 0] : [255, 255, 255, 102];
        },
        getLineColor: (d) => {
          const id = d?.id?.toString();
          return hovered?.type === "municipality" && hovered.id === id
            ? [31, 41, 55]
            : [0, 0, 0, 0];
        },
        getLineWidth: (d) => {
          const id = d?.id?.toString();
          return hovered?.type === "municipality" && hovered.id === id ? 3 : 0;
        },
        lineWidthUnits: "pixels",
        updateTriggers: {
          getFillColor: [hovered],
          getLineColor: [hovered],
          getLineWidth: [hovered],
        },
      }),
    ];
  }, [
    geoData,
    observationsByMunicipalityId,
    highlightContext?.id,
    hovered,
    indexes,
    onMunicipalityLayerClick,
    colorScale,
  ]);

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
            <Box
              sx={{
                flexDirection: "column",
                gap: -1,
              }}
              display={"flex"}
            >
              <Typography variant="caption" color={"text.500"}>
                <Trans id="municipality">Gemeinde</Trans>
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {tooltipContent.name}
              </Typography>
            </Box>
            <Box
              display="grid"
              sx={{
                width: "100%",
                gridTemplateColumns: "1fr auto",
                gap: 1,
                alignItems: "center",
              }}
            >
              {hovered.type === "canton" ? (
                <>
                  <Box
                    sx={{
                      borderRadius: 9999,
                      px: 2,
                      display: "inline-block",
                      width: "fit-content",
                    }}
                    style={{
                      background: colorScale(hovered.value),
                    }}
                  >
                    <Typography variant="caption">
                      {formatNumber(hovered.value)}
                    </Typography>
                  </Box>
                </>
              ) : null}
            </Box>
            <Box
              display="grid"
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
                          <Typography variant="caption" sx={{}}>
                            {d.operatorLabel}
                          </Typography>
                          <Box
                            sx={{
                              borderRadius: 9999,
                              px: 2,
                              display: "inline-block",
                            }}
                            style={{ background: colorScale(d.value) }}
                          >
                            <Typography variant="caption">
                              {formatNumber(d.value)}
                            </Typography>
                          </Box>
                        </Fragment>
                      );
                    })
                  ) : (
                    <Typography
                      variant="caption"
                      sx={{ color: "secondary.main" }}
                    >
                      <Trans id="map.tooltipnodata">Keine Daten</Trans>
                    </Typography>
                  )}
                </>
              ) : null}
            </Box>
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
                right: 0,
                mt: 3,
                mr: 3,
                backgroundColor: "background.paper",
                borderRadius: "2px",
                p: 4,
              }}
            >
              <MapPriceColorLegend
                id={legendId}
                stats={[valuesExtent[0], m, valuesExtent[1]]}
              />
            </Box>

            <DeckGL
              controller={{ type: MapController }}
              viewState={viewState}
              onViewStateChange={onViewStateChange}
              onResize={onResize}
              layers={layers}
            />
          </WithClassName>
        )}
        {screenshotting ? (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1120,
              height: 730,
              opacity: 0,
            }}
          >
            <DeckGL
              ref={deckRef}
              controller={{ type: MapController }}
              viewState={
                constrainZoom(
                  {
                    ...viewState,
                    zoom: 5,
                    width: SCREENSHOT_CANVAS_SIZE.width,
                    height: SCREENSHOT_CANVAS_SIZE.height,
                  },
                  CH_BBOX
                ) as $FixMe
              }
              layers={layers?.map((l) => l?.clone({}))}
            />
          </Box>
        ) : null}
      </>
    </>
  );
};

export type ChoroplethMapProps = ComponentProps<typeof ChoroplethMap>;
