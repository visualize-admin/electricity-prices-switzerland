import { createContext, useContext } from "react";
import { ChartFields } from "../../domain/config-types";
import {
  Observation,
  ComponentFieldsFragment,
  DimensionFieldsWithValuesFragment,
} from "../../domain/data";
import { GroupedColumnsState } from "./columns/columns-grouped-state";
import { StackedColumnsState } from "./columns/columns-stacked-state";
import { ColumnsState } from "./columns/columns-state";
import { AreasState } from "./areas/areas-state";
import { LinesState } from "./lines/lines-state";

export interface ChartProps {
  data: Observation[];
  fields: ChartFields;
  dimensions: DimensionFieldsWithValuesFragment[];
  measures: ComponentFieldsFragment[];
}

export type ChartState =
  | ColumnsState
  | StackedColumnsState
  | GroupedColumnsState
  | AreasState
  | LinesState;

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
