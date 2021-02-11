import { descending, interpolateLab, scaleBand, ScaleBand } from "d3";
import { ascending, group, max, median, min, rollup } from "d3-array";
import { ScaleLinear, scaleLinear } from "d3-scale";
import * as React from "react";
import { ReactNode, useCallback } from "react";
import {
  RangePlotFields,
  SortingOrder,
  SortingType,
} from "../../../domain/config-types";
import { GenericObservation, ObservationValue } from "../../../domain/data";
import {
  mkNumber,
  useFormatCurrency,
  getAnnotationSpaces,
} from "../../../domain/helpers";
import { estimateTextWidth } from "../../../lib/estimate-text-width";
import { Annotation } from "../annotation/annotation-x";
import { LEFT_MARGIN_OFFSET } from "../constants";
import { ChartContext, ChartProps } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";
import { InteractionProvider } from "../use-interaction";
import { Bounds, Observer, useWidth } from "../use-width";

export const DOT_RADIUS = 8;
export const INNER_PADDING = 0.2;

export interface RangePlotState {
  bounds: Bounds;
  data: GenericObservation[];
  getX: (d: GenericObservation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: GenericObservation) => string;
  yScale: ScaleBand<string>;
  colors: ScaleLinear<string, string>;
  rangeGroups: [string, Record<string, ObservationValue>[]][];
  annotations?: Annotation[];
}

const useRangePlotState = ({
  data,
  fields,
}: Pick<ChartProps, "data" | "measures"> & {
  fields: RangePlotFields;
}): RangePlotState => {
  const width = useWidth();
  const formatCurrency = useFormatCurrency();
  const { annotationfontSize, palettes } = useChartTheme();

  const getX = useCallback(
    (d: GenericObservation) => d[fields.x.componentIri] as number,
    [fields.x.componentIri]
  );
  // const getY = useCallback(
  //   (d: Observation) =>
  //     fields.y && fields.y.componentIri
  //       ? (d[fields.y.componentIri] as string)
  //       : undefined,
  //   [fields.y]
  // );
  const getY = useCallback(
    (d: GenericObservation) => d[fields.y.componentIri] as string,
    [fields.y.componentIri]
  );
  const getLabel = useCallback(
    (d: GenericObservation) => d[fields.label.componentIri] as string,
    [fields.label.componentIri]
  );

  const { annotation } = fields;

  const minValue = min(data, (d) => getX(d));
  const maxValue = max(data, (d) => getX(d));
  const xDomain = [0, mkNumber(maxValue)];
  const xScale = scaleLinear().domain(xDomain).nice();

  // Sort data
  const sortingType = fields.y.sorting?.sortingType;
  const sortingOrder = fields.y.sorting?.sortingOrder;
  // Default sorting order by ascending median
  const yDomain =
    sortingType && sortingOrder
      ? sortDomain({ sortingType, sortingOrder, data, getX, getY })
      : [
          ...rollup(
            data,
            (v) => median(v, (x) => getX(x)),
            (x) => getY(x)
          ),
        ]
          .sort((a, b) =>
            sortingOrder === "asc"
              ? ascending(a[1], b[1])
              : descending(a[1], b[1])
          )
          .map((d) => d[0]);
  const yScale = scaleBand<string>()
    .domain(yDomain)
    .paddingInner(INNER_PADDING);

  const m = median(data, (d) => getX(d));
  const colorDomain = m
    ? [xDomain[0], m - m * 0.1, m, m + m * 0.1, xDomain[1]]
    : xScale.ticks(5);

  const colors = scaleLinear<string, string>()
    .domain(colorDomain)
    .range(palettes.diverging)
    .interpolate(interpolateLab);
  const left = estimateTextWidth(
    yScale.domain().length > 1
      ? [...yScale.domain()].sort((a, b) => b.length - a.length)[0]
      : yScale.domain()[0],
    13
  );

  // Added space for annotations above the chart
  const annotationSpaces = annotation
    ? getAnnotationSpaces({
        annotation,
        getX,
        getLabel,
        format: formatCurrency,
        width,
        annotationfontSize,
      })
    : [{ height: 0, nbOfLines: 1 }];

  const annotationSpace =
    annotationSpaces[annotationSpaces.length - 1].height || 0;

  const margins = {
    annotations: annotationSpace,
    top: 40,
    right: 20,
    bottom: 50,
    left: left + LEFT_MARGIN_OFFSET,
  };

  const chartWidth = width - margins.left - margins.right;
  const chartHeight = yDomain.length * (DOT_RADIUS * 2 * (1 + INNER_PADDING));

  const bounds = {
    width,
    height: annotationSpace + margins.top + chartHeight + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };

  xScale.range([0, chartWidth]);
  yScale.range([0, chartHeight]);

  // Group
  const rangeGroups = [...group(data, getY)];

  // Annotations
  const annotations =
    annotation &&
    annotation
      .sort((a, b) => ascending(getX(a), getX(b)))
      .map((datum, i) => {
        return {
          datum,
          x: xScale(getX(datum)),
          y: yScale(getY(datum)) || 0,
          xLabel: xScale(getX(datum)),
          yLabel: annotationSpaces[i].height,
          nbOfLines: annotationSpaces[i + 1].nbOfLines,
          value: formatCurrency(getX(datum)),
          label: getLabel(datum),
          onTheLeft: xScale(getX(datum)) <= chartWidth / 2 ? false : true,
        };
      });

  return {
    bounds,
    data,
    getX,
    xScale,
    getY,
    yScale,
    colors,
    rangeGroups,
    annotations,
  };
};

const RangePlotProvider = ({
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
        <RangePlotProvider data={data} fields={fields} measures={measures}>
          {children}
        </RangePlotProvider>
      </InteractionProvider>
    </Observer>
  );
};

const sortDomain = ({
  sortingType,
  sortingOrder,
  data,
  getX,
  getY,
}: {
  sortingType: SortingType;
  sortingOrder: SortingOrder;
  data: GenericObservation[];
  getX: (d: GenericObservation) => number;
  getY: (d: GenericObservation) => string;
}) => {
  if (sortingType === "byDimensionLabel") {
    return [...group(data, (x) => getY(x))]
      .sort((a, b) =>
        sortingOrder === "asc" ? ascending(a[0], b[0]) : descending(a[0], b[0])
      )
      .map((d) => d[0]);
  } else {
    // by median
    return [
      ...rollup(
        data,
        (v) => median(v, (x) => getX(x)),
        (x) => getY(x)
      ),
    ]
      .sort((a, b) =>
        sortingOrder === "asc" ? ascending(a[1], b[1]) : descending(a[1], b[1])
      )
      .map((d) => d[0]);
  }
};
