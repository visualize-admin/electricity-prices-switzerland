import { ascending, descending, max, min } from "d3-array";
import {
  scaleBand,
  ScaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
} from "d3-scale";
import * as React from "react";
import { ReactNode, useCallback } from "react";
import { BarFields } from "../../../domain/config-types";
import { GenericObservation } from "../../../domain/data";
import {
  getOpacityRanges,
  getPalette,
  mkNumber,
} from "../../../domain/helpers";
import { sortByIndex } from "../../../lib/array";
import { BAR_HEIGHT, BOTTOM_MARGIN_OFFSET } from "../constants";
import { ChartContext, ChartProps, GroupedBarsState } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";
import { Bounds, Observer, useWidth } from "../use-width";

const useGroupedBarsState = ({
  data,
  fields,
  dimensions,
  measures,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  fields: BarFields;
}): GroupedBarsState => {
  const width = useWidth();
  const getX = useCallback(
    (d: GenericObservation) => d[fields.x.componentIri] as number,
    [fields.x.componentIri]
  );

  const getSegment = useCallback(
    (d: GenericObservation): string =>
      fields.segment && fields.segment.componentIri
        ? (d[fields.segment.componentIri] as string)
        : "segment",
    [fields.segment]
  );
  const getLabel = useCallback(
    (d: GenericObservation): string =>
      fields.label && fields.label.componentIri
        ? (d[fields.label.componentIri] as string)
        : "label",
    [fields.label]
  );
  const getColor = useCallback(
    (d: GenericObservation): string =>
      fields.style && fields.style.colorAcc
        ? (d[fields.style.colorAcc] as string)
        : "entity",
    [fields.style]
  );
  const getOpacity = useCallback(
    (d: GenericObservation): string =>
      fields.style && fields.style.opacityAcc
        ? (d[fields.style.opacityAcc] as string)
        : "period",
    [fields.style]
  );

  // segments ordered
  const segments = data
    .sort(
      (a, b) =>
        ascending(getColor(a), getColor(b)) ||
        descending(getOpacity(a), getOpacity(b)) ||
        descending(getX(a), getX(b))
    )
    .map((d) => getSegment(d));

  const sortedData = sortByIndex({
    data,
    order: segments,
    getCategory: getSegment,
  });

  // Colors (shouldn't be segments!)
  const colorDomain = fields.style?.colorDomain
    ? fields.style?.colorDomain
    : segments;
  const colors = scaleOrdinal<string, string>()
    .domain(colorDomain)
    .range(getPalette(fields.segment?.palette));

  // opacity
  const opacityDomain = fields.style?.opacityDomain
    ? fields.style?.opacityDomain
    : [];

  const opacityScale = scaleOrdinal<string, number>()
    .domain(opacityDomain.sort((a, b) => descending(a, b)))
    .range(getOpacityRanges(opacityDomain.length));

  // x
  const xScale = scaleLinear().domain(fields.x.domain).nice();

  const chartHeight = BAR_HEIGHT * segments.length;
  const yScale = scaleBand()
    .domain(segments)
    .range([0, chartHeight])
    .paddingOuter(0.1);

  const margins = {
    top: 50,
    right: 40,
    bottom: BOTTOM_MARGIN_OFFSET,
    left: 0,
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

  return {
    sortedData,
    bounds,
    getX,
    xScale,
    yScale,
    getSegment,
    getLabel,
    getColor,
    getOpacity,
    segments,
    colors,
    opacityScale,
  };
};

const GroupedBarsChartProvider = ({
  data,
  fields,
  dimensions,
  measures,

  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: BarFields;
}) => {
  const state = useGroupedBarsState({
    data,
    fields,
    dimensions,
    measures,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const GroupedBarsChart = ({
  data,
  fields,
  dimensions,
  measures,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: BarFields;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <GroupedBarsChartProvider
          data={data}
          fields={fields}
          dimensions={dimensions}
          measures={measures}
        >
          {children}
        </GroupedBarsChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
