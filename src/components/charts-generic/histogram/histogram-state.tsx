import { Box, Typography } from "@mui/material";
import { ascending, bin, interpolateHsl, max, min, scaleLinear } from "d3";
import { ReactNode, useCallback } from "react";

import {
  LEFT_MARGIN_OFFSET,
  TOOLTIP_ARROW_HEIGHT,
  VERTICAL_TICK_OFFSET,
} from "src/components/charts-generic/constants";
import { Tooltip } from "src/components/charts-generic/interaction/tooltip";
import { LegendSymbol } from "src/components/charts-generic/legends/color";
import {
  ChartContext,
  ChartProps,
  HistogramState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import { InteractionProvider } from "src/components/charts-generic/use-interaction";
import { Observer, useWidth } from "src/components/charts-generic/use-width";
import { HistogramFields } from "src/domain/config-types";
import { GenericObservation } from "src/domain/data";
import {
  getAnnotationSpaces,
  mkNumber,
  useFormatCurrency,
} from "src/domain/helpers";
import { estimateTextWidth } from "src/lib/estimate-text-width";
import { chartPalette } from "src/themes/palette";

const useHistogramState = ({
  data,
  medianValue,
  fields,
  aspectRatio,
  xAxisLabel,
  yAxisLabel,
  xAxisUnit,
}: Pick<ChartProps, "data" | "measures" | "medianValue"> & {
  fields: HistogramFields;
  aspectRatio: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xAxisUnit?: string;
}): HistogramState => {
  const width = useWidth();
  const formatCurrency = useFormatCurrency();
  const { annotationFontSize, palette } = useChartTheme();

  const getX = useCallback(
    (d: GenericObservation) => d[fields.x.componentIri] as number,
    [fields.x.componentIri]
  );

  const getY = (d: GenericObservation[]) => d?.length ?? 0;

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
    .range(chartPalette.diverging.GreenToOrange)
    .interpolate(interpolateHsl);
  // y
  const bins = bin<GenericObservation, number>()
    .value((x) => getX(x))
    .domain([mkNumber(minValue), mkNumber(maxValue)])
    .thresholds(xScale.ticks(25))(data);

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

  const margins = {
    top: 70,
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
        annotationFontSize,
      })
    : [{ height: 0, nbOfLines: 1 }];

  const getAnnotationInfo = (d: (typeof bins)[number]): Tooltip => {
    console.log(yScale(getY(d)));
    return {
      placement: { x: "center", y: "top" },
      xAnchor: xScale((d.x1! + d.x0!) / 2),
      yAnchor:
        yScale(getY(d)) +
        margins.top -
        TOOLTIP_ARROW_HEIGHT -
        VERTICAL_TICK_OFFSET,
      xValue: "",
      tooltipContent: (
        <>
          <Box sx={{ alignItems: "center", gap: "0.375rem" }} display="flex">
            <LegendSymbol symbol="square" color={colors(d.x0!)} />
            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
              {d.x0}-{d.x1}
              {xAxisUnit}
            </Typography>
          </Box>
          <Typography variant="caption">
            {yAxisLabel}: {d.length}
          </Typography>
        </>
      ),
    };
  };

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
          yLabel: annotationSpaces[i + 1].height - 40,
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
    getY,
    yScale,
    xAxisLabel: xAxisLabel || "",
    yAxisLabel: yAxisLabel || "",
    bins,
    colors,
    annotations,
    getAnnotationInfo: getAnnotationInfo as unknown as (
      d: GenericObservation
    ) => Tooltip,
  };
};

const HistogramProvider = ({
  data,
  medianValue,
  fields,
  measures,
  children,
  aspectRatio,
  xAxisLabel,
  yAxisLabel,
  xAxisUnit,
}: Pick<ChartProps, "data" | "measures" | "medianValue"> & {
  children: ReactNode;
  fields: HistogramFields;
  aspectRatio: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xAxisUnit?: string;
}) => {
  const state = useHistogramState({
    data,
    medianValue,
    fields,
    measures,
    aspectRatio,
    xAxisLabel,
    yAxisLabel,
    xAxisUnit,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const Histogram = ({
  xAxisLabel,
  yAxisLabel,
  xAxisUnit,
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
  xAxisLabel?: string;
  yAxisLabel?: string;
  xAxisUnit?: string;
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
          xAxisLabel={xAxisLabel}
          yAxisLabel={yAxisLabel}
          xAxisUnit={xAxisUnit}
        >
          {children}
        </HistogramProvider>
      </InteractionProvider>
    </Observer>
  );
};
