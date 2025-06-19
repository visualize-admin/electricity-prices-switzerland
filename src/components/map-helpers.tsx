import {
  FlyToInterpolator,
  Viewport,
  WebMercatorViewport,
} from "@deck.gl/core/typed";
import { ScaleThreshold, color } from "d3";
import { BBox as GeoJsonBBox } from "geojson";

export const getFillColor = (
  colorScale: ScaleThreshold<number, string, never> | undefined,
  v: number | undefined,
  highlighted: boolean
): [number, number, number] => {
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

/**
 * Constrain the viewState to always _contain_ the supplied bbox.
 *
 * (Other implementations ensure that the bbox _covers_ the viewport)
 *
 * @param viewState deck.gl viewState
 * @param bbox Bounding box of the feature to be contained
 */
export const constrainZoom = (
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
export const getZoomFromBounds = (bounds: GeoJsonBBox, viewport: Viewport) => {
  const [x0, y0, x1, y1] = bounds;
  const width = Math.abs(x1 - x0);
  const height = Math.abs(y1 - y0);
  const zoomX = Math.log(viewport.width / width) / Math.log(2);
  const zoomY = Math.log(viewport.height / height) / Math.log(2);
  return Math.min(zoomX, zoomY) - 1;
};

export const getZoomedViewState = (
  currentViewState: $FixMe,
  bbox: GeoJsonBBox,
  {
    padding = 150,
    transitionDuration = 1000,
  }: { padding?: number; transitionDuration?: number } = {}
) => {
  const vp = new WebMercatorViewport(currentViewState);

  const nestedBBox: [[number, number], [number, number]] = [
    [bbox[0], bbox[1]],
    [bbox[2], bbox[3]],
  ];
  const fitted = vp.fitBounds(nestedBBox, { padding });

  return {
    ...currentViewState,
    ...fitted,
    transitionDuration,
    transitionInterpolator: new FlyToInterpolator(),
  };
};

export const flattenBBox = (
  bbox: [[number, number], [number, number]]
): [number, number, number, number] => {
  return [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]];
};
export type HoverState =
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
    }
  | {
      x: number;
      y: number;
      id: string;
      type: "operator";
      values: {
        operatorName: string;
        value: number;
      }[];
    };
export const INITIAL_VIEW_STATE = {
  latitude: 46.8182,
  longitude: 8.2275,
  zoom: 2,
  maxZoom: 16,
  minZoom: 2,
  pitch: 0,
  bearing: 0,
};
export const LINE_COLOR = [255, 255, 255, 255] as [
  number,
  number,
  number,
  number
];

export type BBox = [[number, number], [number, number]];

export const CH_BBOX: BBox = [
  [5.956800664952974, 45.81912371940225],
  [10.493446773955753, 47.80741209797084],
];

type Color = [number, number, number, number];

// Define style tokens for map layers
export const styles = {
  municipalities: {
    base: {
      fillColor: [0, 0, 0, 0] as Color,
      opacity: {
        withData: [0, 0, 0, 255] as Color,
        withoutData: [0, 0, 0, 20] as Color,
      },
    },
    overlay: {
      default: {
        fillColor: [0, 0, 0, 0] as Color,
        lineColor: [0, 0, 0, 0] as Color,
        lineWidth: 0,
      },
      active: {
        fillColor: [0, 0, 0, 0] as Color,
        lineColor: [31, 41, 55, 255] as Color,
        lineWidth: 3,
      },
      inactive: {
        fillColor: [255, 255, 255, 102] as Color,
        lineColor: [0, 0, 0, 0],
        lineWidth: 0,
      },
    },
  },
  municipalityMesh: {
    lineColor: LINE_COLOR,
    lineWidthMinPixels: 0.5,
    lineWidthMaxPixels: 1,
    lineWidth: 100,
  },
  lakes: {
    fillColor: LINE_COLOR,
    lineColor: LINE_COLOR,
    lineWidthMinPixels: 0.5,
    lineWidthMaxPixels: 1,
    lineWidth: 100,
  },
  cantons: {
    lineColor: LINE_COLOR,
    lineWidthMinPixels: 1.2,
    lineWidthMaxPixels: 3.6,
    lineWidth: 200,
  },
  operators: {
    base: {
      lineColor: [255, 255, 255, 100] as Color,
      lineWidth: 1.5,
      highlightColor: [0, 0, 0, 100] as Color,
      transitions: {
        duration: 300,
        easing: "easeExpIn" as const,
      },
    },
    pickable: {
      fillColor: [255, 255, 255, 0] as Color, // Transparent
      highlightColor: [0, 0, 0, 100] as Color,
    },
    municipalityOutline: {
      lineColor: [255, 255, 255, 255] as Color,
      highlightColor: [0, 0, 255, 255] as Color,
      lineWidth: 0.25,
    },
  },
};
