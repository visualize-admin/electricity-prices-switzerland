import { interpolateLab, scaleBand, ScaleBand } from "d3";
import { ascending, extent, group, median, rollup } from "d3-array";
import { ScaleLinear, scaleLinear } from "d3-scale";
import * as React from "react";
import { ReactNode, useCallback } from "react";
import { RangePlotFields } from "../../../domain/config-types";
import { Observation, ObservationValue } from "../../../domain/data";
import { useFormatNumber } from "../../../domain/helpers";
import { estimateTextWidth } from "../../../lib/estimate-text-width";
import { BOTTOM_MARGIN_OFFSET, LEFT_MARGIN_OFFSET } from "../constants";
import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";
import { Bounds, Observer, useWidth } from "../use-width";
import {
  ANNOTATION_LABEL_HEIGHT,
  Annotation,
} from "../annotation/annotation-x";
import { useChartTheme } from "../use-chart-theme";

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
  annotations: Annotation[];
}

const useRangePlotState = ({
  data,
  fields,
}: Pick<ChartProps, "data" | "measures"> & {
  fields: RangePlotFields;
}): RangePlotState => {
  const width = useWidth();
  const formatNumber = useFormatNumber();
  const { annotationfontSize } = useChartTheme();

  const getX = useCallback(
    (d: Observation) => d[fields.x.componentIri] as number,
    [fields.x.componentIri]
  );
  const getY = useCallback(
    (d: Observation) => d[fields.y.componentIri] as string,
    [fields.y.componentIri]
  );
  const getLabel = useCallback(
    (d: Observation) => d[fields.label.componentIri] as string,
    [fields.label.componentIri]
  );

  const { annotation } = fields;

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

  const yScale = scaleBand<string>().domain(yOrderedDomain);

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
    top: 70,
    right: 20,
    bottom: BOTTOM_MARGIN_OFFSET,
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
              20
          );
          return acc;
        },
        [0]
      )
    : [0];

  const annotationSpace = annotationSpaces.pop();

  const chartHeight =
    yOrderedDomain.length * (DOT_RADIUS * 2 + SPACE_ABOVE) + annotationSpace;

  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };

  xScale.range([0, chartWidth]);
  yScale.range([annotationSpace, chartHeight]);

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
          y: yScale(getY(datum)),
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
