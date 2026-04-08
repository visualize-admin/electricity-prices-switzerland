import { PickingInfo } from "@deck.gl/core/typed";
import { GeoJsonLayer, GeoJsonLayerProps } from "@deck.gl/layers/typed";
import { easeExpIn, mean, ScaleThreshold } from "d3";
import { Feature, Geometry } from "geojson";

import {
  getFillColor,
  getStyles,
  HoverState,
  MapRenderMode,
} from "src/components/map-helpers";
import { OperatorFeature, OperatorLayerProperties } from "src/data/geo";
import { getObservationsWeightedMean } from "src/domain/data";
import {
  Maybe,
  OperatorObservationFieldsFragment,
  SunshineDataIndicatorRow,
} from "src/graphql/queries";

export type PickingInfoTyped<T> = Omit<PickingInfo, "object"> & {
  object: T | null;
};

// Common types for layer options
type LayerHoverHandler = (info: PickingInfo) => void;
type LayerClickHandler = (
  info: PickingInfo,
  event: { srcEvent: Event },
) => void;

interface EntityLayerOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  layerId: string;
  renderMode?: MapRenderMode;
  observationsByEntityId: Map<string, OperatorObservationFieldsFragment[]>;
  colorScale: ScaleThreshold<number, string>;
  highlightId?: string;
  onHover?: LayerHoverHandler;
  onClick?: LayerClickHandler;
}

interface MeshLayerOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  layerId: string;
  renderMode?: MapRenderMode;
}

interface OperatorLayerOptions {
  data: OperatorFeature[];
  accessor: (x: SunshineDataIndicatorRow) => Maybe<number> | undefined;
  observationsByOperator: Record<string, SunshineDataIndicatorRow>;
  colorScale: ScaleThreshold<number, string>;
  renderMode?: MapRenderMode;
}

interface OperatorInteractionLayerOptions {
  data: OperatorFeature[];
  accessor: (x: SunshineDataIndicatorRow) => Maybe<number> | undefined;
  observationsByOperator: Record<string, SunshineDataIndicatorRow>;
  hovered?: HoverState;
  activeId?: string;
  onHover?: LayerHoverHandler;
  onClick?: GeoJsonLayerProps<OperatorFeature>["onClick"];
  renderMode?: MapRenderMode;
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

export function makeEntityLayer(options: EntityLayerOptions) {
  const {
    data,
    layerId,
    renderMode,
    observationsByEntityId,
    colorScale,
    highlightId,
    onHover,
    onClick,
  } = options;
  const styles = getStyles(renderMode);

  return new GeoJsonLayer({
    id: layerId,
    data,
    pickable: true,
    stroked: false,
    filled: true,
    extruded: false,
    autoHighlight: false,
    getFillColor: (d) => {
      const id = d?.id?.toString();
      if (!id) return styles.areas.base.fillColor.doesNotExist;

      const obs = observationsByEntityId.get(id);
      return obs
        ? getFillColor(
            colorScale,
            getObservationsWeightedMean(obs),
            highlightId === id,
          )
        : styles.areas.base.fillColor.withoutData;
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

interface EntityHighlightLayerOptions {
  data: GeoJSON.FeatureCollection;
  hovered?: HoverState;
  activeId?: string | null;
  type: "municipality" | "canton";
  renderMode?: MapRenderMode;
}

export function makeEntityHighlightLayer(
  options: EntityHighlightLayerOptions,
) {
  const { data, hovered, activeId, type, renderMode } = options;
  const styles = getStyles(renderMode);

  return new GeoJsonLayer({
    id: `${type}-overlay`,
    /** @ts-expect-error bad types */
    data,
    pickable: false,
    stroked: true,
    filled: true,
    extruded: false,
    getFillColor: (d) => {
      const id = d?.id?.toString();
      if (!id) return styles.overlay.default.fillColor;

      const isActive = activeId === id;
      const isHovered = hovered?.type === type && hovered.id === id;

      // Only show overlay for the hovered/active municipality
      if (isActive || isHovered) {
        return styles.overlay.active.fillColor;
      }
      // All other municipalities remain transparent (no reduced opacity overlay)
      return styles.overlay.default.fillColor;
    },
    getLineColor: (d) => {
      const id = d?.id?.toString();
      const isActive = activeId === id;
      const isHovered = hovered?.type === type && hovered.id === id;

      if (isActive || isHovered) {
        return styles.overlay.active.lineColor;
      }
      return styles.overlay.default.lineColor;
    },
    getLineWidth: (d) => {
      const id = d?.id?.toString();
      const isActive = activeId === id;
      const isHovered = hovered?.type === type && hovered.id === id;

      if (isActive || isHovered) {
        return styles.overlay.active.lineWidth;
      }
      return styles.overlay.default.lineWidth;
    },
    lineWidthUnits: "pixels",
    updateTriggers: {
      getFillColor: [hovered, activeId],
      getLineColor: [hovered, activeId],
      getLineWidth: [hovered, activeId],
    },
  });
}

export function makeOperatorLayer(
  options: OperatorLayerOptions,
) {
  const { data, accessor, observationsByOperator, colorScale, renderMode } =
    options;
  const styles = getStyles(renderMode);

  return new GeoJsonLayer<OperatorFeature>({
    id: "operator-layer",
    data,
    filled: true,
    stroked: false,
    updateTriggers: {
      getFillColor: [getFillColor, accessor, observationsByOperator],
    },
    getFillColor: (x: Feature<Geometry, OperatorLayerProperties>) => {
      if (!x.properties) {
        return styles.operators.base.fillColor.doesNotExist;
      }
      const operatorIds = x.properties.operators;
      const values = operatorIds
        .map((x) => {
          const op = observationsByOperator[x];
          return accessor(op) ?? null;
        })
        .filter((x) => x !== null && x !== undefined);
      if (values.length === 0) {
        return styles.operators.base.fillColor.withoutData;
      }
      const value = mean(values);
      const color = getFillColor(colorScale, value, false);
      return color;
    },
    lineWidthUnits: "pixels",
    transitions: {
      getFillColor: {
        duration: styles.operators.base.transitions.duration,
        easing: easeExpIn,
      },
    },
  });
}

export function makeOperatorInteractionLayer(
  options: OperatorInteractionLayerOptions,
) {
  const {
    data,
    accessor,
    observationsByOperator,
    hovered,
    activeId,
    onHover,
    onClick,
    renderMode,
  } = options;
  const styles = getStyles(renderMode);

  const deps = [
    getFillColor,
    accessor,
    observationsByOperator,
    activeId,
    hovered,
  ];

  const isFeatureHovered = (feature: OperatorFeature) => {
    const id = feature.properties.id;
    return hovered?.type === "operator" && hovered.id.split(",").includes(id);
  };

  return new GeoJsonLayer<OperatorFeature>({
    id: "operator-layer-pickable",
    data,
    filled: true,
    onHover,
    autoHighlight: false,
    onClick,
    stroked: true,
    getFillColor: (d: OperatorFeature) => {
      const id = d.properties.operators?.[0]?.toString();
      const isActive = activeId === id;
      const isHovered = isFeatureHovered(d);

      if (isActive || isHovered) {
        return styles.operators.pickable.highlightColor;
      }
      return styles.operators.pickable.fillColor;
    },
    lineWidthUnits: "pixels",
    pickable: true,
    updateTriggers: {
      getFillColor: deps,
      getLineColor: deps,
      getLineWidth: deps,
    },
    getLineColor: (d: OperatorFeature) => {
      const id = d.properties.id;
      const isActive = activeId === id;
      const isHovered = isFeatureHovered(d);

      if (isActive || isHovered) {
        return styles.operators.overlay.active.lineColor;
      }
      return styles.operators.overlay.inactive.lineColor;
    },
    getLineWidth: (d: OperatorFeature) => {
      const id = d.properties.id;
      const isActive = activeId === id;
      const isHovered = isFeatureHovered(d);

      if (isActive || isHovered) {
        return styles.operators.overlay.active.lineWidth;
      }
      return styles.operators.overlay.inactive.lineWidth;
    },
  });
}
