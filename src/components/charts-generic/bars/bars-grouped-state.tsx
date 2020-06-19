import { ascending, group, max, min, rollup, sum, descending } from "d3-array";
import {
  scaleBand,
  ScaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
} from "d3-scale";
import * as React from "react";
import { ReactNode, useCallback, useMemo } from "react";
import { Observation, ObservationValue } from "../../../domain/data";
import { getPalette, mkNumber, useFormatNumber } from "../../../domain/helpers";
import { estimateTextWidth } from "../../../lib/estimate-text-width";
import { Tooltip } from "../annotations/tooltip";
import {
  BOTTOM_MARGIN_OFFSET,
  LEFT_MARGIN_OFFSET,
  BAR_HEIGHT,
  VERTICAL_PADDING,
} from "../constants";
import { Bounds, Observer, useWidth } from "../use-width";
import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";
import { sortByIndex } from "../../../lib/array";
import {
  BarFields,
  SortingType,
  SortingOrder,
} from "../../../domain/config-types";
import {
  VERTICAL_PADDING_INNER,
  VERTICAL_PADDING_OUTER,
  VERTICAL_PADDING_WITHIN,
} from "../constants";

export interface GroupedBarsState {
  sortedData: Observation[];
  bounds: Bounds;
  getX: (d: Observation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: Observation) => string;
  yScale: ScaleBand<string>;
  yScaleIn: ScaleBand<string>;
  getSegment: (d: Observation) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  grouped: [string, Record<string, ObservationValue>[]][];
  // getAnnotationInfo: (d: Observation) => Tooltip;
}

const useGroupedBarsState = ({
  data,
  fields,
  dimensions,
  measures,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  fields: BarFields;
}): GroupedBarsState => {
  const width = useWidth();
  const formatNumber = useFormatNumber();
  const getX = useCallback(
    (d: Observation) => d[fields.x.componentIri] as number,
    [fields.x.componentIri]
  );
  const getY = useCallback(
    (d: Observation) => d[fields.y.componentIri] as string,
    [fields.y.componentIri]
  );
  const getSegment = useCallback(
    (d: Observation): string =>
      fields.segment && fields.segment.componentIri
        ? (d[fields.segment.componentIri] as string)
        : "segment",
    [fields.segment]
  );

  // Sort
  const ySortingType = fields.y.sorting?.sortingType;
  const ySortingOrder = fields.y.sorting?.sortingOrder;

  const yOrder = [
    ...rollup(
      data,
      (v) => sum(v, (x) => getX(x)),
      (x) => getY(x)
    ),
  ]
    .sort((a, b) => ascending(a[1], b[1]))
    .map((d) => d[0]);

  const sortedData = useMemo(
    () =>
      sortData({
        data,
        getY,
        ySortingType,
        ySortingOrder,
        yOrder,
      }),
    [data, getX, ySortingType, ySortingOrder, yOrder]
  );
  // segments
  const segmentSortingType = fields.segment?.sorting?.sortingType;
  const segmentSortingOrder = fields.segment?.sorting?.sortingOrder;
  const segmentsOrderedByName = Array.from(
    new Set(sortedData.map((d) => getSegment(d)))
  ).sort((a, b) =>
    segmentSortingOrder === "asc" ? ascending(a, b) : descending(a, b)
  );

  const segmentsOrderedByTotalValue = [
    ...rollup(
      sortedData,
      (v) => sum(v, (x) => getX(x)),
      (x) => getSegment(x)
    ),
  ]
    .sort((a, b) =>
      segmentSortingOrder === "asc"
        ? ascending(a[1], b[1])
        : descending(a[1], b[1])
    )
    .map((d) => d[0]);

  const segments =
    segmentSortingType === "byDimensionLabel"
      ? segmentsOrderedByName
      : segmentsOrderedByTotalValue;

  // Map ordered segments to colors
  const colors = scaleOrdinal<string, string>();
  const segmentDimension = dimensions.find(
    (d) => d.iri === fields.segment?.componentIri
  ) as $FixMe;

  if (fields.segment && segmentDimension && fields.segment.colorMapping) {
    const orderedSegmentLabelsAndColors = segments.map((segment) => {
      const dvIri = segmentDimension.values.find(
        (s: $FixMe) => s.label === segment
      ).value;

      return {
        label: segment,
        color: fields.segment?.colorMapping![dvIri] || "#006699",
      };
    });

    colors.domain(orderedSegmentLabelsAndColors.map((s) => s.label));
    colors.range(orderedSegmentLabelsAndColors.map((s) => s.color));
  } else {
    colors.domain(segments);
    colors.range(getPalette(fields.segment?.palette));
  }

  // x
  const bandDomain = [...new Set(sortedData.map((d) => getY(d) as string))];
  const yScale = scaleBand()
    .domain(bandDomain)
    .paddingInner(VERTICAL_PADDING)
    .paddingOuter(VERTICAL_PADDING);
  // const yScaleInteraction = scaleBand()
  //   .domain(bandDomain)
  //   .paddingInner(0)
  //   .paddingOuter(0);

  // const inBandDomain = [...new Set(sortedData.map(getSegment))];
  const yScaleIn = scaleBand()
    .domain(segments)
    .padding(VERTICAL_PADDING_WITHIN);

  // y
  const minValue = Math.min(mkNumber(min(sortedData, (d) => getX(d))), 0);
  const maxValue = max(sortedData, (d) => getX(d)) as number;
  const xScale = scaleLinear()
    .domain([mkNumber(minValue), mkNumber(maxValue)])
    .nice();
  // const yAxisLabel =
  //   measures.find((d) => d.iri === fields.y.componentIri)?.label ??
  //   fields.y.componentIri;

  // Group
  const groupedMap = group(sortedData, getY);
  const grouped = [...groupedMap];

  // sort by segments
  grouped.forEach((group) => {
    return [
      group[0],
      sortByIndex({
        data: group[1],
        order: segments,
        getCategory: getSegment,
        sortOrder: segmentSortingOrder,
      }),
    ];
  });

  // Dimensions
  // const left = Math.max(
  //   estimateTextWidth(formatNumber(xScale.domain()[0])),
  //   estimateTextWidth(formatNumber(xScale.domain()[1]))
  // );
  // const bottom = max(bandDomain, (d) => estimateTextWidth(d)) || 70;
  const margins = {
    top: 50,
    right: 40,
    bottom: BOTTOM_MARGIN_OFFSET,
    left: LEFT_MARGIN_OFFSET,
  };
  const chartWidth = width - margins.left - margins.right;
  const baseHeight = BAR_HEIGHT * data.length;
  const chartHeight = baseHeight + baseHeight * (1 + VERTICAL_PADDING);
  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };

  xScale.range([0, chartWidth]);
  yScale.rangeRound([0, chartHeight]);
  yScaleIn.range([0, yScale.bandwidth()]);

  // Tooltip
  // const getAnnotationInfo = (datum: Observation): Tooltip => {
  //   const xRef = xScale(getX(datum)) as number;
  //   const xOffset = xScale.bandwidth() / 2;
  //   const yRef = yScale(getY(datum));
  //   const yAnchor = yRef;

  //   const tooltipValues = data.filter((j) => getX(j) === getX(datum));
  //   const sortedTooltipValues = sortByIndex({
  //     data: tooltipValues,
  //     order: segments,
  //     getCategory: getSegment,
  //     // Always ascending to match visual order of colors of the stack
  //     sortOrder: "asc",
  //   });

  //   const yPlacement = yAnchor < chartHeight * 0.33 ? "middle" : "top";

  //   const getXPlacement = () => {
  //     if (yPlacement === "top") {
  //       return xRef < chartWidth * 0.33
  //         ? "right"
  //         : xRef > chartWidth * 0.66
  //         ? "left"
  //         : "center";
  //     } else {
  //       // yPlacement === "middle"
  //       return xRef < chartWidth * 0.5 ? "right" : "left";
  //     }
  //   };
  //   const xPlacement = getXPlacement();

  //   const getXAnchor = () => {
  //     if (yPlacement === "top") {
  //       return xPlacement === "right"
  //         ? xRef
  //         : xPlacement === "center"
  //         ? xRef + xOffset
  //         : xRef + xOffset * 2;
  //     } else {
  //       // yPlacement === "middle"
  //       return xPlacement === "right" ? xRef + xOffset * 2 : xRef;
  //     }
  //   };
  //   const xAnchor = getXAnchor();

  //   return {
  //     xAnchor,
  //     yAnchor,
  //     placement: { x: xPlacement, y: yPlacement },
  //     xValue: getX(datum),
  //     datum: {
  //       label: fields.segment && getSegment(datum),
  //       value: formatNumber(getY(datum)),
  //       color: colors(getSegment(datum)) as string,
  //     },
  //     values: sortedTooltipValues.map((td) => ({
  //       label: getSegment(td),
  //       value: formatNumber(getY(td)),
  //       color: colors(getSegment(td)) as string,
  //     })),
  //   };
  // };

  return {
    sortedData,
    bounds,
    getX,
    xScale,
    // yScaleInteraction,
    getY,
    yScale,
    yScaleIn,
    getSegment,
    segments,
    colors,
    grouped,
    // getAnnotationInfo,
  };
};

const GroupedBarsChartProvider = ({
  data,
  fields,
  dimensions,
  measures,

  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: BarFields;
}) => {
  const state = useGroupedBarsState({
    data,
    fields,
    dimensions,
    measures,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const GroupedBarsChart = ({
  data,
  fields,
  dimensions,
  measures,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: BarFields;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <GroupedBarsChartProvider
          data={data}
          fields={fields}
          dimensions={dimensions}
          measures={measures}
        >
          {children}
        </GroupedBarsChartProvider>
      </InteractionProvider>
    </Observer>
  );
};

const sortData = ({
  data,
  getY,
  ySortingType,
  ySortingOrder,
  yOrder,
}: {
  data: Observation[];
  getY: (d: Observation) => string;
  ySortingType: SortingType | undefined;
  ySortingOrder: SortingOrder | undefined;
  yOrder: string[];
}) => {
  if (ySortingOrder === "desc" && ySortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => descending(getY(a), getY(b)));
  } else if (ySortingOrder === "asc" && ySortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => ascending(getY(a), getY(b)));
  } else if (ySortingType === "byMeasure") {
    const sd = sortByIndex({
      data,
      order: yOrder,
      getCategory: getY,
      sortOrder: ySortingOrder,
    });
    return sd;
  } else {
    // default to scending alphabetical
    return [...data].sort((a, b) => ascending(getY(a), getY(b)));
  }
};
