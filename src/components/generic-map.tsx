import {
  Layer,
  MapController,
  MapViewState,
  PickingInfo,
} from "@deck.gl/core/typed";
import { ViewStateChangeParameters } from "@deck.gl/core/typed/controllers/controller";
import DeckGL, { DeckGLRef } from "@deck.gl/react/typed";
import { Box } from "@mui/material";
import bbox from "@turf/bbox";
import { Feature } from "geojson";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { WithClassName } from "src/components/detail-page/with-classname";
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

/**
 * GenericMap component that handles common map functionality
 * regardless of the specific entities being displayed
 */
export const GenericMap = ({
  layers,
  isLoading = false,
  hasNoData = false,
  hasError = false,
  tooltipContent,
  renderLegend,
  downloadId,
  onViewStateChange: userOnViewStateChange,
  onLayerClick,
  controls,
  initialBBox = CH_BBOX,
}: {
  layers: Layer[];
  isLoading?: boolean;
  hasNoData?: boolean;
  hasError?: boolean;
  tooltipContent?: {
    hoveredState: HoverState | undefined;
    content: React.ReactNode | null;
  };
  renderLegend?: () => React.ReactNode;
  downloadId?: string;
  onViewStateChange?: (viewState: MapViewState) => void;
  onLayerClick?: (info: PickingInfo) => void;
  controls?: React.MutableRefObject<{
    getImageData: () => Promise<string | undefined>;
    zoomOn: (id: string) => void;
    zoomOut: () => void;
  } | null>;
  initialBBox?: BBox;
}) => {
  const isMobile = useIsMobile();
  const mapZoomPadding = isMobile ? 20 : 150;

  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [screenshotting, setScreenshotting] = useState(false);

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
            const legend = downloadId
              ? document.getElementById(downloadId)
              : null;
            if (!legend) {
              return;
            }

            return getImageData(deck, legend || undefined);
          } finally {
            setScreenshotting(false);
          }
        },
        zoomOn: (id: string) => {
          // Find the feature in one of the layers
          let feature;
          for (const layer of layers) {
            if (
              typeof layer.props.data === "string" ||
              !("features" in layer.props.data) ||
              !layer.props.data?.features
            )
              continue;
            const features = layer.props.data.features as Feature[];
            feature = features.find((f) => f.id?.toString() === id);
            if (feature) break;
          }

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
  }, [controls, downloadId, initialBBox, layers, mapZoomPadding, viewState]);

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
          {renderLegend && (
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
              {renderLegend()}
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
