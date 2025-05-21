import {
  ascending,
  descending,
  group,
  interpolateLab,
  max,
  median,
  rollup,
  scaleBand,
  scaleLinear,
} from "d3";
import { ReactNode, useCallback } from "react";

import { LEFT_MARGIN_OFFSET } from "src/components/charts-generic/constants";
import { Tooltip } from "src/components/charts-generic/interaction/tooltip";
import {
  ChartContext,
  ChartProps,
  RangePlotState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import { InteractionProvider } from "src/components/charts-generic/use-interaction";
import { Observer, useWidth } from "src/components/charts-generic/use-width";
import {
  RangePlotFields,
  SortingOrder,
  SortingType,
} from "src/domain/config-types";
import { GenericObservation } from "src/domain/data";
import {
  getAnnotationSpaces,
  mkNumber,
  useFormatCurrency,
} from "src/domain/helpers";
import { minMaxBy } from "src/lib/array";
import { estimateTextWidth } from "src/lib/estimate-text-width";
import { chartPalette } from "src/themes/palette";

export const DOT_RADIUS = 8;
const OUTER_PADDING = 0.2;

const useRangePlotState = ({
  data,
  fields,
  medianValue,
}: Pick<ChartProps, "data" | "measures" | "medianValue"> & {
  fields: RangePlotFields;
}): RangePlotState => {
  const width = useWidth();
  const formatCurrency = useFormatCurrency();
  const { annotationFontSize } = useChartTheme();

  const getX = useCallback(
    (d: GenericObservation) => d[fields.x.componentIri] as number,
    [fields.x.componentIri]
  );
  const getY = useCallback(
    (d: GenericObservation) => d[fields.y.componentIri] as string,
    [fields.y.componentIri]
  );
  const getLabel = useCallback(
    (d: GenericObservation) => d[fields.label.componentIri] as string,
    [fields.label.componentIri]
  );

  const { annotation } = fields;

  const maxValue = max(data, (d) => getX(d));
  const xDomain = [0, mkNumber(maxValue)];
  const xScale = scaleLinear().domain(xDomain).nice();

  const sortingType = fields.y.sorting?.sortingType;
  const sortingOrder = fields.y.sorting?.sortingOrder;

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
    .paddingOuter(OUTER_PADDING);

  const m = medianValue;
  const colorDomain = m
    ? [xDomain[0], m - m * 0.1, m, m + m * 0.1, xDomain[1]]
    : xScale.ticks(5);

  const colors = scaleLinear<string, string>()
    .domain(colorDomain)
    .range(chartPalette.diverging.GreenToOrange)
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
        annotationFontSize,
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
  const rowHeight = DOT_RADIUS * 2 * (1 + OUTER_PADDING);
  const chartHeight = yDomain.length * rowHeight;

  const bounds = {
    width,
    height: annotationSpace + margins.top + chartHeight + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };

  xScale.range([0, chartWidth]);
  yScale.range([0, chartHeight]);

  const rangeGroups = [...group(data, getY)];

  const getAnnotationInfo = (d: GenericObservation): Tooltip => {
    const tooltipValues = minMaxBy(
      data.filter((j) => getY(j) === getY(d)),
      getX
    );

    const yAnchor = yScale(getY(d));

    return {
      xAnchor: xScale(getX(tooltipValues[1])) + 10,
      yAnchor: yAnchor ? yAnchor + margins.top + DOT_RADIUS : 0,
      placement: { x: "right", y: "middle" },
      xValue: getY(d),
      datum: {
        value: `${getX(d)}`,
      },
      values: tooltipValues.map((tv) => {
        return {
          label: getLabel(tv),
          value: `${getX(tv)}`,
          color: colors(getX(tv)),
        };
      }),
    };
  };

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
    medianValue,
    getX,
    xScale,
    getY,
    yScale,
    colors,
    rangeGroups,
    annotations,
    getAnnotationInfo,
  };
};

const RangePlotProvider = ({
  data,
  medianValue,
  fields,
  measures,
  children,
}: Pick<ChartProps, "data" | "measures" | "medianValue"> & {
  children: ReactNode;
  fields: RangePlotFields;
}) => {
  const state = useRangePlotState({
    data,
    fields,
    measures,
    medianValue,
  });

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const RangePlot = ({
  data,
  medianValue,
  fields,
  measures,
  children,
}: Pick<ChartProps, "data" | "measures" | "medianValue"> & {
  children: ReactNode;
  fields: RangePlotFields;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <RangePlotProvider
          data={data}
          medianValue={medianValue}
          fields={fields}
          measures={measures}
        >
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
