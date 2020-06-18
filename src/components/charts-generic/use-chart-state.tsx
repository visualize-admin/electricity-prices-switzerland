import { createContext, useContext } from "react";
import { ChartFields } from "../../domain/config-types";
import { Observation } from "../../domain/data";
import { ComponentFieldsFragment } from "../../graphql/query-hooks";
import { GroupedColumnsState } from "./columns/columns-grouped-state";
import { StackedColumnsState } from "./columns/columns-stacked-state";
import { ColumnsState } from "./columns/columns-state";

export interface ChartProps {
  data: Observation[];
  fields: ChartFields;
  dimensions: ComponentFieldsFragment[];
  measures: ComponentFieldsFragment[];
}

export type ChartState =
  | ColumnsState
  | StackedColumnsState
  | GroupedColumnsState;

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
