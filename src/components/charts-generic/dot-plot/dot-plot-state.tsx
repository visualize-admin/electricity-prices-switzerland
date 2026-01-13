import { max, min, scaleBand, scaleLinear, scaleOrdinal } from "d3";
import { ReactNode, useCallback, useMemo } from "react";

import { LEFT_MARGIN_OFFSET } from "src/components/charts-generic/constants";
import {
  ChartContext,
  ChartProps,
  DotPlotState,
} from "src/components/charts-generic/use-chart-state";
import { InteractionProvider } from "src/components/charts-generic/use-interaction";
import { Observer, useWidth } from "src/components/charts-generic/use-width";
import { DotPlotFields } from "src/domain/config-types";
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
  isMobile,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  fields: DotPlotFields;
  aspectRatio: number;
  medianValue?: number;
  isMobile?: boolean;
}): DotPlotState => {
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

  const yAxisLabel = fields.y.axisLabel;
  const xAxisLabel = fields.x.axisLabel;

  const MOBILE_ROW_HEIGHT = 60;

  const { sortedData, xScale, yScale, bounds, segments, colors } =
    useMemo(() => {
      const sortedData = [...data];
      const xs = [
        ...sortedData.map(getX),
        ...(medianValue ? [medianValue] : []),
      ];

      const minValue = min(xs) ?? 0;
      const maxValue = max(xs) ?? 0;
      const xDomain = [minValue, maxValue];
      const xScale = scaleLinear().domain(xDomain).nice();

      const yDomain = [...new Set(sortedData.map(getY))].filter(Boolean);
      // For mobile, use placeholder domain - components use (yScale(getY(d)) || 0) + bandwidth/2
      // which naturally centers when the lookup returns undefined
      const yScale = isMobile
        ? scaleBand<string>().domain(["_"]).range([0, MOBILE_ROW_HEIGHT])
        : scaleBand().domain(yDomain).paddingInner(0.3).paddingOuter(0.2);

      const segments = [
        ...new Set(
          sortedData
            .filter(
              (d) =>
                getHighlightEntity(d)?.toString() !==
                fields.style?.highlightValue
            )
            .map(getSegment)
        ),
      ];
      const colors = fields.style?.colorMapping
        ? scaleOrdinal<string, string>()
            .domain(Object.keys(fields.style.colorMapping))
            .range(Object.values(fields.style.colorMapping))
        : scaleOrdinal<string, string>()
            .domain(segments)
            .range(getPalette(fields.segment?.palette));

      const maxYLabelWidth = Math.max(
        ...yDomain.map((label) =>
          getTextWidth(label, { fontSize: labelFontSize })
        )
      );

      const margins = {
        top: isMobile ? 0 : 80,
        right: 60,
        bottom: 60,
        left: isMobile ? 0 : maxYLabelWidth + LEFT_MARGIN_OFFSET,
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
      if (!isMobile) {
        yScale.range([0, chartHeight]);
      }

      return { sortedData, xScale, yScale, bounds, segments, colors };
    }, [
      data,
      getX,
      medianValue,
      getY,
      getSegment,
      fields.style?.colorMapping,
      fields.style?.highlightValue,
      fields.segment?.palette,
      isMobile,
      width,
      aspectRatio,
      getHighlightEntity,
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
                  fields.style?.highlightValue?.toString() &&
                getY(point) === getY(d)
              );
            })
          : null;

      if (highlightedPoint) {
        tooltipValues.push({
          label: getSegment(highlightedPoint),
          value: `${formatCurrency(getX(highlightedPoint))} ${
            xAxisLabel ? xAxisLabel : ""
          }`,
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
          value: `${formatCurrency(getX(d))} ${xAxisLabel ? xAxisLabel : ""}`,
          color: colors(getColor(d)),
          symbol: "circle",
        });
      }

      const xAnchor = xScale(getX(d));
      const yAnchor = (yScale(getY(d)) ?? 0) + yScale.bandwidth() / 2;

      return {
        values: tooltipValues,
        xAnchor,
        yAnchor,
        placement: {
          x:
            xAnchor < bounds.chartWidth * 0.2
              ? ("right" as const)
              : xAnchor > bounds.chartWidth * 0.8
              ? ("left" as const)
              : ("center" as const),
          y: "top",
        },
        xValue: getTooltipLabel(d),
      };
    },
    [
      fields.style?.highlightValue,
      fields.style?.entity,
      data,
      getHighlightEntity,
      xScale,
      getX,
      yScale,
      getY,
      bounds.chartWidth,
      getTooltipLabel,
      getSegment,
      formatCurrency,
      xAxisLabel,
      colors,
      getColor,
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
    xAxisLabel,
    yAxisLabel,
    medianValue,
    highlightedValue: fields.style?.highlightValue ?? null,
  };
};

const DotPlotProvider = ({
  data,
  fields,
  dimensions,
  measures,
  aspectRatio,
  medianValue,
  children,
  isMobile,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: DotPlotFields;
  aspectRatio: number;
  medianValue?: number;
  colorScale?: ReturnType<typeof scaleOrdinal<string, string>>;
  isMobile?: boolean;
}) => {
  const state = useScatterPlotState({
    data,
    fields,
    dimensions,
    measures,
    aspectRatio,
    medianValue,
    isMobile,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const DotPlot = ({
  data,
  fields,
  dimensions,
  measures,
  aspectRatio,
  medianValue,
  colorScale,
  children,
  isMobile,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  aspectRatio: number;
  fields: DotPlotFields;
  medianValue?: number;
  children: ReactNode;
  colorScale?: ReturnType<typeof scaleOrdinal<string, string>>;
  isMobile?: boolean;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <DotPlotProvider
          data={data}
          fields={fields}
          dimensions={dimensions}
          measures={measures}
          aspectRatio={aspectRatio}
          medianValue={medianValue}
          colorScale={colorScale}
          isMobile={isMobile}
        >
          {children}
        </DotPlotProvider>
      </InteractionProvider>
    </Observer>
  );
};
