import {
  ascending,
  descending,
  extent,
  group,
  groups,
  max,
  min,
  scaleLinear,
  ScaleLinear,
  scaleOrdinal,
  scaleTime,
} from "d3";
import { ReactNode, useCallback, useMemo } from "react";

import { Tooltip } from "src/components/charts-generic/interaction/tooltip";
import {
  ChartContext,
  ChartProps,
  LinesState,
} from "src/components/charts-generic/use-chart-state";
import { InteractionProvider } from "src/components/charts-generic/use-interaction";
import { Observer, useWidth } from "src/components/charts-generic/use-width";
import { LineFields } from "src/domain/config-types";
import { GenericObservation, ObservationValue } from "src/domain/data";
import {
  getPalette,
  getTextWidth,
  parseDate,
  useFormatCurrency,
  useFormatFullDateAuto,
} from "src/domain/helpers";
import { getLocalizedLabel } from "src/domain/translation";
import { truthy } from "src/lib/truthy";

import { LEFT_MARGIN_OFFSET } from "../constants";
import { useChartTheme } from "../use-chart-theme";

const roundDomain = (scale: ScaleLinear<number, number>) => {
  const d = scale.domain();
  return scale.domain([Math.floor(d[0]), Math.ceil(d[1])]);
};

const useLinesState = ({
  data,
  fields,
  aspectRatio,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  fields: LineFields;
  aspectRatio: number;
}): LinesState => {
  const { labelFontSize } = useChartTheme();
  const width = useWidth();

  const formatCurrency = useFormatCurrency();
  const formatDateAuto = useFormatFullDateAuto();

  const getGroups = (d: GenericObservation): string =>
    d[fields.x.componentIri] as string;
  const getX = useCallback(
    (d: GenericObservation): Date | undefined => {
      const value = d[fields.x.componentIri];
      return value ? parseDate(value.toString()) : undefined;
    },
    [fields.x.componentIri]
  );
  const getY = (d: GenericObservation): number | undefined => {
    const value = d[fields.y.componentIri];
    return value === null ? undefined : (+value as number);
  };

  const getSegment = useCallback(
    (d: GenericObservation): string =>
      fields.segment && fields.segment.componentIri
        ? (d[fields.segment.componentIri] as string)
        : "segment",
    [fields.segment]
  );
  const getColor = useCallback(
    (d: GenericObservation): string => {
      return fields.style && fields.style.colorAcc
        ? (d[fields.style.colorAcc] as string)
        : "municipalityLabel";
    },
    [fields.style]
  );

  const sortedData = useMemo(
    () => [...data].sort((a, b) => ascending(getX(a), getX(b))),
    [data, getX]
  );

  const xUniqueValues = sortedData
    .map((d) => getX(d))
    .filter(
      (date, i, self) =>
        self.findIndex((d) => d?.getTime() === date?.getTime()) === i
    )
    .filter(truthy);

  const xDomain = extent(sortedData, (d) => getX(d)) as [Date, Date];
  const xScale = scaleTime().domain(xDomain);

  const xAxisLabel = fields.x.axisLabel;
  const yAxisLabel = fields.y.axisLabel;

  const minValue = min(sortedData, getY) || 0;
  const maxValue = max(sortedData, getY) as number;
  const yDomain = [minValue, maxValue];

  const yScale = roundDomain(scaleLinear().domain(yDomain).nice(4));

  const segments = [...new Set(sortedData.map(getSegment))];

  const colorDomain = fields.style?.colorDomain ?? [""];

  const paletteColors = getPalette(fields.segment?.palette);

  const defaultMapping: Record<string, string> = {};
  colorDomain.forEach((domainItem, index) => {
    defaultMapping[domainItem] = paletteColors[index % paletteColors.length];
  });

  const colorMapping = fields.segment?.colorMapping ?? {};
  const mergedMapping: Record<string, string> = {
    ...defaultMapping,
    ...colorMapping,
  };

  // 5. Create final color scale
  const colors = scaleOrdinal<string, string>();
  colors.domain(colorDomain);
  colors.range(colorDomain.map((domainItem) => mergedMapping[domainItem]));
  const xKey = fields.x.componentIri;

  const grouped = [...group(sortedData, getSegment)];

  // Mutates dataset to make sure all x values
  // match a data point (to avoid straight lines between defined data points.)
  grouped.map((lineData) => {
    xUniqueValues.map((xValue) => {
      const thisYear = lineData[1].find(
        (d) => xValue && getX(d)?.getFullYear() === xValue?.getFullYear()
      );

      if (!thisYear && xValue) {
        lineData[1].push({
          [fields.x.componentIri]: `${xValue.getFullYear()}`,
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

  const maxYLabelWidth = useMemo(() => {
    return Math.max(
      ...yScale.ticks().map((label) =>
        getTextWidth(label.toString(), {
          fontSize: labelFontSize,
        })
      )
    );
  }, [yScale, labelFontSize]);

  const margins = {
    top: 50,
    right: 40,
    bottom: 40,
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
  yScale.range([chartHeight, 0]);

  // Grouped by x (for mouse interaction on x)
  const groupedMap = group(sortedData, getGroups);
  const wide = [];

  for (const [key, values] of groupedMap) {
    const keyObject = Object.fromEntries(
      values
        .map((cur) => {
          const yValue = getY(cur);
          if (yValue === undefined) return null;
          return [getSegment(cur), yValue] as const;
        })
        .filter(truthy)
    );
    wide.push({
      ...keyObject,
      [xKey]: key,
    });
  }

  const entity = fields.style?.entity || "";

  const getAnnotationInfo = (datum: GenericObservation): Tooltip => {
    const xValue = getX(datum);
    const yValue = getY(datum);
    if (!xValue || !yValue) {
      return {
        xAnchor: 0,
        yAnchor: 0,
        placement: { x: "right", y: "middle" },
        xValue: "",
        datum: { label: "", value: "" },
        values: [],
      };
    }
    const xAnchor = xScale(xValue);
    const yAnchor = yScale(yValue);

    const tooltipValues = data.filter(
      (j) => getX(j)?.getTime() === xValue.getTime()
    );
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

    const xPlacement = xAnchor < chartWidth * 0.5 ? "right" : "left";
    const yPlacement = "middle";

    return {
      xAnchor,
      yAnchor,
      placement: { x: xPlacement, y: yPlacement },
      xValue: formatDateAuto(xValue),
      datum: {
        label: fields.segment && getSegment(datum),
        value: `${formatCurrency(yValue)} ${yAxisLabel ? yAxisLabel : ""}`,
      },
      values: summarizedTooltipValues
        .filter((td) => getY(td) !== undefined)
        .sort((a, b) => descending(getY(a), getY(b)))
        .map((td) => {
          // Check non-null assertion: getY(td) is filtered above
          const yValue = getY(td)!;
          return {
            symbol: "line",
            label: getSegment(td),
            value: `${formatCurrency(yValue)} ${yAxisLabel ? yAxisLabel : ""}`,
            color: colors(getColor(td)) as string,
            yPos: yScale(yValue),
          };
        }),
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
    yAxisLabel,
    xAxisLabel,
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
