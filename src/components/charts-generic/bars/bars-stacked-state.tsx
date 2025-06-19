import {
  descending,
  max,
  scaleBand,
  scaleLinear,
  scaleOrdinal,
  stack,
  stackOffsetNone,
  stackOrderNone,
} from "d3";
import { ReactNode, useCallback, useMemo } from "react";

import {
  ChartContext,
  ChartProps,
  StackedBarsState,
  StackRow,
} from "src/components/charts-generic/use-chart-state";
import { InteractionProvider } from "src/components/charts-generic/use-interaction";
import { Observer, useWidth } from "src/components/charts-generic/use-width";
import { BarFields } from "src/domain/config-types";
import { GenericObservation } from "src/domain/data";
import { getOpacityRanges, getPalette, getTextWidth } from "src/domain/helpers";

import {
  BAR_HEIGHT_SMALL,
  BAR_PADDING,
  LEFT_MARGIN_OFFSET,
} from "../constants";
import { useChartTheme } from "../use-chart-theme";

const useStackedBarsState = ({
  data,
  fields,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  fields: BarFields;
}): StackedBarsState => {
  const width = useWidth();
  const { labelFontSize } = useChartTheme();

  const segments = useMemo(() => {
    const iri = fields.x.componentIri;
    return Array.isArray(iri) ? iri : [iri];
  }, [fields.x]);

  const getSegment = useCallback(
    (d: GenericObservation): string => {
      for (const seg of segments) {
        if (d[seg] != null) return seg;
      }
      return segments[0];
    },
    [segments]
  );

  const getCategory = useCallback(
    (d: GenericObservation): string =>
      fields.y?.componentIri
        ? String(d[fields.y.componentIri] ?? "")
        : "category",
    [fields.y]
  );

  const getLabel = useCallback(
    (d: GenericObservation): string =>
      fields.label?.componentIri
        ? String(d[fields.label.componentIri] ?? "")
        : "",
    [fields.label]
  );

  const getColor = useCallback(
    (d: GenericObservation): string =>
      fields.style?.colorAcc ? String(d[fields.style.colorAcc] ?? "") : "",
    [fields.style]
  );

  const getOpacity = useCallback(
    (d: GenericObservation): string =>
      fields.style?.opacityAcc ? String(d[fields.style.opacityAcc] ?? "") : "",
    [fields.style]
  );

  const {
    categories,
    stackedData,
    colors,
    opacityScale,
    xScale,
    yScale,
    bounds,
  } = useMemo(() => {
    const categories = [...new Set(data.map(getCategory))].filter(Boolean);

    const stackData: StackRow[] = data.map((d) => {
      const row: StackRow = { category: getCategory(d) };
      segments.forEach((seg) => {
        row[seg] = typeof d[seg] === "number" ? (d[seg] as number) : 0;
      });
      return row;
    });

    const stackGenerator = stack<StackRow>()
      .keys(segments)
      .order(stackOrderNone)
      .offset(stackOffsetNone);
    const stackedData = stackGenerator(stackData);

    const colorRange = getPalette(fields.segment?.palette);
    const colors = scaleOrdinal<string, string>()
      .domain(segments)
      .range(colorRange);

    const opacityDomain = fields.style?.opacityDomain ?? [];
    const opacityRange = getOpacityRanges(opacityDomain.length);
    const opacityScale = scaleOrdinal<string, number>()
      .domain([...opacityDomain].sort((a, b) => descending(a, b)))
      .range(opacityRange);

    const calculatedMaxValue =
      stackedData.length > 0
        ? max(stackedData[stackedData.length - 1], (d) => d[1]) ?? 0
        : 0;

    const xScale = scaleLinear().domain([0, calculatedMaxValue]).nice();

    const maxYLabelWidth = Math.max(
      ...categories.map((label) =>
        getTextWidth(label, { fontSize: labelFontSize, fontWeight: "bold" })
      )
    );

    const margins = {
      top: 20,
      right: 40,
      bottom: 40,
      left: maxYLabelWidth + LEFT_MARGIN_OFFSET,
    };

    const chartWidth = width - margins.left - margins.right;
    const chartHeight = categories.length * (BAR_HEIGHT_SMALL + BAR_PADDING);

    const bounds = {
      width,
      height: chartHeight + margins.top + margins.bottom,
      margins,
      chartWidth,
      chartHeight,
    };

    xScale.range([0, chartWidth]);

    const yScale = scaleBand<string>()
      .domain(categories)
      .range([0, chartHeight])
      .paddingOuter(0.1);

    return {
      categories,
      stackedData,
      colors,
      opacityScale,
      xScale,
      yScale,
      bounds,
    };
  }, [data, fields, width, getCategory, segments, labelFontSize]);

  const getSegmentValue = useCallback(
    (category: string, segment: string): number => {
      const categoryData = data.filter((d) => getCategory(d) === category);
      return categoryData.reduce(
        (sum, obs) =>
          sum +
          (typeof obs[segment] === "number" ? (obs[segment] as number) : 0),
        0
      );
    },
    [data, getCategory]
  );

  const getTotalValue = useCallback(
    (category: string): number => {
      const categoryData = data.filter((d) => getCategory(d) === category);
      return categoryData.reduce(
        (sum, obs) =>
          sum +
          segments.reduce(
            (acc, seg) =>
              acc + (typeof obs[seg] === "number" ? (obs[seg] as number) : 0),
            0
          ),
        0
      );
    },
    [data, getCategory, segments]
  );

  return {
    data,
    bounds,
    getX: (d) => getTotalValue(getCategory(d)),
    xScale,
    yScale,
    getLabel,
    getColor,
    getOpacity,
    segments,
    colors,
    opacityScale,
    categories,
    stackedData,
    getSegmentValue,
    getSegment,
    getTotalValue,
    getCategory,
  };
};

const StackedBarsChartProvider = ({
  data,
  fields,
  dimensions,
  measures,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: BarFields;
}) => {
  const state = useStackedBarsState({
    data,
    fields,
    dimensions,
    measures,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const StackedBarsChart = ({
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
        <StackedBarsChartProvider
          data={data}
          fields={fields}
          dimensions={dimensions}
          measures={measures}
        >
          {children}
        </StackedBarsChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
