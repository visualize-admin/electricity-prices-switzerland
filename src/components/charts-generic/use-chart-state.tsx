import { createContext, useContext } from "react";
import { ChartFields } from "../../domain/config-types";
import { ComponentFieldsFragment, Observation } from "../../domain/data";
import { AreasState } from "./areas/areas-state";
import { GroupedColumnsState } from "./columns/columns-grouped-state";
import { StackedColumnsState } from "./columns/columns-stacked-state";
import { ColumnsState } from "./columns/columns-state";
import { HistogramState } from "./histogram/histogram-state";
import { LinesState } from "./lines/lines-state";
import { BarsState } from "./bars/bars-state";
import { GroupedBarsState } from "./bars/bars-grouped-state";
import { RangePlotState } from "./rangeplot/rangeplot-state";
import { Bounds } from "./use-width";
import { ScaleLinear, ScaleBand, ScaleThreshold } from "d3";

export interface ChartProps {
  data: Observation[];
  fields: ChartFields;
  dimensions: ComponentFieldsFragment[];
  measures: ComponentFieldsFragment[];
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
