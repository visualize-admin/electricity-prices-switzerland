import { max, min, scaleBand, scaleLinear, scaleOrdinal } from "d3";
import { ReactNode, useCallback, useMemo } from "react";

import { LEFT_MARGIN_OFFSET } from "src/components/charts-generic/constants";
import {
  ChartContext,
  ChartProps,
  ScatterPlotState,
} from "src/components/charts-generic/use-chart-state";
import { InteractionProvider } from "src/components/charts-generic/use-interaction";
import { Observer, useWidth } from "src/components/charts-generic/use-width";
import { ScatterPlotFields } from "src/domain/config-types";
import { GenericObservation } from "src/domain/data";
import {
  getPalette,
  getTextWidth,
  useFormatCurrency,
} from "src/domain/helpers";
import { chartPalette } from "src/themes/palette";

import { Tooltip, TooltipValue } from "../interaction/tooltip";
import { useChartTheme } from "../use-chart-theme";

const useScatterPlotState = ({
  data,
  fields,
  aspectRatio,
  medianValue,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  fields: ScatterPlotFields;
  aspectRatio: number;
  medianValue?: number;
}): ScatterPlotState => {
  const width = useWidth();
  const formatCurrency = useFormatCurrency();
  const { labelFontSize } = useChartTheme();

  const getX = useCallback(
    (d: GenericObservation): number => +d[fields.x.componentIri] as number,
    [fields.x.componentIri]
  );

  const getY = useCallback(
    (d: GenericObservation): string => d[fields.y.componentIri] as string,
    [fields.y.componentIri]
  );

  const getSegment = useCallback(
    (d: GenericObservation): string =>
      fields.segment?.componentIri
        ? (d[fields.segment.componentIri] as string)
        : "segment",
    [fields.segment]
  );

  const getColor = useCallback(
    (d: GenericObservation): string =>
      fields.style?.colorAcc
        ? (d[fields.style.colorAcc] as string)
        : "defaultColor",
    [fields.style]
  );

  const getHighlightEntity = useCallback(
    (d: GenericObservation): string | number | null =>
      fields.style?.entity ? (d[fields.style.entity] as string | number) : null,
    [fields.style?.entity]
  );

  const getTooltipLabel = useCallback(
    (d: GenericObservation): string =>
      fields.tooltip?.componentIri
        ? (d[fields.tooltip.componentIri] as string)
        : "",
    [fields.tooltip]
  );

  const { sortedData, xScale, yScale, bounds, segments, colors } =
    useMemo(() => {
      const sortedData = [...data];

      const minValue = min(sortedData, getX) ?? 0;
      const maxValue = max(sortedData, getX) ?? 0;
      const xDomain = [minValue, maxValue];
      const xScale = scaleLinear().domain(xDomain).nice();

      const yDomain = [...new Set(sortedData.map(getY))].filter(Boolean);
      const yScale = scaleBand()
        .domain(yDomain)
        .paddingInner(0.3)
        .paddingOuter(0.2);

      const segments = [...new Set(sortedData.map(getSegment))];
      const colors = scaleOrdinal<string, string>()
        .domain(segments)
        .range(getPalette(fields.segment?.palette));

      const maxYLabelWidth = Math.max(
        ...yDomain.map((label) =>
          getTextWidth(label, { fontSize: labelFontSize })
        )
      );

      const margins = {
        top: 80,
        right: 60,
        bottom: 60,
        left: maxYLabelWidth + LEFT_MARGIN_OFFSET,
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
      yScale.range([0, chartHeight]);

      return { sortedData, xScale, yScale, bounds, segments, colors };
    }, [
      data,
      width,
      aspectRatio,
      fields.segment,
      getX,
      getY,
      getSegment,
      labelFontSize,
    ]);

  const getAnnotationInfo = useCallback(
    (d: GenericObservation): Tooltip => {
      const tooltipValues: TooltipValue[] = [];

      const highlightedPoint =
        fields.style?.highlightValue && fields.style?.entity
          ? data.find((point) => {
              return (
                getHighlightEntity(point)?.toString() ===
                  fields.style!.highlightValue!.toString() &&
                getY(point) === getY(d)
              );
            })
          : null;

      if (highlightedPoint) {
        tooltipValues.push({
          label: getSegment(highlightedPoint),
          value: `${formatCurrency(getX(highlightedPoint))}`,
          color: chartPalette.categorical[0],
          symbol: "circle",
        });
      }

      if (
        !fields.style?.entity ||
        getHighlightEntity(d)?.toString() !==
          fields.style.highlightValue?.toString()
      ) {
        tooltipValues.push({
          label: getSegment(d),
          value: `${formatCurrency(getX(d))}`,
          color: chartPalette.categorical[2],
          symbol: "circle",
        });
      }

      return {
        values: tooltipValues,
        xAnchor: xScale(getX(d)),
        yAnchor: (yScale(getY(d)) ?? 0) + yScale.bandwidth() / 2,
        placement: { x: "center", y: "top" },
        xValue: getTooltipLabel(d),
      };
    },
    [
      data,
      getX,
      getY,
      getSegment,
      getHighlightEntity,
      getTooltipLabel,
      xScale,
      yScale,
      formatCurrency,
      fields.style,
    ]
  );

  return {
    data: sortedData,
    bounds,
    getX,
    xScale,
    getY,
    yScale,
    getSegment,
    segments,
    colors,
    getAnnotationInfo,
    getColor,
    getHighlightEntity,
    getTooltipLabel,
    medianValue,
  };
};

const ScatterPlotProvider = ({
  data,
  fields,
  dimensions,
  measures,
  aspectRatio,
  medianValue,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: ScatterPlotFields;
  aspectRatio: number;
  medianValue?: number;
}) => {
  const state = useScatterPlotState({
    data,
    fields,
    dimensions,
    measures,
    aspectRatio,
    medianValue,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const ScatterPlot = ({
  data,
  fields,
  dimensions,
  measures,
  aspectRatio,
  medianValue,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  aspectRatio: number;
  fields: ScatterPlotFields;
  medianValue?: number;
  children: ReactNode;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <ScatterPlotProvider
          data={data}
          fields={fields}
          dimensions={dimensions}
          measures={measures}
          aspectRatio={aspectRatio}
          medianValue={medianValue}
        >
          {children}
        </ScatterPlotProvider>
      </InteractionProvider>
    </Observer>
  );
};
