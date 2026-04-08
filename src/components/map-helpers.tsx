import {
  FlyToInterpolator,
  MapViewState,
  WebMercatorViewport,
} from "@deck.gl/core/typed";
import { color, ScaleThreshold } from "d3";
import { BBox as GeoJsonBBox } from "geojson";

export const getFillColor = (
  colorScale: ScaleThreshold<number, string, never> | undefined,
  v: number | undefined,
  highlighted: boolean,
): [number, number, number] => {
  if (v === undefined) {
    return [0, 0, 0];
  }
  const c = colorScale?.(v);
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
  viewState: MapViewState & { width: number; height: number },
  bbox: BBox,
  { padding = 150 }: { padding?: number } = {},
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

const getFlyToInterpolator = () => {
  return new FlyToInterpolator({
    speed: 4,
  });
};

export const getZoomedViewState = (
  currentViewState: MapViewState & { width: number; height: number },
  bbox: GeoJsonBBox,
  {
    padding = 150,
    transitionDuration = 1000,
  }: { padding?: number; transitionDuration?: number } = {},
) => {
  const vp = new WebMercatorViewport(currentViewState);

  const nestedBBox: [[number, number], [number, number]] = [
    [bbox[0], bbox[1]],
    [bbox[2], bbox[3]],
  ];

  // progressively reduce padding until it fits
  while (padding > 0) {
    try {
      const fitted = vp.fitBounds(nestedBBox, { padding });

      return {
        ...currentViewState,
        ...fitted,
        transitionDuration,
        transitionInterpolator: getFlyToInterpolator(),
      };
    } catch {
      // If it fails, reduce padding and try again
      padding -= 50;
    }
  }
};

export const flattenBBox = (
  bbox: [[number, number], [number, number]],
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
      label?: string;
      value?: number;
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
export const getInitialViewState = (isMobile: boolean) => ({
  latitude: 46.8182,
  longitude: 8.2275,
  zoom: 2,
  maxZoom: 10,
  minZoom: isMobile ? 5 : 7,
  pitch: 0,
  bearing: 0,
  width: 200,
  height: 200,
  transitionDuration: 0,
  transitionInterpolator: getFlyToInterpolator(),
});

export type InitialViewState = ReturnType<typeof getInitialViewState>;

export type BBox = [[number, number], [number, number]];

export const CH_BBOX: BBox = [
  [5.956800664952974, 45.81912371940225],
  [10.493446773955753, 47.80741209797084],
];

type Color = [number, number, number, number];

/**
 * Convert an 8-digit hex color string (#rrggbbaa) to a deck.gl Color tuple.
 * Uses d3-color for parsing so the source of truth stays as readable hex.
 */
const toArray = (hex: string): Color => {
  const c = color(hex)?.rgb();
  if (!c) throw new Error(`Invalid color: ${hex}`);
  return [c.r, c.g, c.b, Math.round(c.opacity * 255)];
};

const LINE_COLOR = toArray("#ffffffff");

export type MapRenderMode = "screen" | "print-a3" | "print-a4";

/**
 * Scale factors applied to pixel-based line widths in print modes to compensate
 * for the canvas-to-image upscaling performed during screenshot composition.
 * A3 approximates image.width / canvas.width (≈ 4000 / 1200 ≈ 3.33).
 * A4 is A3 / √2 because the canvas is smaller by √2, making pixel strokes
 * proportionally thicker at the same deck.gl pixel value.
 */
const PRINT_PIXEL_SCALE: Record<MapRenderMode, number> = {
  screen: 1,
  "print-a3": 3,
  "print-a4": 2,
};

// Define style tokens for map layers
export const getStyles = (mode: MapRenderMode = "screen") => {
  const s = PRINT_PIXEL_SCALE[mode];
  return {
    areas: {
      base: {
        fillColor: {
          doesNotExist: toArray("#00000000"),
          withoutData: toArray("#dde1e3ff"),
        },
      },
    },
    overlay: {
      default: {
        fillColor: toArray("#00000000"),
        lineColor: toArray("#00000000"),
        lineWidth: 0,
      },
      active: {
        fillColor: toArray("#00000032"),
        lineColor: toArray("#1f2937ff"),
        lineWidth: 3 * s, // pixel units
      },
      inactive: {
        fillColor: toArray("#ffffff66"),
        lineColor: toArray("#00000000"),
        lineWidth: 0,
      },
    },
    municipalityMesh: {
      lineColor: LINE_COLOR,
      lineWidthMinPixels: 0.5 * s,
      lineWidthMaxPixels: 1 * s,
      lineWidth: 100, // meters, not scaled
    },
    lakes: {
      fillColor: toArray("#e2f1ffff"),
      lineColor: LINE_COLOR,
      lineWidthMinPixels: 0.5 * s,
      lineWidthMaxPixels: 1 * s,
      lineWidth: 100, // meters, not scaled
    },
    cantons: {
      lineColor: LINE_COLOR,
      lineWidthMinPixels: 1.2 * s,
      lineWidthMaxPixels: 3.6 * s,
      lineWidth: 200, // meters, not scaled
    },
  };
};
