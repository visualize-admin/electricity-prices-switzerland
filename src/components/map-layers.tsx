import { PickingInfo } from "@deck.gl/core/typed";
import { GeoJsonLayer, GeoJsonLayerProps } from "@deck.gl/layers/typed";
import { easeExpIn, mean, ScaleThreshold } from "d3";
import { Feature, Geometry } from "geojson";

import { getFillColor, HoverState, styles } from "src/components/map-helpers";
import { OperatorFeature, OperatorLayerProperties } from "src/data/geo";
import {
  Maybe,
  OperatorObservationFieldsFragment,
  SunshineDataIndicatorRow,
} from "src/graphql/queries";

// Common types for layer options
export type LayerHoverHandler = (info: PickingInfo) => void;
export type LayerClickHandler = (info: PickingInfo, event?: unknown) => void;

// Energy Prices Map Layers

export interface EnergyPricesMunicipalitiesBaseLayerOptions {
  data: GeoJSON.FeatureCollection;
  observationsByMunicipalityId: Map<
    string,
    OperatorObservationFieldsFragment[]
  >;
  colorScale: ScaleThreshold<number, string> | undefined;
  highlightId?: string;
  onHover?: LayerHoverHandler;
  onClick?: LayerClickHandler;
}

export function makeEnergyPricesMunicipalitiesBaseLayer(
  options: EnergyPricesMunicipalitiesBaseLayerOptions
) {
  const {
    data,
    observationsByMunicipalityId,
    colorScale,
    highlightId,
    onHover,
    onClick,
  } = options;

  return new GeoJsonLayer({
    id: "municipalities-base",
    /** @ts-expect-error bad types */
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
            mean(obs, (d) => d.value),
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
}

export interface EnergyPricesMunicipalityMeshLayerOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // This is a MultiLineString, not a FeatureCollection
}

export function makeEnergyPricesMunicipalityMeshLayer(
  options: EnergyPricesMunicipalityMeshLayerOptions
) {
  const { data } = options;

  return new GeoJsonLayer({
    id: "municipality-mesh",
    data,
    pickable: false,
    stroked: true,
    filled: false,
    extruded: false,
    lineWidthMinPixels: styles.municipalityMesh.lineWidthMinPixels,
    lineWidthMaxPixels: styles.municipalityMesh.lineWidthMaxPixels,
    getLineWidth: styles.municipalityMesh.lineWidth,
    lineMiterLimit: 1,
    getLineColor: styles.municipalityMesh.lineColor,
  });
}

export interface LakesLayerOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // This can be either FeatureCollection or Feature
}

export function makeEnergyPricesLakesLayer(options: LakesLayerOptions) {
  const { data } = options;

  return new GeoJsonLayer({
    id: "lakes",
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

export interface EnergyPricesCantonsLayerOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // This is a MultiLineString, not a FeatureCollection
}

export function makeEnergyPricesCantonsLayer(
  options: EnergyPricesCantonsLayerOptions
) {
  const { data } = options;

  return new GeoJsonLayer({
    id: "cantons",
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

export interface EnergyPricesMunicipalitiesOverlayLayerOptions {
  data: GeoJSON.FeatureCollection;
  hovered?: HoverState;
  activeId?: string | null;
}

export function makeEnergyPricesMunicipalitiesOverlayLayer(
  options: EnergyPricesMunicipalitiesOverlayLayerOptions
) {
  const { data, hovered, activeId } = options;

  return new GeoJsonLayer({
    id: "municipalities-overlay",
    /** @ts-expect-error bad types */
    data,
    pickable: false,
    stroked: true,
    filled: true,
    extruded: false,
    getFillColor: (d) => {
      const id = d?.id?.toString();
      if (!id) return styles.municipalities.overlay.default.fillColor;

      const isActive = activeId === id;
      const isHovered = hovered?.type === "municipality" && hovered.id === id;
      const hasInteraction = hovered || activeId;

      if (isActive || isHovered) {
        return styles.municipalities.overlay.active.fillColor;
      } else if (hasInteraction) {
        return styles.municipalities.overlay.inactive.fillColor;
      }
      return styles.municipalities.overlay.default.fillColor;
    },
    getLineColor: (d) => {
      const id = d?.id?.toString();
      const isActive = activeId === id;
      const isHovered = hovered?.type === "municipality" && hovered.id === id;

      if (isActive || isHovered) {
        return styles.municipalities.overlay.active.lineColor;
      }
      return styles.municipalities.overlay.default.lineColor;
    },
    getLineWidth: (d) => {
      const id = d?.id?.toString();
      const isActive = activeId === id;
      const isHovered = hovered?.type === "municipality" && hovered.id === id;

      if (isActive || isHovered) {
        return styles.municipalities.overlay.active.lineWidth;
      }
      return styles.municipalities.overlay.default.lineWidth;
    },
    lineWidthUnits: "pixels",
    updateTriggers: {
      getFillColor: [hovered, activeId],
      getLineColor: [hovered, activeId],
      getLineWidth: [hovered, activeId],
    },
  });
}

// Sunshine Map Layers

export interface SunshineOperatorLayerOptions {
  data: OperatorFeature[];
  accessor: (x: SunshineDataIndicatorRow) => Maybe<number> | undefined;
  observationsByOperator: Record<string, SunshineDataIndicatorRow>;
  colorScale: ScaleThreshold<number, string>;
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

export interface SunshineMunicipalityLayerOptions {
  data: GeoJSON.Feature[];
}

export function makeSunshineMunicipalityLayer(
  options: SunshineMunicipalityLayerOptions
) {
  const { data } = options;

  return new GeoJsonLayer({
    id: "municipality-layer",
    data,
    getLineColor: styles.operators.municipalityMesh.lineColor,
    lineWidthUnits: "pixels",
    stroked: true,
    lineWidthMinPixels: styles.operators.municipalityMesh.lineWidthMinPixels,
    lineWidthMaxPixels: styles.operators.municipalityMesh.lineWidthMaxPixels,
    filled: false,
  });
}

export function makeSunshineLakesLayer(options: LakesLayerOptions) {
  const { data } = options;

  return new GeoJsonLayer({
    id: "lakes-layer",
    data,
    getFillColor: styles.lakes.fillColor,
    getLineColor: styles.lakes.lineColor,
    lineWidthUnits: "pixels",
    lineWidthMinPixels: styles.lakes.lineWidthMinPixels,
    lineWidthMaxPixels: styles.lakes.lineWidthMaxPixels,
    filled: true,
    stroked: true,
  });
}

export interface SunshineOperatorPickableLayerOptions {
  data: OperatorFeature[];
  accessor: (x: SunshineDataIndicatorRow) => Maybe<number> | undefined;
  observationsByOperator: Record<string, SunshineDataIndicatorRow>;
  hovered?: HoverState;
  activeId?: string;
  onHover?: LayerHoverHandler;
  onClick?: GeoJsonLayerProps<OperatorFeature>["onClick"];
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
      const isHovered = hovered?.type === "operator" && hovered.id === id;

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
    getLineColor: (d: Feature<Geometry, OperatorLayerProperties>) => {
      const id = d.properties.operators?.[0]?.toString();
      const isActive = activeId === id;
      const isHovered = hovered?.type === "operator" && hovered.id === id;

      if (isActive || isHovered) {
        return styles.operators.overlay.active.lineColor;
      }
      return styles.operators.overlay.inactive.lineColor;
    },
    getLineWidth: (d: Feature<Geometry, OperatorLayerProperties>) => {
      const id = d.properties.operators?.[0]?.toString();
      const isActive = activeId === id;
      const isHovered = hovered?.type === "operator" && hovered.id === id;

      if (isActive || isHovered) {
        return styles.operators.overlay.active.lineWidth;
      }
      return styles.operators.overlay.inactive.lineWidth;
    },
  });
}
