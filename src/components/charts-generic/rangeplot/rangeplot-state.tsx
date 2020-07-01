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
  RangePlotFields,
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

export interface RangePlotState {
  bounds: Bounds;
  data: Observation[];
  getX: (d: Observation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: Observation) => string;
  yScale: ScaleBand<string>;
  colors: ScaleLinear<string, string>;
  rangeGroups: [string, Record<string, ObservationValue>[]][];
}

const useRangePlotState = ({
  data,
  fields,
}: Pick<ChartProps, "data" | "measures"> & {
  fields: RangePlotFields;
}): RangePlotState => {
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
  // Sort by group median
  const yOrderedDomain = [
    ...rollup(
      data,
      (v) => median(v, (x) => getX(x)),
      (x) => getY(x)
    ),
  ]
    .sort((a, b) => ascending(a[1], b[1]))
    .map((d) => d[0]);

  const chartHeight = yOrderedDomain.length * (DOT_RADIUS * 2 + SPACE_ABOVE);
  const yScale = scaleBand<string>()
    .domain(yOrderedDomain)
    .range([0, chartHeight]);

  const m = median(data, (d) => getX(d));
  const colorDomain = [xDomain[0], m - m * 0.1, m, m + m * 0.1, xDomain[1]];
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
  const rangeGroups = [...group(data, getY)];

  return {
    bounds,
    data,
    getX,
    xScale,
    getY,
    yScale,
    colors,
    rangeGroups,
  };
};

const BoxPlotProvider = ({
  data,
  fields,
  measures,
  children,
}: Pick<ChartProps, "data" | "measures"> & {
  children: ReactNode;
  fields: RangePlotFields;
}) => {
  const state = useRangePlotState({
    data,
    fields,
    measures,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const RangePlot = ({
  data,
  fields,
  measures,
  children,
}: Pick<ChartProps, "data" | "measures"> & {
  children: ReactNode;
  fields: RangePlotFields;
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
