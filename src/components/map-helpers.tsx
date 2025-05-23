import { Viewport, WebMercatorViewport } from "@deck.gl/core/typed";
import { ScaleThreshold, color } from "d3";
import { BBox } from "geojson";

import { BBox as MapBBox } from "src/components/map";

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
  bbox: MapBBox,
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
export const getZoomFromBounds = (bounds: BBox, viewport: Viewport) => {
  const [x0, y0, x1, y1] = bounds;
  const width = Math.abs(x1 - x0);
  const height = Math.abs(y1 - y0);
  const zoomX = Math.log(viewport.width / width) / Math.log(2);
  const zoomY = Math.log(viewport.height / height) / Math.log(2);
  return Math.min(zoomX, zoomY) - 1;
};
