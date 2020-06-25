import { ascending, descending, histogram, max, min, Bin } from "d3-array";
import { ScaleLinear, scaleLinear } from "d3-scale";
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

export interface HistogramState {
  bounds: Bounds;
  data: Observation[];
  getX: (d: Observation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: $FixMe[]) => number;
  yScale: ScaleLinear<number, number>;
  xAxisLabel?: string;
  bins: Bin<number, number>[];
  // getSegment: (d: Observation) => string;
  // segments: string[];
  // colors: ScaleOrdinal<string, string>;
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
  const getY = (d: Observation) => d.value;
  // const getY = useCallback(
  //   (d: Observation) => d[fields.y.componentIri] as string,
  //   [fields.y.componentIri]
  // );
  // const getBarHeight = useCallback(
  //   (d: Observation): string =>
  //     fields.height && fields.height.componentIri
  //       ? (d[fields.height.componentIri] as string)
  //       : undefined,
  //   [fields.height]
  // );
  // const getSegment = useCallback(
  //   (d: Observation): string =>
  //     fields.segment && fields.segment.componentIri
  //       ? (d[fields.segment.componentIri] as string)
  //       : "segment",
  //   [fields.segment]
  // );
  // Sort data
  // const sortingType = fields.y.sorting?.sortingType;
  // const sortingOrder = fields.y.sorting?.sortingOrder;

  // const sortedData = useMemo(() => {
  //   return sortData({ data, sortingType, sortingOrder, getX, getY });
  // }, [data, getX, getY, sortingType, sortingOrder]);

  // segments
  // const segments = Array.from(new Set(sortedData.map((d) => getSegment(d))));
  // const colors = scaleOrdinal(getPalette(fields.segment?.palette)).domain(
  //   segments
  // );

  // x
  const minValue = min(data, (d) => getX(d));
  const maxValue = max(data, (d) => getX(d));
  const xDomain = [mkNumber(minValue), mkNumber(maxValue)];
  const xScale = scaleLinear().domain(xDomain).nice();

  const bins = histogram()
    // @ts-ignore
    .value((x) => getX(x))
    .domain([mkNumber(minValue), mkNumber(maxValue)])
    // @ts-ignore
    .thresholds(xScale.ticks(20))(data);
  console.log("bins", bins);

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
    bottom: bottom + BOTTOM_MARGIN_OFFSET,
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
    // getSegment,
    // segments,
    // colors,
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
