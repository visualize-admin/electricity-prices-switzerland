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
import { Annotation } from "../annotation/annotation-x";
import { useChartTheme } from "../use-chart-theme";

export const ANNOTATION_DOT_RADIUS = 2.5;
export const ANNOTATION_SQUARE_SIDE = 8;
export const ANNOTATION_LABEL_HEIGHT = 20;

export interface HistogramState {
  bounds: Bounds;
  data: Observation[];
  getX: (d: Observation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: Observation[]) => number;
  yScale: ScaleLinear<number, number>;
  xAxisLabel?: string;
  bins: Bin<Observation, number>[];
  colors: ScaleThreshold<number, string>;
  annotations: Annotation[];
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
  const { annotationfontSize } = useChartTheme();

  const getX = useCallback(
    (d: Observation) => d[fields.x.componentIri] as number,
    [fields.x.componentIri]
  );
  const getLabel = useCallback(
    (d: Observation) => d[fields.label.componentIri] as string,
    [fields.label.componentIri]
  );
  const { annotation } = fields;

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
  // Added space for annotations above the chart
  const annotationSpaces = annotation
    ? annotation.reduce(
        (acc, datum, i) => {
          // FIXME: Should be word based, not character based?
          const oneFullLine =
            estimateTextWidth(formatNumber(getX(datum)), annotationfontSize) +
            estimateTextWidth(getLabel(datum), annotationfontSize);
          // On smaller screens, anotations may break on several lines
          const nbOfLines = Math.ceil(oneFullLine / (chartWidth * 0.5));
          acc.push(
            acc[i] +
              // annotation height
              nbOfLines * ANNOTATION_LABEL_HEIGHT +
              // padding + margin between annotations
              40
          );
          return acc;
        },
        [0]
      )
    : [0];

  const annotationSpace = annotationSpaces.pop();
  const chartHeight = chartWidth * aspectRatio + annotationSpace;

  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };
  xScale.range([0, chartWidth]);
  yScale.range([chartHeight, annotationSpace]);

  // Annotations
  const annotations =
    annotation &&
    annotation
      .sort((a, b) => ascending(getX(a), getX(b)))
      .map((datum, i) => {
        return {
          datum,
          x: xScale(getX(datum)),
          y: yScale(0),
          xLabel: xScale(getX(datum)),
          yLabel: annotationSpaces[i],
          value: formatNumber(getX(datum)),
          label: getLabel(datum),
          onTheLeft: xScale(getX(datum)) <= chartWidth / 2 ? false : true,
        };
      });

  return {
    bounds,
    data,
    getX,
    xScale,
    getY: (d) => d.length,
    yScale,
    bins,
    colors,
    annotations,
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
