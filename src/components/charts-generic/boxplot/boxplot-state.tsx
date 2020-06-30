import {
  scaleThreshold,
  scaleBand,
  ScaleBand,
  ScaleSequential,
  interpolateRainbow,
} from "d3";
import {
  ascending,
  Bin,
  descending,
  max,
  median,
  min,
  extent,
  group,
} from "d3-array";
import {
  ScaleLinear,
  scaleLinear,
  ScaleThreshold,
  scaleSequential,
} from "d3-scale";
import * as React from "react";
import { ReactNode, useCallback } from "react";
import {
  BoxPlotFields,
  SortingOrder,
  SortingType,
} from "../../../domain/config-types";
import { Observation, ObservationValue } from "../../../domain/data";
import { mkNumber, useFormatNumber } from "../../../domain/helpers";
import { estimateTextWidth } from "../../../lib/estimate-text-width";
import { LEFT_MARGIN_OFFSET, BOTTOM_MARGIN_OFFSET } from "../constants";
import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";
import { Bounds, Observer, useWidth } from "../use-width";

export const DOT_RADIUS = 8;
export const SPACE_ABOVE = 8;

export interface BoxPlotState {
  bounds: Bounds;
  data: Observation[];
  getX: (d: Observation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: Observation) => string;
  yScale: ScaleBand<string>;
  colors: ScaleSequential<string>;
  grouped: [string, Record<string, ObservationValue>[]][];
}

const useBoxPlotState = ({
  data,
  fields,
}: Pick<ChartProps, "data" | "measures"> & {
  fields: BoxPlotFields;
}): BoxPlotState => {
  const width = useWidth();
  const formatNumber = useFormatNumber();

  const getX = useCallback(
    (d: Observation) => d[fields.x.componentIri] as number,
    [fields.x.componentIri]
  );
  const getY = useCallback(
    (d: Observation) => d[fields.y.componentIri] as string,
    [fields.y.componentIri]
  );

  const xDomain = extent(data, (d) => getX(d));
  const xScale = scaleLinear().domain(xDomain).nice();

  // y
  const bandDomain = [...new Set(data.map((d) => getY(d)))];
  console.log({ bandDomain });
  const chartHeight = bandDomain.length * (DOT_RADIUS * 2 + SPACE_ABOVE);
  const yScale = scaleBand<string>().domain(bandDomain).range([0, chartHeight]);

  const colors = scaleSequential(interpolateRainbow).domain(xDomain);

  const left = Math.max(
    estimateTextWidth(yScale.domain()[0]),
    estimateTextWidth(yScale.domain()[1])
  );
  const margins = {
    top: 50,
    right: 40,
    bottom: BOTTOM_MARGIN_OFFSET,
    left: left + LEFT_MARGIN_OFFSET,
  };
  const chartWidth = width - margins.left - margins.right;
  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };

  xScale.range([0, chartWidth]);

  // Group
  const groupedMap = group(data, getY);
  const grouped = [...groupedMap];

  return {
    bounds,
    data,
    getX,
    xScale,
    getY,
    yScale,
    colors,
    grouped,
  };
};

const BoxPlotProvider = ({
  data,
  fields,
  measures,
  children,
}: Pick<ChartProps, "data" | "measures"> & {
  children: ReactNode;
  fields: BoxPlotFields;
}) => {
  const state = useBoxPlotState({
    data,
    fields,
    measures,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const BoxPlot = ({
  data,
  fields,
  measures,
  children,
}: Pick<ChartProps, "data" | "measures"> & {
  children: ReactNode;
  fields: BoxPlotFields;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <BoxPlotProvider data={data} fields={fields} measures={measures}>
          {children}
        </BoxPlotProvider>
      </InteractionProvider>
    </Observer>
  );
};
