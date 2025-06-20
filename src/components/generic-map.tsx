import {
  Layer,
  MapController,
  MapViewState,
  PickingInfo,
  WebMercatorViewport,
} from "@deck.gl/core/typed";
import { ViewStateChangeParameters } from "@deck.gl/core/typed/controllers/controller";
import DeckGL, { DeckGLRef } from "@deck.gl/react/typed";
import { Box } from "@mui/material";
import bbox from "@turf/bbox";
import centroid from "@turf/centroid";
import { Feature, FeatureCollection } from "geojson";
import { isObject } from "lodash";
import React, {
  Dispatch,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { WithClassName } from "src/components/detail-page/with-classname";
import {
  HighlightContext,
  HighlightValue,
} from "src/components/highlight-context";
import { Loading, NoDataHint, NoGeoDataHint } from "src/components/hint";
import {
  BBox,
  constrainZoom,
  flattenBBox,
  getZoomedViewState,
} from "src/components/map-helpers";
import HintBox from "src/components/map-hint-box";
import { MapTooltip } from "src/components/map-tooltip";
import { getImageData, SCREENSHOT_CANVAS_SIZE } from "src/domain/screenshot";
import { useIsMobile } from "src/lib/use-mobile";
import { frame, sleep } from "src/utils/delay";

import { CH_BBOX, HoverState, INITIAL_VIEW_STATE } from "./map-helpers";

export type GenericMapControls = React.RefObject<{
  getImageData: () => Promise<string | undefined>;
  zoomOn: (id: string) => void;
  zoomOut: () => void;
} | null>;
/**
 * GenericMap component that handles common map functionality
 * regardless of the specific entities being displayed
 *
 * Functionality includes:
 * - Displaying layers on a map
 * - Handling loading states, no data, and error states
 * - Displaying tooltips for hovered states
 * - Providing a legend
 * - Downloading map images
 * - Zooming on specific features
 * - Handling view state changes
 * - Providing controls for external components
 */
export const GenericMap = ({
  layers,
  isLoading = false,
  hasNoData = false,
  hasError = false,
  tooltipContent,
  legend,
  downloadId,
  onViewStateChange: userOnViewStateChange,
  onLayerClick,
  controls,
  initialBBox = CH_BBOX,
  getEntityFromHighlight,
  setHovered,
  featureMatchesId = defaultFeatureMatchesId,
}: {
  layers: Layer[];
  isLoading?: boolean;
  hasNoData?: boolean;
  hasError?: boolean;
  tooltipContent?: {
    hoveredState: HoverState | undefined;
    content: React.ReactNode | null;
  };
  legend?: React.ReactNode;
  downloadId?: string;
  onViewStateChange?: (viewState: MapViewState) => void;
  onLayerClick?: (info: PickingInfo) => void;
  controls?: GenericMapControls;
  initialBBox?: BBox;
  getEntityFromHighlight?: (highlight: HighlightValue) => Feature | undefined;
  setHovered: Dispatch<HoverState | undefined>;
  featureMatchesId?: (feature: Feature, id: string) => boolean;
}) => {
  const isMobile = useIsMobile();
  const mapZoomPadding = isMobile ? 20 : 150;

  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [screenshotting, setScreenshotting] = useState(false);

  const highlightContext = useContext(HighlightContext).value;

  // Syncs highlight context (coming from the right list hover) with hovered
  useEffect(() => {
    if (!getEntityFromHighlight || !highlightContext) {
      setHovered(undefined);
      return;
    }
    const vp = new WebMercatorViewport(viewState);
    const type = highlightContext.entity;

    const entity = getEntityFromHighlight?.(highlightContext);
    if (!entity) {
      setHovered(undefined);
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
        : type === "canton"
        ? {
            ...common,
            type: "canton",
            label: highlightContext.label,
            value: highlightContext.value,
          }
        : type === "operator"
        ? {
            ...common,
            type: "operator",
            values: [
              {
                operatorName: highlightContext.label,
                value: highlightContext.value,
              },
            ],
          }
        : (null as never);
    setHovered(newHoverState);
  }, [getEntityFromHighlight, highlightContext, setHovered, viewState]);

  // View state change handler
  const onViewStateChangeHandler = useCallback(
    ({ viewState }: ViewStateChangeParameters) => {
      if (screenshotting) return;
      const newViewState = viewState as typeof INITIAL_VIEW_STATE;
      setViewState(newViewState);
      if (userOnViewStateChange) {
        userOnViewStateChange(newViewState);
      }
    },
    [screenshotting, userOnViewStateChange]
  );

  // Resize handler
  const onResize = useCallback(
    ({ width, height }: { width: number; height: number }) => {
      setViewState((viewState) =>
        constrainZoom({ ...viewState, width, height }, initialBBox, {
          padding: mapZoomPadding,
        })
      );
    },
    [setViewState, mapZoomPadding, initialBBox]
  );

  const deckRef = useRef<DeckGLRef>(null);

  // Set up controls interface if provided
  useEffect(() => {
    if (controls) {
      controls.current = {
        getImageData: async () => {
          setScreenshotting(true);
          try {
            await frame();
            await sleep(1000);
            const ref = deckRef.current;
            if (!ref) return;

            const deck = ref.deck;
            if (!deck) return;

            // Get the legend element if a download ID is provided
            const legendElement = downloadId
              ? document.getElementById(downloadId)
              : null;
            if (!legendElement) {
              return;
            }

            return getImageData(deck, legendElement || undefined);
          } finally {
            setScreenshotting(false);
          }
        },
        zoomOn: (id: string) => {
          const feature = findFeatureInLayers(layers, id, featureMatchesId);

          if (!feature) return;

          const boundsArray = feature.bbox ?? bbox(feature);
          const bboxCoords: BBox = [
            [boundsArray[0], boundsArray[1]],
            [boundsArray[2], boundsArray[3]],
          ];

          const newViewState = getZoomedViewState(
            viewState,
            flattenBBox(bboxCoords),
            {
              padding: mapZoomPadding,
              transitionDuration: 1000,
            }
          );

          setViewState(newViewState);
        },
        zoomOut: () => {
          const newViewState = getZoomedViewState(
            viewState,
            flattenBBox(initialBBox),
            {
              padding: mapZoomPadding,
              transitionDuration: 1000,
            }
          );
          setViewState(newViewState);
        },
      };
    }
  }, [
    controls,
    downloadId,
    featureMatchesId,
    initialBBox,
    layers,
    mapZoomPadding,
    viewState,
  ]);

  return (
    <>
      {isLoading ? (
        <HintBox>
          <Loading delayMs={0} />
        </HintBox>
      ) : hasNoData ? (
        <HintBox>
          <NoDataHint />
        </HintBox>
      ) : hasError ? (
        <HintBox>
          <NoGeoDataHint />
        </HintBox>
      ) : null}

      <>
        {tooltipContent &&
          tooltipContent.hoveredState &&
          tooltipContent.content && (
            <MapTooltip
              x={tooltipContent.hoveredState.x}
              y={tooltipContent.hoveredState.y}
            >
              {tooltipContent.content}
            </MapTooltip>
          )}

        <WithClassName downloadId={downloadId || "map"} isFetching={isLoading}>
          {legend && (
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
              {legend}
            </Box>
          )}

          <DeckGL
            controller={{ type: MapController }}
            viewState={viewState}
            onViewStateChange={onViewStateChangeHandler}
            onResize={onResize}
            layers={layers}
            onClick={onLayerClick}
            ref={deckRef}
          />
        </WithClassName>

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
              viewState={constrainZoom(
                {
                  ...viewState,
                  zoom: 5,
                  width: SCREENSHOT_CANVAS_SIZE.width,
                  height: SCREENSHOT_CANVAS_SIZE.height,
                },
                initialBBox,
                { padding: mapZoomPadding }
              )}
              layers={layers?.map((l) => l?.clone({}))}
            />
          </Box>
        ) : null}
      </>
    </>
  );
};

const isFeatureCollection = (data: unknown): data is FeatureCollection => {
  return !!(
    data &&
    isObject(data) &&
    "type" in data &&
    data.type === "FeatureCollection"
  );
};

function findFeatureInLayers(
  layers: Layer<{}>[],
  id: string,
  featureMatchesId: (feature: Feature, id: string) => boolean
): Feature | undefined {
  let feature;
  for (const layer of layers) {
    const data = layer.props.data;
    if (!data || typeof data === "string") continue;

    const features = isFeatureCollection(data)
      ? data.features
      : (data as Feature[]);
    feature = features.find((f) => featureMatchesId(f, id));

    if (feature) break;
  }
  return feature;
}

function defaultFeatureMatchesId(feature: Feature, id: string): boolean {
  return feature.id?.toString() === id;
}
