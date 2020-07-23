import { scaleThreshold } from "d3";
import { ascending, Bin, histogram, max, median, min } from "d3-array";
import { ScaleLinear, scaleLinear, ScaleThreshold } from "d3-scale";
import * as React from "react";
import { ReactNode, useCallback } from "react";
import { HistogramFields } from "../../../domain/config-types";
import { GenericObservation } from "../../../domain/data";
import { mkNumber, useFormatNumber } from "../../../domain/helpers";
import { estimateTextWidth } from "../../../lib/estimate-text-width";
import { Annotation } from "../annotation/annotation-x";
import { LEFT_MARGIN_OFFSET } from "../constants";
import { ChartContext, ChartProps } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";
import { InteractionProvider } from "../use-interaction";
import { Bounds, Observer, useWidth } from "../use-width";

export const ANNOTATION_DOT_RADIUS = 2.5;
export const ANNOTATION_SQUARE_SIDE = 8;
export const ANNOTATION_LABEL_HEIGHT = 20;

export interface HistogramState {
  bounds: Bounds;
  data: GenericObservation[];
  getX: (d: GenericObservation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: GenericObservation[]) => number;
  yScale: ScaleLinear<number, number>;
  xAxisLabel?: string;
  bins: Bin<GenericObservation, number>[];
  colors: ScaleThreshold<number, string>;
  annotations?: Annotation[];
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
  const { annotationfontSize, palettes } = useChartTheme();

  const getX = useCallback(
    (d: GenericObservation) => d[fields.x.componentIri] as number,
    [fields.x.componentIri]
  );
  const getLabel = useCallback(
    (d: GenericObservation) => d[fields.label.componentIri] as string,
    [fields.label.componentIri]
  );
  const { annotation } = fields;

  // x
  const minValue = min(data, (d) => getX(d));
  const maxValue = max(data, (d) => getX(d));
  const xDomain = [mkNumber(minValue), mkNumber(maxValue)];
  const xScale = scaleLinear().domain(xDomain).nice();

  // CH Median (all data points)
  const m = median(data, (d) => getX(d));
  const colorDomain = m
    ? [m - m * 0.15, m - m * 0.05, m + m * 0.05, m + m * 0.15]
    : xScale.ticks(5);

  const colors = scaleThreshold<number, string>()
    .domain(colorDomain)
    .range(palettes.diverging);

  // y
  const bins = histogram<GenericObservation, number>()
    .value((x) => getX(x))
    .domain([mkNumber(minValue), mkNumber(maxValue)])
    .thresholds(colorDomain || xScale.ticks(20))(data);

  const yScale = scaleLinear().domain([0, max(bins, (d) => d.length) || 100]);

  // Dimensions
  const left = Math.max(
    estimateTextWidth(formatNumber(yScale.domain()[0])),
    estimateTextWidth(
      formatNumber(
        yScale.domain().length > 1 ? yScale.domain()[1] : yScale.domain()[0]
      )
    )
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

  const annotationSpace = annotationSpaces.pop() || 0;
  const chartHeight = chartWidth * aspectRatio + annotationSpace;

  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };
  xScale.range([0, chartWidth]);
  yScale.range([chartHeight, annotationSpace || 0]);

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
