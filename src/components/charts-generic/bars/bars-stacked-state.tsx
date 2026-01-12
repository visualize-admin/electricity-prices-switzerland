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

import { Tooltip } from "src/components/charts-generic/interaction/tooltip";
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

const MOBILE_ROW_HEIGHT = 20;

const useStackedBarsState = ({
  data,
  fields,
  measures,
  isMobile,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  fields: BarFields;
  isMobile?: boolean;
}): StackedBarsState => {
  const width = useWidth();
  const { labelFontSize } = useChartTheme();

  const measuresByIri = useMemo(() => {
    return Object.fromEntries(measures.map((m) => [m.iri, m]));
  }, [measures]);

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

  const { annotation } = fields;
  const xAxisLabel = fields.x.axisLabel;

  const {
    categories,
    stackedData,
    colors,
    opacityScale,
    xScale,
    yScale,
    annotations,
    bounds,
    getAnnotationInfo,
    getCategoryFromYValue,
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
      top: isMobile ? 0 : 50,
      right: 40,
      bottom: isMobile ? 0 : 40,
      left: isMobile ? 0 : maxYLabelWidth + LEFT_MARGIN_OFFSET,
    };

    const chartWidth = width - margins.left - margins.right;
    const chartHeight = isMobile
      ? MOBILE_ROW_HEIGHT
      : categories.length * (BAR_HEIGHT_SMALL + BAR_PADDING);

    const bounds = {
      width,
      height: chartHeight + margins.top + margins.bottom,
      margins: {
        ...margins,
        annotations: annotation ? chartHeight : 0,
      },
      chartWidth,
      chartHeight,
    };

    xScale.range([0, chartWidth]);

    // For mobile, use placeholder domain - components will pass row-specific data
    const yScale = isMobile
      ? scaleBand<string>().domain(["_"]).range([0, MOBILE_ROW_HEIGHT])
      : scaleBand<string>()
          .domain(categories)
          .range([0, chartHeight])
          .paddingOuter(0.1);

    const getCategoryFromYValue = (
      yValue: number,
      data: GenericObservation[]
    ): string | undefined => {
      if (isMobile) {
        // On mobile, we render only 1 row at a time, so return that category
        return getCategory(data[0]);
      } else {
        const step = yScale.step();
        const index = Math.floor(yValue / step);
        return yScale.domain()[index];
      }
    };

    const annotations = annotation?.map((a) => {
      return {
        x: xScale(a.value as number),
        y: yScale("0") ?? 0,
        nbOfLines: 1,
        xLabel: xScale(a.value as number),
        yLabel: 0,
        value: a.value.toString(),
        label: getLabel(a),
      };
    });

    const getAnnotationInfo = (d: GenericObservation): Tooltip => {
      const avg = segments.reduce((sum, seg) => {
        return (
          sum +
          (typeof d[seg] === "number" ? (d[seg] as number) : 0) /
            segments.length
        );
      }, 0);

      const xAnchor = xScale(avg);
      const yAnchor = yScale(getCategory(d)) || 0;

      return {
        datum: {
          label: getCategory(d),
          value: "0",
          color: "red",
          yPos: 1,
          symbol: "arrow",
        },
        values: segments.map((seg) => ({
          label: measuresByIri[seg]?.label ?? seg,
          value: (+d[seg]).toFixed(2),
          color: colors(seg),
        })),
        xAnchor: xAnchor,
        yAnchor: yAnchor,
        placement: {
          x:
            xAnchor < bounds.chartWidth * 0.2
              ? ("right" as const)
              : xAnchor > bounds.chartWidth * 0.8
              ? ("left" as const)
              : ("center" as const),
          y: "top",
        },
        xValue: getCategory(d),
      };
    };

    return {
      categories,
      stackedData,
      colors,
      opacityScale,
      xScale,
      annotations,
      yScale,
      bounds,
      getAnnotationInfo,
      getCategoryFromYValue,
    };
  }, [
    data,
    getCategory,
    segments,
    fields.segment?.palette,
    fields.style?.opacityDomain,
    width,
    annotation,
    labelFontSize,
    getLabel,
    measuresByIri,
    isMobile,
  ]);

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
    getCategoryFromYValue,
    annotations,
    xAxisLabel,
    getAnnotationInfo,
  };
};

const StackedBarsChartProvider = ({
  data,
  fields,
  dimensions,
  measures,
  children,
  isMobile,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: BarFields;
  isMobile?: boolean;
}) => {
  const state = useStackedBarsState({
    data,
    fields,
    dimensions,
    measures,
    isMobile,
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
  isMobile,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: BarFields;
  isMobile?: boolean;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <StackedBarsChartProvider
          data={data}
          fields={fields}
          dimensions={dimensions}
          measures={measures}
          isMobile={isMobile}
        >
          {children}
        </StackedBarsChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
