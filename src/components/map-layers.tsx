import { PickingInfo } from "@deck.gl/core/typed";
import { GeoJsonLayer } from "@deck.gl/layers/typed";
import { mean, ScaleThreshold } from "d3";
import { Feature, GeoJsonProperties, Geometry } from "geojson";

import {
  getFillColor,
  getStyles,
  HoverState,
  MapRenderMode,
} from "src/components/map-helpers";

export type PickingInfoTyped<T> = Omit<PickingInfo, "object"> & {
  object: T | null;
};

// Common types for layer options
export type LayerHoverHandler<TFeature> = (
  info: PickingInfoTyped<TFeature>,
) => void;
export type LayerClickHandler<TFeature> = (
  info: PickingInfoTyped<TFeature>,
  event: { srcEvent: Event },
) => void;

// TFeature is the GeoJSON feature type; TObs is the observation type per entity.
interface EntityLayerOptions<
  TFeature extends Feature<Geometry, GeoJsonProperties>,
  TObs,
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  layerId: string;
  renderMode?: MapRenderMode;
  /** Map from entity ID string to observation(s) for that entity. */
  observationsByEntityId: Map<string, TObs>;
  /** Return all IDs that this feature represents (single for areas, multiple for operators). */
  getFeatureIds: (feature: TFeature) => string[];
  /** Extract a scalar value from an observation entry. */
  getValue: (obs: TObs) => number | null | undefined;
  colorScale: ScaleThreshold<number, string>;
  highlightId?: string;
  onHover?: (info: PickingInfo) => void;
  onClick?: (info: PickingInfo, event: { srcEvent: Event }) => void;
  /** Pass false to make the layer non-pickable (e.g. operator base layer). Defaults to true. */
  pickable?: boolean;
}

interface MeshLayerOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  layerId: string;
  renderMode?: MapRenderMode;
}

interface EntityHighlightLayerOptions<
  TFeature extends Feature<Geometry, GeoJsonProperties>,
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  layerId: string;
  renderMode?: MapRenderMode;
  hovered?: HoverState;
  activeId?: string | null;
  /** Return the canonical ID string for a feature, used for hover/active matching. */
  getId: (feature: TFeature) => string | undefined;
  /** Presence makes the layer pickable and enables pointer events. */
  onHover?: (info: PickingInfo) => void;
  onClick?: (info: PickingInfo, event: { srcEvent: Event }) => void;
}

interface LakesLayerOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // This can be either FeatureCollection or Feature
  layerId?: string;
  renderMode?: MapRenderMode;
}

interface CantonsLayerOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // This is a MultiLineString, not a FeatureCollection
  layerId?: string;
  renderMode?: MapRenderMode;
}

export function makeEntityLayer<
  TFeature extends Feature<Geometry, GeoJsonProperties>,
  TObs,
>(options: EntityLayerOptions<TFeature, TObs>) {
  const {
    data,
    layerId,
    renderMode,
    observationsByEntityId,
    getFeatureIds,
    getValue,
    colorScale,
    highlightId,
    onHover,
    onClick,
    pickable = true,
  } = options;
  const styles = getStyles(renderMode);

  return new GeoJsonLayer({
    id: layerId,
    data,
    pickable,
    stroked: false,
    filled: true,
    extruded: false,
    autoHighlight: false,
    getFillColor: (d) => {
      const ids = getFeatureIds(d as unknown as TFeature);
      if (ids.length === 0) return styles.areas.base.fillColor.doesNotExist;

      const values = ids
        .map((id) => {
          const obs = observationsByEntityId.get(id);
          return obs != null ? getValue(obs) : null;
        })
        .filter((v): v is number => v != null);

      if (values.length === 0) return styles.areas.base.fillColor.withoutData;

      const isHighlighted = ids.some((id) => highlightId === id);
      return getFillColor(colorScale, mean(values), isHighlighted);
    },
    onHover,
    onClick,
    updateTriggers: {
      getFillColor: [observationsByEntityId, highlightId],
    },
  });
}

export function makeMeshLayer(options: MeshLayerOptions) {
  const { data, layerId, renderMode } = options;
  const styles = getStyles(renderMode);
  const meshStyles = styles.municipalityMesh;

  return new GeoJsonLayer({
    id: layerId,
    data,
    pickable: false,
    stroked: true,
    filled: false,
    extruded: false,
    lineWidthMinPixels: meshStyles.lineWidthMinPixels,
    lineWidthMaxPixels: meshStyles.lineWidthMaxPixels,
    getLineWidth: meshStyles.lineWidth,
    lineMiterLimit: 1,
    getLineColor: meshStyles.lineColor,
  });
}

export function makeLakesLayer(options: LakesLayerOptions) {
  const { data, layerId = "lakes", renderMode } = options;
  const styles = getStyles(renderMode);

  return new GeoJsonLayer({
    id: layerId,
    data,
    pickable: false,
    stroked: true,
    filled: true,
    extruded: false,
    lineWidthMinPixels: styles.lakes.lineWidthMinPixels,
    lineWidthMaxPixels: styles.lakes.lineWidthMaxPixels,
    getLineWidth: styles.lakes.lineWidth,
    getFillColor: styles.lakes.fillColor,
    getLineColor: styles.lakes.lineColor,
  });
}

export function makeCantonsLayer(options: CantonsLayerOptions) {
  const { data, layerId = "cantons", renderMode } = options;
  const styles = getStyles(renderMode);

  return new GeoJsonLayer({
    id: layerId,
    data,
    pickable: false,
    stroked: true,
    filled: false,
    extruded: false,
    lineWidthMinPixels: styles.cantons.lineWidthMinPixels,
    lineWidthMaxPixels: styles.cantons.lineWidthMaxPixels,
    getLineWidth: styles.cantons.lineWidth,
    lineMiterLimit: 1,
    getLineColor: styles.cantons.lineColor,
    parameters: {
      depthTest: false,
    },
  });
}

export function makeEntityHighlightLayer<
  TFeature extends Feature<Geometry, GeoJsonProperties>,
>(options: EntityHighlightLayerOptions<TFeature>) {
  const {
    data,
    layerId,
    hovered,
    activeId,
    getId,
    onHover,
    onClick,
    renderMode,
  } = options;
  const styles = getStyles(renderMode);
  const pickable = !!(onHover || onClick);

  const isActiveOrHovered = (d: TFeature) => {
    const id = getId(d);
    if (!id) return false;
    const isActive = activeId === id;
    const isHovered = hovered?.id.split(",").includes(id) ?? false;
    return isActive || isHovered;
  };

  return new GeoJsonLayer({
    id: layerId,
    data,
    pickable,
    onHover,
    onClick,
    stroked: true,
    filled: true,
    extruded: false,
    autoHighlight: false,
    getFillColor: (d) =>
      isActiveOrHovered(d as unknown as TFeature)
        ? styles.overlay.active.fillColor
        : styles.overlay.default.fillColor,
    getLineColor: (d) =>
      isActiveOrHovered(d as unknown as TFeature)
        ? styles.overlay.active.lineColor
        : styles.overlay.default.lineColor,
    getLineWidth: (d) =>
      isActiveOrHovered(d as unknown as TFeature)
        ? styles.overlay.active.lineWidth
        : styles.overlay.default.lineWidth,
    lineWidthUnits: "pixels",
    updateTriggers: {
      getFillColor: [hovered, activeId],
      getLineColor: [hovered, activeId],
      getLineWidth: [hovered, activeId],
    },
  });
}
