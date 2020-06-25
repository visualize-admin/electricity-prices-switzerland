import { ascending, max, min, descending } from "d3-array";
import {
  scaleBand,
  ScaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  scaleThreshold,
} from "d3-scale";
import * as React from "react";
import { ReactNode, useMemo, useCallback } from "react";
import {
  BarFields,
  SortingOrder,
  SortingType,
} from "../../../domain/config-types";
import { getPalette, mkNumber, useFormatNumber } from "../../../domain/helpers";
import { Tooltip } from "../annotations/tooltip";
import { VERTICAL_PADDING, BAR_HEIGHT } from "../constants";
import { Bounds, Observer, useWidth } from "../use-width";
import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";
import { BOTTOM_MARGIN_OFFSET, LEFT_MARGIN_OFFSET } from "../constants";
import { Observation } from "../../../domain/data";

export interface BarsState {
  bounds: Bounds;
  sortedData: Observation[];
  getX: (d: Observation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: Observation) => string;
  yScale: ScaleBand<string>;
  getBarHeight: (d: Observation) => string;
  barHeightScale: ScaleOrdinal<string, number>;
  getSegment: (d: Observation) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  // getAnnotationInfo: (d: Observation) => Tooltip;
}

const useBarsState = ({
  data,
  fields,
  measures,
}: Pick<ChartProps, "data" | "measures"> & {
  fields: BarFields;
}): BarsState => {
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
  const getBarHeight = useCallback(
    (d: Observation): string =>
      fields.height && fields.height.componentIri
        ? (d[fields.height.componentIri] as string)
        : undefined,
    [fields.height]
  );
  const getSegment = useCallback(
    (d: Observation): string =>
      fields.segment && fields.segment.componentIri
        ? (d[fields.segment.componentIri] as string)
        : "segment",
    [fields.segment]
  );
  // Sort data
  const sortingType = fields.y.sorting?.sortingType;
  const sortingOrder = fields.y.sorting?.sortingOrder;

  const sortedData = useMemo(() => {
    return sortData({ data, sortingType, sortingOrder, getX, getY });
  }, [data, getX, getY, sortingType, sortingOrder]);

  // segments
  const segments = Array.from(new Set(sortedData.map((d) => getSegment(d))));
  const colors = scaleOrdinal(getPalette(fields.segment?.palette)).domain(
    segments
  );

  // x
  const minValue = Math.min(mkNumber(min(sortedData, (d) => getX(d))), 0);
  const maxValue = max(sortedData, (d) => getX(d));
  const xScale = scaleLinear()
    .domain([mkNumber(minValue), mkNumber(maxValue)])
    .nice();

  // Bar Height FIXME
  const barHeightDomain = [...new Set(sortedData.map((d) => getBarHeight(d)))];
  // FIXME: Bar height range
  // const thisBarHeight = getBarHeight
  //   ? barHeightScale(getBarHeight(d))
  //   : BAR_HEIGHT;
  const barHeightRange = barHeightDomain
    .map((_, i) => BAR_HEIGHT * (i + 1))
    .reverse();

  const barHeightScale = scaleOrdinal<string, number>()
    .domain(barHeightDomain)
    .range(barHeightRange);

  // y
  const bandDomain = [...new Set(sortedData.map((d) => getY(d)))];

  const chartHeight = bandDomain.length * BAR_HEIGHT * 3;
  const yScale = scaleBand<string>().domain(bandDomain).range([0, chartHeight]);

  const margins = {
    top: 50,
    right: 40,
    bottom: BOTTOM_MARGIN_OFFSET,
    left: LEFT_MARGIN_OFFSET,
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
    sortedData,
    getX,
    xScale,
    getY,
    yScale,
    getBarHeight,
    barHeightScale,
    getSegment,
    segments,
    colors,
    // getAnnotationInfo,
  };
};

const BarChartProvider = ({
  data,
  fields,
  measures,
  children,
}: Pick<ChartProps, "data" | "measures"> & {
  children: ReactNode;
  fields: BarFields;
}) => {
  const state = useBarsState({
    data,
    fields,
    measures,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const BarChart = ({
  data,
  fields,
  measures,
  children,
}: Pick<ChartProps, "data" | "measures"> & {
  children: ReactNode;
  fields: BarFields;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <BarChartProvider data={data} fields={fields} measures={measures}>
          {children}
        </BarChartProvider>
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
