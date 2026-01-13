import {
  Bin,
  ScaleBand,
  ScaleLinear,
  ScaleOrdinal,
  ScaleTime,
  Series,
} from "d3";
import { createContext, useContext } from "react";

import { Annotation } from "src/components/charts-generic/annotation/annotation-x";
import { Tooltip } from "src/components/charts-generic/interaction/tooltip";
import { Bounds } from "src/components/charts-generic/use-width";
import { ChartFields, HistogramFields } from "src/domain/config-types";
import {
  ComponentFieldsFragment,
  GenericObservation,
  ObservationValue,
} from "src/domain/data";

import { BinMeta } from "./histogram/histogram-state";

export type ChartProps = {
  data: GenericObservation[];
  fields: ChartFields;
  dimensions: ComponentFieldsFragment[];
  measures: ComponentFieldsFragment[];
  medianValue: number | undefined;
};

type GroupedColumnsState = {
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
};

export type RangePlotState = {
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
  xAxisLabel?: string;
};

export type AreasState = {
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
};

export type GroupedBarsState = {
  sortedData: GenericObservation[];
  bounds: Bounds;
  getX: (d: GenericObservation) => number;
  xScale: ScaleLinear<number, number>;
  yScale: (s: string) => number;
  getSegment: (d: GenericObservation) => string;
  getLabel: (d: GenericObservation) => string;
  getColor: (d: GenericObservation) => string;
  getOpacity: (d: GenericObservation) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  opacityScale: ScaleOrdinal<string, number>;
  xAxisLabel?: string;
};

type BarsState = {
  bounds: Bounds;
  sortedData: GenericObservation[];
  getX: (d: GenericObservation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: GenericObservation) => string;
  yScale: ScaleBand<string>;
  getSegment: (d: GenericObservation) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
};

export type LinesState = {
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
  xAxisLabel?: string;
  yAxisLabel?: string;
  grouped: [string, Record<string, ObservationValue>[]][];
  wide: ArrayLike<Record<string, ObservationValue>>;
  xKey: string;
  getAnnotationInfo: (d: GenericObservation) => Tooltip;
};

export type HistogramState = {
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
  binMeta: BinMeta[];
  colors: ScaleLinear<string, string>;
  fields: HistogramFields;
  annotations?: Annotation[];
  getAnnotationInfo: (d: GenericObservation) => Tooltip;
  yAsPercentage?: boolean;
  totalCount?: number;
  groupedBy?: number;
  bandScale?: ScaleBand<string>;
};

export type ColumnsState = {
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
};

type StackedColumnsState = {
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
};

export interface DotPlotState {
  data: GenericObservation[];
  bounds: Bounds;
  segments: string[];
  getX: (d: GenericObservation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: GenericObservation) => string;
  yScale: ScaleBand<string>;
  getSegment: (d: GenericObservation) => string;
  colors: ScaleOrdinal<string, string>;
  getAnnotationInfo: (d: GenericObservation) => Tooltip;
  getColor: (d: GenericObservation) => string;
  getHighlightEntity: (d: GenericObservation) => string | number | null;
  highlightedValue: string | number | null;
  getTooltipLabel: (d: GenericObservation) => string;
  medianValue?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
}
export type StackRow = Record<string, number | string>;

export type StackedBarsState = {
  data: GenericObservation[];
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
  categories: string[];
  stackedData: Series<StackRow, string>[];
  getSegmentValue: (category: string, segment: string) => number;
  getTotalValue: (category: string) => number;
  getCategory: (d: GenericObservation) => string;
  getCategoryFromYValue: (
    yValue: number,
    data: GenericObservation[]
  ) => string | undefined;
  annotations?: Annotation[];
  xAxisLabel?: string;
  getAnnotationInfo: (d: GenericObservation) => Tooltip;
};

type ChartState =
  | StackedBarsState
  | ColumnsState
  | BarsState
  | GroupedBarsState
  | StackedColumnsState
  | GroupedColumnsState
  | AreasState
  | LinesState
  | HistogramState
  | RangePlotState
  | DotPlotState
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
