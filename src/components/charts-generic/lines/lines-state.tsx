import { useTheme } from "@mui/material";
import {
  ascending,
  descending,
  extent,
  group,
  groups,
  max,
  min,
} from "d3-array";
import {
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  ScaleTime,
  scaleTime,
} from "d3-scale";
import { ReactNode, useCallback, useMemo } from "react";

import { LEFT_MARGIN_OFFSET } from "src/components/charts-generic/constants";
import { Tooltip } from "src/components/charts-generic/interaction/tooltip";
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
import { LineFields } from "src/domain/config-types";
import { GenericObservation, ObservationValue } from "src/domain/data";
import {
  getPalette,
  parseDate,
  useFormatCurrency,
  useFormatFullDateAuto,
} from "src/domain/helpers";
import { getLocalizedLabel } from "src/domain/translation";
import { estimateTextWidth } from "src/lib/estimate-text-width";

export interface LinesState {
  data: GenericObservation[];
  bounds: Bounds;
  segments: string[];
  getX: (d: GenericObservation) => Date;
  xScale: ScaleTime<number, number>;
  xUniqueValues: Date[];
  getY: (d: GenericObservation) => number;
  yScale: ScaleLinear<number, number>;
  getSegment: (d: GenericObservation) => string;
  getColor: (d: GenericObservation) => string;
  colors: ScaleOrdinal<string, string>;
  xAxisLabel: string;
  yAxisLabel: string;
  grouped: [string, Record<string, ObservationValue>[]][];
  wide: ArrayLike<Record<string, ObservationValue>>;
  xKey: string;
  getAnnotationInfo: (d: GenericObservation) => Tooltip;
}

const roundDomain = (scale: ScaleLinear<number, number>) => {
  const d = scale.domain();
  return scale.domain([Math.floor(d[0]), Math.ceil(d[1])]);
};

const useLinesState = ({
  data,
  fields,
  measures,
  aspectRatio,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  fields: LineFields;
  aspectRatio: number;
}): LinesState => {
  const theme = useTheme();
  const width = useWidth();
  const formatCurrency = useFormatCurrency();
  const formatDateAuto = useFormatFullDateAuto();

  const getGroups = (d: GenericObservation): string =>
    d[fields.x.componentIri] as string;
  const getX = useCallback(
    (d: GenericObservation): Date =>
      parseDate(d[fields.x.componentIri].toString()),
    [fields.x.componentIri]
  );
  const getY = (d: GenericObservation): number =>
    +d[fields.y.componentIri] as number;

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
        : "municipalityLabel",
    [fields.style]
  );

  // data
  const sortedData = useMemo(
    () => [...data].sort((a, b) => ascending(getX(a), getX(b))),
    [data, getX]
  );

  // x
  const xUniqueValues = sortedData
    .map((d) => getX(d))
    .filter(
      (date, i, self) =>
        self.findIndex((d) => d.getTime() === date.getTime()) === i
    );

  const xDomain = extent(sortedData, (d) => getX(d)) as [Date, Date];
  const xScale = scaleTime().domain(xDomain);

  const xAxisLabel =
    measures.find((d) => d.iri === fields.x.componentIri)?.label ??
    fields.x.componentIri;
  // y
  const minValue = min(sortedData, getY) || 0;
  const maxValue = max(sortedData, getY) as number;
  const yDomain = [minValue, maxValue];

  let yScale = scaleLinear().domain(yDomain).nice(4);
  yScale = roundDomain(yScale);

  const yAxisLabel = "unit";

  // segments
  const segments = [...new Set(sortedData.map(getSegment))];

  // Map ordered segments to colors
  const colorDomain = fields.style?.colorDomain
    ? fields.style?.colorDomain
    : [""];

  const colors = scaleOrdinal<string, string>();
  colors.domain(colorDomain);
  colors.range(getPalette(fields.segment?.palette));

  const xKey = fields.x.componentIri;

  const grouped = [...group(sortedData, getSegment)];

  // Mutates dataset to make sure all x values
  // match a data point (to avoid straight lines between defined data points.)
  grouped.map((lineData) => {
    xUniqueValues.map((xValue) => {
      const thisYear = lineData[1].find(
        (d) => getX(d).getFullYear() === xValue.getFullYear()
      );
      if (!thisYear) {
        lineData[1].push({
          period: `${xValue.getFullYear()}`,
          [fields.y.componentIri]: undefined as unknown as ObservationValue,
          uniqueId:
            lineData[1][0].__typename === "OperatorObservation"
              ? `${lineData[1][0].municipalityLabel}, ${lineData[1][0].operatorLabel}`
              : lineData[1][0].cantonLabel,
          municipalityLabel: lineData[1][0].municipalityLabel,
          operatorLabel: lineData[1][0].operatorLabel,
          municipality: lineData[1][0].municipality,
          operator: lineData[1][0].operator,
        });
      }
    });
  });

  const minText = formatCurrency(yDomain[0]);
  const maxText = formatCurrency(yDomain[1]);
  const floatingPointExtra =
    Math.abs(yDomain[yDomain.length - 1] - yDomain[0]) === 1 ? 10 : 0;

  // Dimensions
  const left = Math.max(
    estimateTextWidth(minText) + floatingPointExtra,
    estimateTextWidth(maxText) + floatingPointExtra
  );
  const margins = {
    top: 40,
    right: 40,
    bottom: 40,
    left: left + LEFT_MARGIN_OFFSET,
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
  yScale.range([chartHeight, 0]);

  // Grouped by x (for mouse interaction on x)
  const groupedMap = group(sortedData, getGroups);
  const wide = [];

  for (const [key, values] of groupedMap) {
    const keyObject = values.reduce((obj, cur) => {
      const currentKey = getSegment(cur);
      return {
        ...obj,
        [currentKey]: getY(cur),
      };
    }, {});
    wide.push({
      ...keyObject,
      [xKey]: key,
    });
  }

  const entity = fields.style?.entity || "";
  // Tooltip
  const getAnnotationInfo = (datum: GenericObservation): Tooltip => {
    const xAnchor = xScale(getX(datum));
    const yAnchor = yScale(getY(datum));

    const tooltipValues = data.filter(
      (j) => getX(j).getTime() === getX(datum).getTime()
    );
    // console.log({ tooltipValues });
    const groupedTooltipValues = groups(
      tooltipValues,
      (d: GenericObservation) => getColor(d),
      (d: GenericObservation) => getY(d)
    );

    const summarizedTooltipValues: {
      [x: string]: number | string;
    }[] = groupedTooltipValues.flatMap((ent: $FixMe) =>
      ent[1].flatMap((value: $FixMe) =>
        value[1].length === 1
          ? { ...value[1][0], label: value[1][0].uniqueId }
          : {
              [fields.y.componentIri]: value[0],

              uniqueId: `${value[1].length} ${
                entity === "canton"
                  ? getLocalizedLabel({
                      id: "cantons",
                    })
                  : getLocalizedLabel({
                      id:
                        entity === "operator" ? "municipalities" : "operators",
                    })
              }`,
              // These values depend on the entity, might be incorrect!
              municipalityLabel: value[1][0].municipalityLabel,
              operatorLabel: value[1][0].operatorLabel,
              municipality: value[1][0].municipality,
              operator: value[1][0].operator,
            }
      )
    );

    // const sortedTooltipValues = sortByIndex({
    //   data: tooltipValues,
    //   order: segments,
    //   getCategory: getSegment,
    //   sortOrder: "asc",
    // });
    const xPlacement = xAnchor < chartWidth * 0.5 ? "right" : "left";

    const yPlacement = "middle";

    return {
      xAnchor,
      yAnchor,
      placement: { x: xPlacement, y: yPlacement },
      xValue: formatDateAuto(getX(datum)),
      datum: {
        label: fields.segment && getSegment(datum),
        value: `${formatCurrency(getY(datum))} ${getLocalizedLabel({
          id: "unit",
        })}`,
      },
      values: summarizedTooltipValues
        .sort((a, b) => descending(getY(a), getY(b)))
        .map((td) => ({
          label: getSegment(td),
          value: `${formatCurrency(getY(td))} ${getLocalizedLabel({
            id: "unit",
          })}`,
          color:
            segments.length > 1
              ? (colors(getColor(td)) as string)
              : theme.palette.primary.main,
          yPos: yScale(getY(td)),
        })),
    };
  };

  return {
    data,
    bounds,
    getX,
    xScale,
    xUniqueValues,
    getY,
    yScale,
    getSegment,
    getColor,
    xAxisLabel,
    yAxisLabel,
    segments,
    colors,
    grouped,
    wide,
    xKey,
    getAnnotationInfo,
  };
};

const LineChartProvider = ({
  data,
  fields,
  dimensions,
  measures,
  aspectRatio,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: LineFields;
  aspectRatio: number;
}) => {
  const state = useLinesState({
    data,
    fields,
    dimensions,
    measures,
    aspectRatio,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const LineChart = ({
  data,
  fields,
  dimensions,
  measures,
  aspectRatio,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  aspectRatio: number;
  fields: LineFields;
  children: ReactNode;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <LineChartProvider
          data={data}
          fields={fields}
          dimensions={dimensions}
          measures={measures}
          aspectRatio={aspectRatio}
        >
          {children}
        </LineChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
