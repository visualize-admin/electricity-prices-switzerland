import {
  Layer,
  MapController,
  MapViewState,
  PickingInfo,
  WebMercatorViewport,
} from "@deck.gl/core/typed";
import { ViewStateChangeParameters } from "@deck.gl/core/typed/controllers/controller";
import DeckGL, { DeckGLRef } from "@deck.gl/react/typed";
import { Trans } from "@lingui/macro";
import {
  Alert,
  Box,
  IconButton,
  iconButtonClasses,
  Typography,
} from "@mui/material";
import bbox from "@turf/bbox";
// eslint-disable-next-line
// @ts-ignore - Package import is reported as a problem in tsgo - TODO Recheck later if we can remove this
import centroid from "@turf/centroid";
import { Feature, FeatureCollection } from "geojson";
import { isObject } from "lodash";
import React, {
  Dispatch,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  HighlightContext,
  HighlightValue,
} from "src/components/highlight-context";
import { Loading, NoDataHint } from "src/components/hint";
import {
  BBox,
  constrainZoom,
  flattenBBox,
  getInitialViewState,
  getZoomedViewState,
  InitialViewState,
  CH_BBOX,
  HoverState,
} from "src/components/map-helpers";
import HintBox from "src/components/map-hint-box";
import {
  defaultMapTooltipPlacement,
  MapTooltip,
} from "src/components/map-tooltip";
import { getImageData, SCREENSHOT_CANVAS_SIZE } from "src/domain/screenshot";
import { IconMinus } from "src/icons/ic-minus";
import { IconPlus } from "src/icons/ic-plus";
import { useIsMobile } from "src/lib/use-mobile";
import { frame, sleep } from "src/utils/delay";

const ZoomWidget = ({
  onZoomIn,
  onZoomOut,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
}) => {
  return (
    <Box
      zIndex={1}
      top={16}
      right={16}
      display="flex"
      gap={2}
      sx={{
        [`.${iconButtonClasses.root}`]: {
          backgroundColor: "background.paper",
          height: 40,
          "&:hover": {
            backgroundColor: "secondary.100",
          },
          "& svg": {
            width: 16,
            height: 16,
            color: "text.primary",
          },
        },
      }}
    >
      <IconButton onClick={onZoomIn} size="sm" sx={{}}>
        <IconPlus />
      </IconButton>
      <IconButton
        onClick={onZoomOut}
        sx={{
          backgroundColor: "background.paper",
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        <IconMinus />
      </IconButton>
    </Box>
  );
};

const zoomIn = (state: InitialViewState) => {
  return {
    ...state,
    zoom: Math.min((state.zoom || 0) + 1, state.maxZoom || 20),
    transitionDuration: 300,
  };
};

const zoomOut = (state: InitialViewState) => {
  return {
    ...state,
    zoom: Math.max((state.zoom || 0) - 1, state.minZoom || 0),
    transitionDuration: 300,
  };
};

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
  error = undefined,
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
  error?: { message: string };
  tooltipContent?: {
    hoveredState: HoverState | undefined;
    content: React.ReactNode | null;
  } | null;
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

  const [viewState, setViewState] = useState(() =>
    getInitialViewState(isMobile)
  );
  const [screenshotting, setScreenshotting] = useState(false);

  const highlightContext = useContext(HighlightContext).value;
  const legendId = useId();

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
      const newViewState = viewState as InitialViewState;
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
      setViewState((viewState) => {
        const constrained = constrainZoom(
          { ...viewState, width, height },
          initialBBox,
          {
            padding: mapZoomPadding,
          }
        );
        return {
          ...viewState,
          zoom: constrained.zoom,
          longitude: constrained.longitude,
          latitude: constrained.latitude,
        };
      });
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

            // Get the legend element if a legend ID is provided
            const legendElement = legendId
              ? document.getElementById(legendId)
              : null;

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

          if (newViewState) {
            setViewState({
              ...viewState,
              zoom: newViewState.zoom,
              longitude: newViewState.longitude,
              latitude: newViewState.latitude,
              transitionDuration: newViewState.transitionDuration,
              transitionInterpolator: newViewState.transitionInterpolator,
            });
          }
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

          if (newViewState) {
            setViewState({
              ...viewState,
              zoom: newViewState.zoom,
              longitude: newViewState.longitude,
              latitude: newViewState.latitude,
              transitionDuration: newViewState.transitionDuration,
              transitionInterpolator: newViewState.transitionInterpolator,
            });
          }
        },
      };
    }
  }, [
    controls,
    downloadId,
    featureMatchesId,
    initialBBox,
    layers,
    legendId,
    mapZoomPadding,
    viewState,
  ]);

  const [scrollZoom, setScrollZoom] = useState(false);
  const [displayScrollZoom, setDisplayScrollZoom] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mouseOverRef = useRef(false);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Control" || event.key === "Meta") {
        setScrollZoom(true);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Control" || event.key === "Meta") {
        setScrollZoom(false);
      }
    };
    let timeout = 0;
    const handleWheel = () => {
      if (!mouseOverRef.current) {
        return;
      }
      setDisplayScrollZoom(true);
      clearTimeout(timeout);
      timeout = +setTimeout(() => {
        setDisplayScrollZoom(false);
      }, 2000);
    };
    window.addEventListener("scroll", handleWheel, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const isMacOS = useMemo(
    () =>
      typeof navigator !== "undefined" &&
      navigator.userAgent.indexOf("Mac OS X") !== -1,
    []
  );

  const tooltipMinimumWidth = 200;

  return (
    <>
      {isLoading ? (
        <HintBox>
          <Loading delayMs={0} />
        </HintBox>
      ) : error ? (
        <HintBox>
          <Alert severity="error">{error.message}</Alert>
        </HintBox>
      ) : hasNoData ? (
        <HintBox>
          <NoDataHint />
        </HintBox>
      ) : null}

      <>
        {tooltipContent &&
          tooltipContent.hoveredState &&
          tooltipContent.content && (
            <MapTooltip
              x={tooltipContent.hoveredState.x}
              y={tooltipContent.hoveredState.y}
              placement={
                tooltipContent.hoveredState.x >
                viewState.width - tooltipMinimumWidth
                  ? { x: "left", y: "top" }
                  : tooltipContent.hoveredState.x < tooltipMinimumWidth
                  ? { x: "right", y: "top" }
                  : defaultMapTooltipPlacement
              }
            >
              {tooltipContent.content}
            </MapTooltip>
          )}

        <div
          className={isLoading ? "" : downloadId || "map"}
          ref={mapContainerRef}
          onMouseOver={() => {
            mouseOverRef.current = true;
          }}
          onMouseLeave={() => {
            mouseOverRef.current = false;
          }}
        >
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
              id={legendId}
            >
              {legend}
            </Box>
          )}

          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 10,
              display: "flex",
              gap: 2,
              p: 2,
            }}
          >
            <ZoomWidget
              onZoomIn={() => {
                setViewState((viewState) =>
                  zoomIn(viewState || getInitialViewState(isMobile))
                );
              }}
              onZoomOut={() => {
                setViewState((viewState) =>
                  zoomOut(viewState || getInitialViewState(isMobile))
                );
              }}
            />
            {isMobile ? null : (
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "white",
                  opacity: !scrollZoom && displayScrollZoom ? 1 : 0,
                  transition: "opacity 0.25s ease-in",
                }}
              >
                <Typography variant="caption">
                  <Trans
                    id="map.scrollzoom.hint"
                    values={{
                      key: isMacOS ? "⌘" : "Ctrl",
                    }}
                  >
                    {`Hold {key} and scroll to zoom`}
                  </Trans>
                </Typography>
              </Box>
            )}
          </Box>

          <DeckGL
            controller={{ type: MapController, scrollZoom, dragRotate: false }}
            viewState={viewState}
            onViewStateChange={onViewStateChangeHandler}
            onResize={onResize}
            layers={layers}
            onClick={onLayerClick}
            ref={deckRef}
          ></DeckGL>
        </div>

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
      : Array.isArray(data)
      ? (data as Feature[])
      : undefined;
    feature = features?.find((f) => featureMatchesId(f, id));

    if (feature) break;
  }
  return feature;
}

function defaultFeatureMatchesId(feature: Feature, id: string): boolean {
  return feature.id?.toString() === id;
}
