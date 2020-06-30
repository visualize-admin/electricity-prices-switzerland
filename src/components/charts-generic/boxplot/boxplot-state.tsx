import {
  scaleSequential,
  scaleBand,
  ScaleBand,
  ScaleSequential,
  interpolateRainbow,
  interpolateLab,
  interpolateViridis,
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
  rollup,
} from "d3-array";
import { ScaleLinear, scaleLinear } from "d3-scale";
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
import { sortByIndex } from "../../../lib/array";

export const DOT_RADIUS = 8;
export const SPACE_ABOVE = 8;

export interface BoxPlotState {
  bounds: Bounds;
  data: Observation[];
  getX: (d: Observation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: Observation) => string;
  yScale: ScaleBand<string>;
  colors: ScaleLinear<string, string>;
  sortedGroups: [string, Record<string, ObservationValue>[]][];
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

  const chartHeight = bandDomain.length * (DOT_RADIUS * 2 + SPACE_ABOVE);
  const yScale = scaleBand<string>().domain(bandDomain).range([0, chartHeight]);

  const m = median(data, (d) => getX(d));
  const colorDomain = [xDomain[0], m - m * 0.15, m, m + m * 0.15, xDomain[1]];
  const colorRange = ["#24B39C", "#A8DC90", "#E7EC83", "#F1B865", "#D64B47"];
  const colors = scaleLinear<string, string>()
    .domain(colorDomain)
    .range(colorRange)
    .interpolate(interpolateLab);

  const left = Math.max(
    estimateTextWidth(yScale.domain()[0]),
    estimateTextWidth(yScale.domain()[1])
  );
  const margins = {
    top: 50,
    right: 40,
    bottom: 100, // BOTTOM_MARGIN_OFFSET,
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
  // Sort by group median
  const yOrder = [
    ...rollup(
      data,
      (v) => median(v, (x) => getX(x)),
      (x) => getY(x)
    ),
  ]
    .sort((a, b) => ascending(a[1], b[1]))
    .map((d) => d[0]);
  const groupedMap = group(data, getY);
  const sortedGroups = sortByIndex({
    data: [...groupedMap],
    order: yOrder,
    getCategory: (d) => d[0],
    sortOrder: "asc",
  });

  return {
    bounds,
    data,
    getX,
    xScale,
    getY,
    yScale,
    colors,
    sortedGroups,
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
