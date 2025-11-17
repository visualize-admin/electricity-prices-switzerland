import { PickingInfo } from "@deck.gl/core/typed";
import { GeoJsonLayer, GeoJsonLayerProps } from "@deck.gl/layers/typed";
import { easeExpIn, mean, ScaleThreshold } from "d3";
import { Feature, Geometry } from "geojson";

import { getFillColor, HoverState, styles } from "src/components/map-helpers";
import { OperatorFeature, OperatorLayerProperties } from "src/data/geo";
import { getObservationsWeightedMean } from "src/domain/data";
import {
  Maybe,
  OperatorObservationFieldsFragment,
  SunshineDataIndicatorRow,
} from "src/graphql/queries";

// Common types for layer options
type LayerHoverHandler = (info: PickingInfo) => void;
type LayerClickHandler = (
  info: PickingInfo,
  event: { srcEvent: Event }
) => void;

interface MunicipalityLayerOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // Can be FeatureCollection for base layer or MultiLineString for mesh
  layerId: string;
  mode: "base" | "mesh";
  // Options for base mode (data visualization)
  observationsByMunicipalityId?: Map<
    string,
    OperatorObservationFieldsFragment[]
  >;
  colorScale?: ScaleThreshold<number, string> | undefined;
  highlightId?: string;
  onHover?: LayerHoverHandler;
  onClick?: LayerClickHandler;
}

interface SunshineOperatorLayerOptions {
  data: OperatorFeature[];
  accessor: (x: SunshineDataIndicatorRow) => Maybe<number> | undefined;
  observationsByOperator: Record<string, SunshineDataIndicatorRow>;
  colorScale: ScaleThreshold<number, string>;
}

interface SunshineOperatorPickableLayerOptions {
  data: OperatorFeature[];
  accessor: (x: SunshineDataIndicatorRow) => Maybe<number> | undefined;
  observationsByOperator: Record<string, SunshineDataIndicatorRow>;
  hovered?: HoverState;
  activeId?: string;
  onHover?: LayerHoverHandler;
  onClick?: GeoJsonLayerProps<OperatorFeature>["onClick"];
}

interface LakesLayerOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // This can be either FeatureCollection or Feature
  layerId?: string;
}

interface CantonsLayerOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // This is a MultiLineString, not a FeatureCollection
  layerId?: string;
}

export function makeMunicipalityLayer(options: MunicipalityLayerOptions) {
  const {
    data,
    layerId,
    mode,
    observationsByMunicipalityId,
    colorScale,
    highlightId,
    onHover,
    onClick,
  } = options;

  if (mode === "base") {
    if (!observationsByMunicipalityId || !colorScale) {
      throw new Error(
        "Base mode requires observationsByMunicipalityId and colorScale"
      );
    }

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
        if (!id) return styles.municipalities.base.fillColor.doesNotExist;

        const obs = observationsByMunicipalityId.get(id);
        return obs
          ? getFillColor(
              colorScale,
              getObservationsWeightedMean(obs),
              highlightId === id
            )
          : styles.municipalities.base.fillColor.withoutData;
      },
      onHover: onHover
        ? ({ x, y, object }: PickingInfo) => {
            const id = object?.id?.toString();
            onHover({
              x,
              y,
              object:
                object && id ? { x, y, id, type: "municipality" } : undefined,
            } as PickingInfo);
          }
        : undefined,
      onClick,
      updateTriggers: {
        getFillColor: [observationsByMunicipalityId, highlightId],
      },
    });
  } else {
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
      getLineWidth: styles.municipalityMesh.lineWidth,
      lineMiterLimit: 1,
      getLineColor: meshStyles.lineColor,
    });
  }
}

export function makeLakesLayer(options: LakesLayerOptions) {
  const { data, layerId = "lakes" } = options;

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
  const { data, layerId = "cantons" } = options;

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

interface EnergyPricesOverlayLayerOptions {
  data: GeoJSON.FeatureCollection;
  hovered?: HoverState;
  activeId?: string | null;
  type: "municipality" | "canton";
}

export function makeEnergyPricesOverlayLayer(
  options: EnergyPricesOverlayLayerOptions
) {
  const { data, hovered, activeId, type } = options;

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

export function makeSunshineOperatorLayer(
  options: SunshineOperatorLayerOptions
) {
  const { data, accessor, observationsByOperator, colorScale } = options;

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

export function makeSunshineOperatorPickableLayer(
  options: SunshineOperatorPickableLayerOptions
) {
  const {
    data,
    accessor,
    observationsByOperator,
    hovered,
    activeId,
    onHover,
    onClick,
  } = options;

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
