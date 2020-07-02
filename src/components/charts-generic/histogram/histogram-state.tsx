import { scaleThreshold } from "d3";
import {
  ascending,
  Bin,
  descending,
  histogram,
  max,
  median,
  min,
} from "d3-array";
import { ScaleLinear, scaleLinear, ScaleThreshold } from "d3-scale";
import * as React from "react";
import { ReactNode, useCallback } from "react";
import {
  HistogramFields,
  SortingOrder,
  SortingType,
} from "../../../domain/config-types";
import { Observation } from "../../../domain/data";
import { mkNumber, useFormatNumber } from "../../../domain/helpers";
import { estimateTextWidth } from "../../../lib/estimate-text-width";
import { LEFT_MARGIN_OFFSET } from "../constants";
import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";
import { Bounds, Observer, useWidth } from "../use-width";

export interface HistogramState {
  bounds: Bounds;
  data: Observation[];
  getX: (d: Observation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: $FixMe[]) => number;
  yScale: ScaleLinear<number, number>;
  xAxisLabel?: string;
  bins: Bin<Observation, number>[];
  colors: ScaleThreshold<number, string>;
}

const useHistogramState = ({
  data,
  fields,
  measures,
  aspectRatio,
}: Pick<ChartProps, "data" | "measures"> & {
  fields: HistogramFields;
  aspectRatio: number;
}): HistogramState => {
  const width = useWidth();
  const formatNumber = useFormatNumber();

  const getX = useCallback(
    (d: Observation) => d[fields.x.componentIri] as number,
    [fields.x.componentIri]
  );

  // x
  const minValue = min(data, (d) => getX(d));
  const maxValue = max(data, (d) => getX(d));
  const xDomain = [mkNumber(minValue), mkNumber(maxValue)];
  const xScale = scaleLinear().domain(xDomain).nice();

  // Colors
  const colorRange = ["#24B39C", "#A8DC90", "#E7EC83", "#F1B865", "#D64B47"];
  const m = median(data, (d) => getX(d));
  const colorDomain = [m - m * 0.15, m - m * 0.05, m + m * 0.05, m + m * 0.15];
  const colors = scaleThreshold<number, string>()
    .domain(colorDomain)
    .range(colorRange);

  // y
  const bins = histogram<Observation, number>()
    .value((x) => getX(x))
    .domain([mkNumber(minValue), mkNumber(maxValue)])
    .thresholds(colorDomain)(data);
  // .thresholds(xScale.ticks(20))(data);

  const yScale = scaleLinear().domain([0, max(bins, (d) => d.length)]);

  // Dimensions
  const left = Math.max(
    estimateTextWidth(formatNumber(yScale.domain()[0])),
    estimateTextWidth(formatNumber(yScale.domain()[1]))
  );

  const margins = {
    top: 50,
    right: 40,
    bottom: 100,
    left: left + LEFT_MARGIN_OFFSET,
  };

  const chartWidth = width - margins.left - margins.right;
  const chartHeight = chartWidth * aspectRatio;

  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };
  xScale.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  return {
    bounds,
    data,
    getX,
    xScale,
    getY: (d) => d.length,
    yScale,
    bins,
    colors,
  };
};

const HistogramProvider = ({
  data,
  fields,
  measures,
  children,
  aspectRatio,
}: Pick<ChartProps, "data" | "measures"> & {
  children: ReactNode;
  fields: HistogramFields;
  aspectRatio: number;
}) => {
  const state = useHistogramState({
    data,
    fields,
    measures,
    aspectRatio,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const Histogram = ({
  data,
  fields,
  measures,
  children,
  aspectRatio,
}: Pick<ChartProps, "data" | "measures"> & {
  children: ReactNode;
  fields: HistogramFields;
  aspectRatio: number;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <HistogramProvider
          data={data}
          fields={fields}
          measures={measures}
          aspectRatio={aspectRatio}
        >
          {children}
        </HistogramProvider>
      </InteractionProvider>
    </Observer>
  );
};

const sortData = ({
  data,
  getX,
  getY,
  sortingType,
  sortingOrder,
}: {
  data: Observation[];
  getX: (d: Observation) => number;
  getY: (d: Observation) => string;
  sortingType?: SortingType;
  sortingOrder?: SortingOrder;
}) => {
  if (sortingOrder === "desc" && sortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => descending(getY(a), getY(b)));
  } else if (sortingOrder === "asc" && sortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => ascending(getY(a), getY(b)));
  } else if (sortingOrder === "desc" && sortingType === "byMeasure") {
    return [...data].sort((a, b) => descending(getX(a), getX(b)));
  } else if (sortingOrder === "asc" && sortingType === "byMeasure") {
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  } else {
    // default to ascending alphabetical
    return [...data].sort((a, b) => ascending(getY(a), getY(b)));
  }
};
