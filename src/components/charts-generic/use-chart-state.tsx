import { Bin, ScaleBand, ScaleLinear, ScaleOrdinal, ScaleTime } from "d3";
import { createContext, useContext } from "react";

import { Annotation } from "src/components/charts-generic/annotation/annotation-x";
import { Tooltip } from "src/components/charts-generic/interaction/tooltip";
import { Bounds } from "src/components/charts-generic/use-width";
import { ChartFields } from "src/domain/config-types";
import {
  ComponentFieldsFragment,
  GenericObservation,
  ObservationValue,
} from "src/domain/data";

export interface ChartProps {
  data: GenericObservation[];
  fields: ChartFields;
  dimensions: ComponentFieldsFragment[];
  measures: ComponentFieldsFragment[];
  medianValue: number | undefined;
}

export interface GroupedColumnsState {
  sortedData: GenericObservation[];
  bounds: Bounds;
  getX: (d: GenericObservation) => string;
  xScale: ScaleBand<string>;
  xScaleInteraction: ScaleBand<string>;
  xScaleIn: ScaleBand<string>;
  getY: (d: GenericObservation) => number;
  yScale: ScaleLinear<number, number>;
  getSegment: (d: GenericObservation) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  grouped: [string, Record<string, ObservationValue>[]][];
  getAnnotationInfo: (d: GenericObservation) => Tooltip;
}

export interface RangePlotState {
  bounds: Bounds;
  data: GenericObservation[];
  medianValue: number | undefined;
  getX: (d: GenericObservation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: GenericObservation) => string;
  yScale: ScaleBand<string>;
  colors: ScaleLinear<string, string>;
  rangeGroups: [string, Record<string, ObservationValue>[]][];
  annotations?: Annotation[];
  getAnnotationInfo: (d: GenericObservation) => Tooltip;
}

export interface AreasState {
  data: GenericObservation[];
  bounds: Bounds;
  getX: (d: GenericObservation) => Date;
  xScale: ScaleTime<number, number>;
  xUniqueValues: Date[];
  getY: (d: GenericObservation) => number;
  yScale: ScaleLinear<number, number>;
  getSegment: (d: GenericObservation) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  wide: { [key: string]: number | string }[];
  series: $FixMe[];
  getAnnotationInfo: (d: GenericObservation) => Tooltip;
}

export interface RangePlotState {
  bounds: Bounds;
  data: GenericObservation[];
  medianValue: number | undefined;
  getX: (d: GenericObservation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: GenericObservation) => string;
  yScale: ScaleBand<string>;
  colors: ScaleLinear<string, string>;
  rangeGroups: [string, Record<string, ObservationValue>[]][];
  annotations?: Annotation[];
  getAnnotationInfo: (d: GenericObservation) => Tooltip;
}

export interface GroupedBarsState {
  sortedData: GenericObservation[];
  bounds: Bounds;
  getX: (d: GenericObservation) => number;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleBand<string>;
  getSegment: (d: GenericObservation) => string;
  getLabel: (d: GenericObservation) => string;
  getColor: (d: GenericObservation) => string;
  getOpacity: (d: GenericObservation) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  opacityScale: ScaleOrdinal<string, number>;
}

export interface BarsState {
  bounds: Bounds;
  sortedData: GenericObservation[];
  getX: (d: GenericObservation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: GenericObservation) => string;
  yScale: ScaleBand<string>;
  getSegment: (d: GenericObservation) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
}

export interface LinesState {
  data: GenericObservation[];
  bounds: Bounds;
  segments: string[];
  getX: (d: GenericObservation) => Date;
  xScale: ScaleTime<number, number>;
  xUniqueValues: Date[];
  getY: (d: GenericObservation) => number;
  yScale: ScaleLinear<number, number>;
  getSegment: (d: GenericObservation) => string;
  getColor: (d: GenericObservation) => string;
  colors: ScaleOrdinal<string, string>;
  xAxisLabel: string;
  yAxisLabel: string;
  grouped: [string, Record<string, ObservationValue>[]][];
  wide: ArrayLike<Record<string, ObservationValue>>;
  xKey: string;
  getAnnotationInfo: (d: GenericObservation) => Tooltip;
}

export interface HistogramState {
  bounds: Bounds;
  data: GenericObservation[];
  medianValue: number | undefined;
  getX: (d: GenericObservation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: GenericObservation[]) => number;
  yScale: ScaleLinear<number, number>;
  xAxisLabel?: string;
  yAxisLabel?: string;
  bins: Bin<GenericObservation, number>[];
  colors: ScaleLinear<string, string>;
  annotations?: Annotation[];
  getAnnotationInfo: (d: GenericObservation) => Tooltip;
}

export interface ColumnsState {
  bounds: Bounds;
  sortedData: GenericObservation[];
  getX: (d: GenericObservation) => string;
  xScale: ScaleBand<string>;
  xScaleInteraction: ScaleBand<string>;
  getY: (d: GenericObservation) => number;
  yScale: ScaleLinear<number, number>;
  getSegment: (d: GenericObservation) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  getAnnotationInfo: (d: GenericObservation) => Tooltip;
}

export interface StackedColumnsState {
  sortedData: GenericObservation[];
  bounds: Bounds;
  getX: (d: GenericObservation) => string;
  xScale: ScaleBand<string>;
  xScaleInteraction: ScaleBand<string>;
  getY: (d: GenericObservation) => number;
  yScale: ScaleLinear<number, number>;
  getSegment: (d: GenericObservation) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  wide: Record<string, ObservationValue>[];
  grouped: [string, Record<string, ObservationValue>[]][];
  series: $FixMe[];
  getAnnotationInfo: (
    d: GenericObservation,
    orderedSegments: string[]
  ) => Tooltip;
}

export type ChartState =
  | ColumnsState
  | BarsState
  | GroupedBarsState
  | StackedColumnsState
  | GroupedColumnsState
  | AreasState
  | LinesState
  | HistogramState
  | RangePlotState
  | undefined;

export const ChartContext = createContext<ChartState>(undefined);

export const useChartState = () => {
  const ctx = useContext(ChartContext);
  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <ChartStateProvider /> to useChartState()"
    );
  }
  return ctx;
};

// export type SharedChartState = {
//   bounds: Bounds;
//   data: Observation[];
//   getX: (d: Observation) => number;
//   xScale: ScaleLinear<number, number>;
//   getY: (d: Observation) => string | number;
//   yScale: ScaleBand<string> | ScaleLinear<number, number>;
//   colors: ScaleLinear<string, string> | ScaleThreshold<number, string>;
// };
