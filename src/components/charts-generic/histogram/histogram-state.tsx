import {
  ascending,
  descending,
  histogram,
  max,
  min,
  Bin,
  median,
} from "d3-array";
import {
  ScaleLinear,
  scaleLinear,
  scaleOrdinal,
  ScaleOrdinal,
  ScaleThreshold,
} from "d3-scale";
import * as React from "react";
import { ReactNode, useCallback } from "react";
import {
  HistogramFields,
  SortingOrder,
  SortingType,
} from "../../../domain/config-types";
import { Observation } from "../../../domain/data";
import { mkNumber, useFormatNumber } from "../../../domain/helpers";
import { BOTTOM_MARGIN_OFFSET, LEFT_MARGIN_OFFSET } from "../constants";
import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";
import { Bounds, Observer, useWidth } from "../use-width";
import { estimateTextWidth } from "../../../lib/estimate-text-width";
import { scaleThreshold } from "d3";

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
  // getAnnotationInfo: (d: Observation) => Tooltip;
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
  const colorRange = [
    "#d01c8b",
    "#f1b6da",
    "#f7f7f7",
    "#b8e186",
    "#4dac26",
  ].reverse();
  const m = median(data, (d) => getX(d));
  const colorDomain = [m - m * 0.15, m - m * 0.05, m + m * 0.05, m + m * 0.15];
  const colors = scaleThreshold<number, string>()
    .domain(colorDomain)
    .range(colorRange);

  // y
  // FIXME: bin domain to contain specific values from the color domain
  const bins = histogram<Observation, number>()
    .value((x) => getX(x))
    .domain([mkNumber(minValue), mkNumber(maxValue)])
    // .thresholds(colorDomain)(data);
    .thresholds(xScale.ticks(40))(data);

  const yScale = scaleLinear().domain([0, max(bins, (d) => d.length)]);
  // Dimensions
  const left = Math.max(
    estimateTextWidth(formatNumber(yScale.domain()[0])),
    estimateTextWidth(formatNumber(yScale.domain()[1]))
  );
  const bottom = max(xDomain, (d) => estimateTextWidth(formatNumber(d))) || 70;

  const margins = {
    top: 50,
    right: 40,
    bottom: 100, // bottom + BOTTOM_MARGIN_OFFSET,
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

  // Tooltip
  // const getAnnotationInfo = (datum: Observation): Tooltip => {
  //   const xRef = xScale(getX(datum));
  //   const xOffset = 10; // xScale.bandwidth() / 2;
  //   const yRef = yScale(getY(datum));
  //   const yAnchor = yRef;

  //   const yPlacement = yAnchor < chartHeight * 0.33 ? "middle" : "top";

  //   const getXPlacement = () => {
  //     if (yPlacement === "top") {
  //       return xRef < chartWidth * 0.33
  //         ? "right"
  //         : xRef > chartWidth * 0.66
  //         ? "left"
  //         : "center";
  //     } else {
  //       // yPlacement === "middle"
  //       return xRef < chartWidth * 0.5 ? "right" : "left";
  //     }
  //   };
  //   const xPlacement = getXPlacement();

  //   const getXAnchor = () => {
  //     if (yPlacement === "top") {
  //       return xPlacement === "right"
  //         ? xRef
  //         : xPlacement === "center"
  //         ? xRef + xOffset
  //         : xRef + xOffset * 2;
  //     } else {
  //       // yPlacement === "middle"
  //       return xPlacement === "right" ? xRef + xOffset * 2 : xRef;
  //     }
  //   };
  //   const xAnchor = getXAnchor();

  //   return {
  //     xAnchor,
  //     yAnchor,
  //     placement: { x: xPlacement, y: yPlacement },
  //     xValue: getY(datum), // FIXME: x !== y
  //     datum: {
  //       label: fields.segment?.componentIri && getSegment(datum),
  //       value: formatNumber(getX(datum)),
  //       color: colors(getSegment(datum)) as string,
  //     },
  //     values: undefined,
  //   };
  // };

  return {
    bounds,
    data,
    getX,
    xScale,
    getY: (d) => d.length,
    yScale,
    bins,
    colors,
    // getAnnotationInfo,
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
