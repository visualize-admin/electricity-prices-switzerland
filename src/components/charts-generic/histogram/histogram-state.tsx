import { t } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { ascending, bin, Bin, interpolateHsl, max, min, scaleLinear } from "d3";
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
  getPalette,
  mkNumber,
  useFormatCurrency,
} from "src/domain/helpers";
import { estimateTextWidth } from "src/lib/estimate-text-width";
import { useIsMobile } from "src/lib/use-mobile";
import { chartPalette } from "src/themes/palette";

export type BinMeta = {
  x0: number;
  x1: number;
  label: string;
  isNoData?: boolean;
};

const computeBins = (
  data: GenericObservation[],
  getX: (d: GenericObservation) => number,
  groupedBy: number | undefined,
  minValue: number,
  maxValue: number,
  xScale: d3.ScaleLinear<number, number>
): {
  bins: Array<Bin<GenericObservation, number> & { label?: string }>;
  binMeta: BinMeta[];
} => {
  if (!groupedBy) {
    const bins = bin<GenericObservation, number>()
      .value(getX)
      .domain([mkNumber(minValue), mkNumber(maxValue)])
      .thresholds(xScale.ticks(25))(data)
      .map((b) => Object.assign(b, { label: `${b.x0}-${b.x1}` }));
    const binMeta = bins.map((b) => ({
      x0: b.x0!,
      x1: b.x1!,
      label: `${b.x0}-${b.x1}`,
    }));
    return { bins, binMeta };
  }

  const values = data
    .map(getX)
    .filter((v) => typeof v === "number" && !isNaN(v));
  const nonZero = values.filter((v) => v > 0);
  const max = Math.max(...nonZero, groupedBy);

  const binMeta: BinMeta[] = [
    {
      x0: 0,
      x1: 0,
      label: t({ id: "histogram.noData", message: "No Data" }),
      isNoData: true,
    },
    ...Array.from({ length: Math.ceil((max - 1 + 1) / groupedBy) }, (_, i) => {
      const start = 1 + i * groupedBy;
      const end = start + groupedBy - 1;
      const isLast = end >= max;
      return {
        x0: start,
        x1: isLast ? max : end,
        label: isLast ? `${start}+` : `${start}-${end}`,
      };
    }),
  ];

  const bins = binMeta.map((meta) => {
    let arr: GenericObservation[] = [];
    if (meta.isNoData) {
      arr = data.filter((d) => getX(d) === 0);
    } else if (meta.label.endsWith("+")) {
      arr = data.filter((d) => getX(d) >= meta.x0);
    } else {
      arr = data.filter((d) => getX(d) >= meta.x0 && getX(d) <= meta.x1);
    }
    const binArr = arr as Bin<GenericObservation, number> & { label?: string };
    binArr.x0 = meta.x0;
    binArr.x1 = meta.x1;
    binArr.label = meta.label;
    return binArr;
  });

  return { bins, binMeta };
};

const useHistogramState = ({
  data,
  medianValue,
  fields,
  aspectRatio,
  xAxisLabel,
  yAxisLabel,
  xAxisUnit,
  groupedBy,
  yAsPercentage,
}: Pick<ChartProps, "data" | "measures" | "medianValue"> & {
  fields: HistogramFields;
  aspectRatio: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xAxisUnit?: string;
  groupedBy?: number;
  yAsPercentage?: boolean;
}): HistogramState => {
  const width = useWidth();
  const formatCurrency = useFormatCurrency();
  const { annotationFontSize } = useChartTheme();

  const getX = useCallback(
    (d: GenericObservation) => d[fields.x.componentIri] as number,
    [fields.x.componentIri]
  );

  const totalCount = data.length;
  const getY = (d: GenericObservation[]) =>
    yAsPercentage ? ((d?.length ?? 0) / totalCount) * 100 : d?.length ?? 0;

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

  const { bins, binMeta } = computeBins(
    data,
    getX,
    groupedBy,
    minValue,
    maxValue,
    xScale
  );

  let yDomainMax;
  if (yAsPercentage) {
    // Find the max percentage in bins
    const maxPct = Math.max(
      ...bins.map((d) => ((d.length ?? 0) / totalCount) * 100)
    );
    // Round up to the next logical tick (nearest 5%)
    yDomainMax = Math.ceil(maxPct / 5) * 5;
    // Optionally, always show up to 100%:
    // yDomainMax = 100;
  } else {
    yDomainMax = max(bins, (d) => d.length) || 100;
  }
  const yScale = scaleLinear().domain([0, yDomainMax]);

  // Dimensions
  const left = Math.max(
    estimateTextWidth(formatCurrency(yScale.domain()[0])),
    estimateTextWidth(
      formatCurrency(
        yScale.domain().length > 1 ? yScale.domain()[1] : yScale.domain()[0]
      )
    )
  );

  const isMobile = useIsMobile();

  const margins = {
    top: isMobile ? 140 : 70,
    right: 40,
    bottom: 100,
    left: left + LEFT_MARGIN_OFFSET,
  };

  const chartWidth = width - margins.left - margins.right;

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

  const getAnnotationInfo = (d: Bin<GenericObservation, number>) => {
    return {
      placement: { x: "center", y: "top" },
      xAnchor: xScale(((d.x1 ?? 0) + (d.x0 ?? 0)) / 2),
      yAnchor:
        yScale(getY(d)) +
        margins.top -
        TOOLTIP_ARROW_HEIGHT -
        VERTICAL_TICK_OFFSET,
      xValue: "",
      tooltipContent: (
        <>
          <Box sx={{ alignItems: "center", gap: "0.375rem" }} display="flex">
            <LegendSymbol symbol="square" color={colors(d.x0 ?? 0)} />
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {(d as Bin<GenericObservation, number> & { label?: string })
                .label || `${d.x0}-${d.x1}`}
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
    binMeta,
    fields,
    yAsPercentage,
    totalCount,
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
  groupedBy,
  yAsPercentage,
}: Pick<ChartProps, "data" | "measures" | "medianValue"> & {
  children: ReactNode;
  fields: HistogramFields;
  aspectRatio: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xAxisUnit?: string;
  groupedBy?: number;
  yAsPercentage?: boolean;
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
    groupedBy,
    yAsPercentage,
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
  groupedBy,
  yAsPercentage,
}: Pick<ChartProps, "data" | "measures" | "medianValue"> & {
  children: ReactNode;
  fields: HistogramFields;
  aspectRatio: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xAxisUnit?: string;
  groupedBy?: number;
  yAsPercentage?: boolean;
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
          groupedBy={groupedBy}
          yAsPercentage={yAsPercentage}
        >
          {children}
        </HistogramProvider>
      </InteractionProvider>
    </Observer>
  );
};

export const getBarColor = ({
  bin,
  meta,
  fields,
  colors,
  theme,
  binIndex,
}: {
  bin: GenericObservation[];
  meta: BinMeta;
  fields: HistogramFields;
  colors: d3.ScaleLinear<string, string> | undefined;
  theme: Theme;
  binIndex: number;
}): string => {
  if (fields?.style?.colorAcc) {
    const d = bin[0];
    if (d && d[fields.style.colorAcc]) {
      return d[fields.style.colorAcc] as string;
    }
  }
  if (fields?.style?.palette) {
    const palette = getPalette(fields.style.palette);
    if (palette && palette.length > 0) {
      return palette[binIndex % palette.length];
    }
  }
  if (meta.isNoData) return "transparent";
  if (bin.length > 0)
    return colors
      ? colors((meta.x0 + meta.x1) / 2)
      : theme.palette.primary.main;
  return "transparent";
};
