import { interpolateHsl } from "d3";
import { ascending, Bin, histogram, max, min } from "d3-array";
import { ScaleLinear, scaleLinear } from "d3-scale";
import * as React from "react";
import { ReactNode, useCallback } from "react";
import { HistogramFields } from "../../../domain/config-types";
import { GenericObservation } from "../../../domain/data";
import {
  getAnnotationSpaces,
  mkNumber,
  useFormatCurrency,
} from "../../../domain/helpers";
import { estimateTextWidth } from "../../../lib/estimate-text-width";
import { Annotation } from "../annotation/annotation-x";
import { LEFT_MARGIN_OFFSET } from "../constants";
import { ChartContext, ChartProps } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";
import { InteractionProvider } from "../use-interaction";
import { Bounds, Observer, useWidth } from "../use-width";

export const ANNOTATION_DOT_RADIUS = 2.5;
export const ANNOTATION_LABEL_HEIGHT = 20;

export interface HistogramState {
  bounds: Bounds;
  data: GenericObservation[];
  medianValue: number | undefined;
  getX: (d: GenericObservation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: GenericObservation[]) => number;
  yScale: ScaleLinear<number, number>;
  xAxisLabel?: string;
  bins: Bin<GenericObservation, number>[];
  colors: ScaleLinear<string, string>;
  annotations?: Annotation[];
}

const useHistogramState = ({
  data,
  medianValue,
  fields,
  measures,
  aspectRatio,
}: Pick<ChartProps, "data" | "measures" | "medianValue"> & {
  fields: HistogramFields;
  aspectRatio: number;
}): HistogramState => {
  const width = useWidth();
  const formatCurrency = useFormatCurrency();
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
  const minValue = min(data, (d) => getX(d)) || 0;
  const maxValue = max(data, (d) => getX(d)) || 10000;
  const xDomain = [mkNumber(minValue), mkNumber(maxValue)];
  const xScale = scaleLinear().domain(xDomain).nice();

  // CH Median (all data points)
  const m = medianValue;
  const colorDomain = m
    ? [minValue, m - m * 0.1, m, m + m * 0.1, maxValue]
    : xScale.ticks(5);

  const colors = scaleLinear<string>()
    .domain(colorDomain)
    .range(palettes.diverging)
    .interpolate(interpolateHsl);
  // y
  const bins = histogram<GenericObservation, number>()
    .value((x) => getX(x))
    .domain([mkNumber(minValue), mkNumber(maxValue)])
    .thresholds(xScale.ticks(25))(data);
  // .thresholds(thresholdSturges)(data);

  const yScale = scaleLinear().domain([0, max(bins, (d) => d.length) || 100]);

  // Dimensions
  const left = Math.max(
    estimateTextWidth(formatCurrency(yScale.domain()[0])),
    estimateTextWidth(
      formatCurrency(
        yScale.domain().length > 1 ? yScale.domain()[1] : yScale.domain()[0]
      )
    )
  );
  // const piecewiseColor = piecewise(interpolateHsl, palettes.diverging);

  const margins = {
    top: 50,
    right: 40,
    bottom: 100,
    left: left + LEFT_MARGIN_OFFSET,
  };

  const chartWidth = width - margins.left - margins.right;

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
          yLabel: annotationSpaces[i + 1].height,
          nbOfLines: annotationSpaces[i + 1].nbOfLines,
          value: formatCurrency(getX(datum)),
          label: getLabel(datum),
          onTheLeft: xScale(getX(datum)) <= chartWidth / 2 ? false : true,
        };
      });

  return {
    bounds,
    data,
    medianValue,
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
  medianValue,
  fields,
  measures,
  children,
  aspectRatio,
}: Pick<ChartProps, "data" | "measures" | "medianValue"> & {
  children: ReactNode;
  fields: HistogramFields;
  aspectRatio: number;
}) => {
  const state = useHistogramState({
    data,
    medianValue,
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
  medianValue,
  fields,
  measures,
  children,
  aspectRatio,
}: Pick<ChartProps, "data" | "measures" | "medianValue"> & {
  children: ReactNode;
  fields: HistogramFields;
  aspectRatio: number;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <HistogramProvider
          data={data}
          medianValue={medianValue}
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
