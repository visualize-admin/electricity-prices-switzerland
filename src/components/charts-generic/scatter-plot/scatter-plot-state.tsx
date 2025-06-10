import {
  max,
  min,
  scaleBand,
  ScaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
} from "d3";
import { ReactNode, useCallback, useMemo } from "react";

import { LEFT_MARGIN_OFFSET } from "src/components/charts-generic/constants";
import {
  ChartContext,
  ChartProps,
} from "src/components/charts-generic/use-chart-state";
import { InteractionProvider } from "src/components/charts-generic/use-interaction";
import {
  Bounds,
  Observer,
  useWidth,
} from "src/components/charts-generic/use-width";
import { ScatterPlotFields } from "src/domain/config-types";
import { GenericObservation } from "src/domain/data";
import { getPalette, getTextWidth } from "src/domain/helpers";
import { chartPalette } from "src/themes/palette";

import { Tooltip, TooltipValue } from "../interaction/tooltip";
import { useChartTheme } from "../use-chart-theme";

export interface ScatterPlotState {
  data: GenericObservation[];
  bounds: Bounds;
  segments: string[];
  getX: (d: GenericObservation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: GenericObservation) => string;
  yScale: ScaleBand<string>;
  getSegment: (d: GenericObservation) => string;
  colors: ScaleOrdinal<string, string>;
  getAnnotationInfo: (d: GenericObservation) => Tooltip;
  getColor: (d: GenericObservation) => string;
  operatorsId?: string;
  medianValue: number;
}

const useScatterPlotState = ({
  data,
  fields,
  aspectRatio,
  medianValue,
  operatorsId,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  fields: ScatterPlotFields;
  aspectRatio: number;
  operatorsId: string;
  medianValue: number;
}): ScatterPlotState => {
  const width = useWidth();

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
      fields.segment && fields.segment.componentIri
        ? (d[fields.segment.componentIri] as string)
        : "segment",
    [fields.segment]
  );

  const getColor = useCallback(
    (d: GenericObservation): string =>
      fields.style && fields.style.colorAcc
        ? (d[fields.style.colorAcc] as string)
        : "operatorLabel",
    [fields.style]
  );

  const sortedData = useMemo(() => [...data], [data]);

  // X scale (horizontal, for values)
  const minValue = min(sortedData, getX) || 0;
  const maxValue = max(sortedData, getX) as number;
  const xDomain = [minValue, maxValue];
  const xScale = scaleLinear().domain(xDomain).nice();

  // Y scale (vertical, for categories)
  const yDomain = [...new Set(sortedData.map(getY))].filter(Boolean);
  const yScale = scaleBand()
    .domain(yDomain)
    .paddingInner(0.3)
    .paddingOuter(0.2);

  const segments = [...new Set(sortedData.map(getSegment))];

  const colors = scaleOrdinal<string, string>();
  colors.domain(segments);
  colors.range(getPalette(fields.segment?.palette));

  // Calculate margins based on y-axis labels
  const { labelFontSize } = useChartTheme();
  const maxYLabelWidth = Math.max(
    ...yDomain
      .filter((label) => label != null && label !== undefined)
      .map((label) => getTextWidth(String(label), { fontSize: labelFontSize }))
  );
  const margins = {
    top: 40,
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

  const getAnnotationInfo = (d: GenericObservation): Tooltip => {
    const tooltipValues: TooltipValue[] = [];

    const selectedPoint = data.find((point) => {
      const matchesId = point.operator_id.toString() === operatorsId;
      const sameCategory = getY(point) === getY(d);
      return matchesId && sameCategory;
    });

    if (selectedPoint) {
      tooltipValues.push({
        label: getSegment(selectedPoint),
        value: `${getX(selectedPoint)}`,
        color: chartPalette.categorical[0],
        symbol: "circle",
      });
    }

    const hoveredPointIsSelected = d.operator_id.toString() === operatorsId;
    if (!hoveredPointIsSelected) {
      tooltipValues.push({
        label: getSegment(d),
        value: `${getX(d)}`,
        color: chartPalette.categorical[2],
        symbol: "circle",
      });
    }

    return {
      values: tooltipValues,
      xAnchor: xScale(getX(d)),
      yAnchor: (yScale(getY(d)) ?? 0) + yScale.bandwidth() / 2,
      placement: { x: "center", y: "top" },
      xValue: d.year.toString(),
    };
  };
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
    operatorsId,
    getColor,
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
  operatorsId,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: ScatterPlotFields;
  aspectRatio: number;
  medianValue: number;
  operatorsId: string;
}) => {
  const state = useScatterPlotState({
    data,
    fields,
    dimensions,
    measures,
    aspectRatio,
    operatorsId,
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
  operatorsId,
  medianValue,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  aspectRatio: number;
  fields: ScatterPlotFields;
  operatorsId: string;
  medianValue: number;
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
          operatorsId={operatorsId}
          medianValue={medianValue}
        >
          {children}
        </ScatterPlotProvider>
      </InteractionProvider>
    </Observer>
  );
};
