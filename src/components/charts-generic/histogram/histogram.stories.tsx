import { useLingui } from "@lingui/react";
import { Box, Button, Typography } from "@mui/material";
import {
  bisector,
  Delaunay,
  groups,
  max,
  median as d3Median,
  min,
  pointer,
  scaleLog,
  scaleSqrt,
} from "d3";
import { useRef, useState } from "react";

import { ColorLegend } from "src/components/color-legend";
import { getPalette } from "src/domain/helpers";
import { RP_PER_KWH } from "src/domain/metrics";
import { data as priceDistribution2027 } from "src/mocks/graphql/price-distribution-2027-h4/Observations";
import operationalStandards from "src/mocks/sunshine-operationalStandards-426.json";
import serviceQualityMock from "src/mocks/sunshine-operationalStandards-serviceQuality-mock.json";
import { palette as themePalette } from "src/themes/palette";

import { AnnotationX, AnnotationXLabel } from "../annotation/annotation-x";
import { AxisHeightLinear } from "../axis/axis-height-linear";
import {
  AxisWidthHistogram,
  AxisWidthHistogramDomain,
} from "../axis/axis-width-histogram";
import { ChartContainer, ChartSvg } from "../containers";
import { Tooltip } from "../interaction/tooltip";
import { TooltipBoxPositioned } from "../interaction/tooltip-box";
import { LegendItem } from "../legends/color";
import { InteractionHistogram } from "../overlay/interaction-histogram";
import { HistogramState, useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";

import { HistogramColumns } from "./histogram";
import { HistogramMinMaxValues } from "./histogram-min-max-values";
import { Histogram as HistogramComponent } from "./histogram-state";
import { HistogramMedian } from "./median";
import { mockData } from "./mock";

import type { Meta } from "@storybook/react";

const meta: Meta<typeof HistogramComponent> = {
  title: "Charts/Histogram",
  component: HistogramComponent,
};

export default meta;

export const Histogram = () => {
  const medianValue = 20;
  const annotations = [mockData[0], mockData[1], mockData[2]];
  const { i18n } = useLingui();
  return (
    <Box width="100%" maxWidth="800px" m={5}>
      <HistogramComponent
        data={mockData}
        medianValue={medianValue}
        aspectRatio={0.3}
        fields={{
          x: {
            componentIri: "value",
            axisLabel: "Price",
            axisUnit: i18n._(RP_PER_KWH),
          },
          y: {
            axisLabel: "Number of municipalities",
          },
          label: {
            componentIri: "muniOperator",
          },
          annotation: annotations,
        }}
        measures={[
          {
            iri: "value",
            label: "Price value",
            __typename: "Measure",
          },
        ]}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear />
            <HistogramMinMaxValues />
            <AnnotationX />
            <HistogramColumns />
            <HistogramMedian label="CH Median" />
            <AxisWidthHistogramDomain />
            <InteractionHistogram />
          </ChartSvg>
          <Tooltip type="single" />
          <AnnotationXLabel />
        </ChartContainer>
      </HistogramComponent>
    </Box>
  );
};

export const GroupedHistogram = () => {
  const operatorId =
    operationalStandards.serviceQuality.operatorsNotificationPeriodDays[0]
      .operatorId;
  const operatorLabel = `Operator ${operatorId}`;
  const median = d3Median(serviceQualityMock, (d: { days: number }) => d.days);
  return (
    <Box width="100%" maxWidth="800px" m={5} position="relative">
      <HistogramComponent
        data={serviceQualityMock}
        medianValue={median}
        aspectRatio={0.3}
        groupedBy={5}
        fields={{
          x: { componentIri: "days", axisLabel: "Days", axisUnit: "Days" },
          y: { axisLabel: "Share of operators", asPercentage: true },
          label: { componentIri: "label" },
          style: {
            palette: "elcom-categorical-2",
          },
          annotation: [
            {
              label: operatorLabel,
              days:
                serviceQualityMock.find(
                  (o: { operatorId: string }) => o.operatorId === operatorId
                )?.days ?? 0,
            },
          ],
        }}
        measures={[
          {
            iri: "days",
            label: "Notification period (days)",
            __typename: "Measure",
          },
        ]}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear percentage />
            <HistogramColumns />
            <AnnotationX />
            <HistogramMedian label="CH Median" />
            <AxisWidthHistogram />
            <InteractionHistogram />
          </ChartSvg>
          <AnnotationXLabel />
        </ChartContainer>
        <Tooltip type="single" />
      </HistogramComponent>
    </Box>
  );
};

const operatorGroups = mockData.filter((_, i) => i % 20 < 3);
const operators = [...new Set(operatorGroups.map((d) => d.operatorLabel))];
const operatorGroupsByValue = [...operatorGroups].sort(
  (a, b) => a.value - b.value
);
const operatorColor = (operator: string) =>
  getPalette("elcom")[operators.indexOf(operator)];

type OperatorGroup = (typeof operatorGroups)[number];

// One line per price group in the color of its operator
const OperatorLines = ({ hovered }: { hovered: OperatorGroup | null }) => {
  const { xScale, yScale, bounds } = useChartState() as HistogramState;
  const { margins } = bounds;
  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {operatorGroups.map((d) => {
        const x = xScale(d.value);
        return (
          <g key={d.muniOperator}>
            <line
              x1={x}
              x2={x}
              y1={0}
              y2={yScale(0)}
              stroke={operatorColor(d.operatorLabel)}
              strokeWidth={hovered === d ? 4 : 2}
            />
          </g>
        );
      })}
    </g>
  );
};

// Hovers the line closest to the mouse horizontally, like the tariffs development chart
const OperatorLinesInteraction = ({
  onHover,
}: {
  onHover: (d: OperatorGroup | null) => void;
}) => {
  const ref = useRef<SVGGElement>(null);
  const { xScale, bounds } = useChartState() as HistogramState;
  const { chartWidth, chartHeight, margins } = bounds;
  const findLine = (e: React.PointerEvent) => {
    const [x] = pointer(e, ref.current);
    const index = bisector((d: OperatorGroup) => d.value).center(
      operatorGroupsByValue,
      xScale.invert(x)
    );
    onHover(operatorGroupsByValue[index]);
  };
  return (
    <g ref={ref} transform={`translate(${margins.left} ${margins.top})`}>
      <rect
        width={chartWidth}
        height={chartHeight}
        fill="none"
        pointerEvents="all"
        onPointerMove={findLine}
        onPointerLeave={() => onHover(null)}
      />
    </g>
  );
};

const OperatorLineTooltip = ({
  hovered,
  y = 0,
}: {
  hovered: OperatorGroup | null;
  y?: number;
}) => {
  const { xScale, bounds } = useChartState() as HistogramState;
  const { i18n } = useLingui();
  if (!hovered) {
    return null;
  }
  return (
    <TooltipBoxPositioned
      x={xScale(hovered.value)}
      y={y}
      placement={{ x: "center", y: "top" }}
      margins={bounds.margins}
    >
      <Typography variant="caption">
        <Box component="span" fontWeight={700}>
          {hovered.value.toFixed(2)} {i18n._(RP_PER_KWH)}
        </Box>{" "}
        {hovered.municipalityLabel}
      </Typography>
    </TooltipBoxPositioned>
  );
};

const DOT_RADIUS = 6;

// One black line per price group, with a dot in the operator color just above its bar that moves up when it would overlap
const OperatorDotLines = ({ hovered }: { hovered: OperatorGroup | null }) => {
  const { bins, getY, xScale, yScale, bounds } =
    useChartState() as HistogramState;
  const { annotationColor } = useChartTheme();
  const { margins } = bounds;
  const placed: { x: number; y: number }[] = [];
  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {operatorGroupsByValue.map((d) => {
        const x = xScale(d.value);
        const bin = bins.find(
          (b) => d.value >= (b.x0 ?? 0) && d.value < (b.x1 ?? 0)
        );
        let y = yScale(bin ? getY(bin) : 0) - DOT_RADIUS - 8;
        while (
          placed.some((p) => Math.hypot(p.x - x, p.y - y) < DOT_RADIUS * 2 + 2)
        ) {
          y -= DOT_RADIUS * 2 + 2;
        }
        placed.push({ x, y });
        return (
          <g key={d.muniOperator}>
            <line
              x1={x}
              x2={x}
              y1={y}
              y2={yScale(0)}
              stroke={annotationColor}
              strokeWidth={hovered === d ? 2 : 1}
            />
            <circle
              cx={x}
              cy={y}
              r={DOT_RADIUS}
              fill={operatorColor(d.operatorLabel)}
              stroke="white"
            />
          </g>
        );
      })}
    </g>
  );
};

// Price distribution with black lines and a dot in the operator color, like the compare-with chips
export const PriceDistributionDots = () => {
  const { i18n } = useLingui();
  const [hovered, setHovered] = useState<OperatorGroup | null>(null);
  return (
    <Box width="100%" maxWidth="800px" m={5}>
      <Box
        display="flex"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={3}
        mb={5}
      >
        <Box display="flex" flexWrap="wrap" gap={1}>
          {operators.map((operator) => (
            <LegendItem
              key={operator}
              item={operator}
              color={operatorColor(operator)}
              symbol="circle"
            />
          ))}
        </Box>
        <ColorLegend />
      </Box>
      <HistogramComponent
        data={mockData}
        medianValue={20}
        aspectRatio={0.3}
        fields={{
          x: {
            componentIri: "value",
            axisUnit: i18n._(RP_PER_KWH),
          },
          y: {
            axisLabel: "Number of municipalities",
          },
          label: {
            componentIri: "muniOperator",
          },
        }}
        measures={[
          {
            iri: "value",
            label: "value",
            __typename: "Measure",
          },
        ]}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear />
            <AxisWidthHistogramDomain />
            <HistogramColumns />
            <HistogramMedian label="CH Median" />
            <HistogramMinMaxValues />
            <OperatorDotLines hovered={hovered} />
            <OperatorLinesInteraction onHover={setHovered} />
          </ChartSvg>
          <OperatorLineTooltip hovered={hovered} />
        </ChartContainer>
      </HistogramComponent>
    </Box>
  );
};

// Price distribution with one color per operator, like the compare-with chips
export const PriceDistributionOperators = () => {
  const { i18n } = useLingui();
  const [hovered, setHovered] = useState<OperatorGroup | null>(null);
  return (
    <Box width="100%" maxWidth="800px" m={5}>
      <Box
        display="flex"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={3}
        mb={5}
      >
        <Box display="flex" flexWrap="wrap" gap={1}>
          {operators.map((operator) => (
            <LegendItem
              key={operator}
              item={operator}
              color={operatorColor(operator)}
              symbol="square"
            />
          ))}
        </Box>
        <ColorLegend colorOpacity={0.75} />
      </Box>
      <HistogramComponent
        data={mockData}
        medianValue={20}
        aspectRatio={0.3}
        fields={{
          x: {
            componentIri: "value",
            axisUnit: i18n._(RP_PER_KWH),
          },
          y: {
            axisLabel: "Number of municipalities",
          },
          label: {
            componentIri: "muniOperator",
          },
        }}
        measures={[
          {
            iri: "value",
            label: "value",
            __typename: "Measure",
          },
        ]}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear />
            <AxisWidthHistogramDomain />
            <g opacity={0.75}>
              <HistogramColumns />
            </g>
            <HistogramMedian label="CH Median" />
            <HistogramMinMaxValues />
            <OperatorLines hovered={hovered} />
            <OperatorLinesInteraction onHover={setHovered} />
          </ChartSvg>
          <OperatorLineTooltip hovered={hovered} />
        </ChartContainer>
      </HistogramComponent>
    </Box>
  );
};

const numberedGroups = [...mockData.slice(0, 15)].sort(
  (a, b) => a.value - b.value
);

const NUMBER_DOT_RADIUS = 8;
const NUMBER_DOT_ROW_HEIGHT = NUMBER_DOT_RADIUS * 2 + 2;

type NumberColor = "white" | "dark";

const NumberDot = ({
  x,
  y,
  number,
  color,
  numberColor,
}: {
  x: number;
  y: number;
  number: number;
  color: string;
  numberColor: NumberColor;
}) => (
  <g>
    <circle cx={x} cy={y} r={NUMBER_DOT_RADIUS} fill={color} stroke="white" />
    <text
      x={x}
      y={y}
      dy="0.35em"
      textAnchor="middle"
      fontSize={10}
      fontWeight={700}
      fill={numberColor === "dark" ? "black" : "white"}
    >
      {number}
    </text>
  </g>
);

// One line per price group, with a numbered dot just above its bar that moves up when it would overlap
const NumberedLines = ({ numberColor }: { numberColor: NumberColor }) => {
  const { bins, getY, xScale, yScale, bounds, colors } =
    useChartState() as HistogramState;
  const { annotationLineColor } = useChartTheme();
  const { margins } = bounds;
  const placed: { x: number; y: number }[] = [];
  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {numberedGroups.map((d, i) => {
        const x = xScale(d.value);
        const bin = bins.find(
          (b) => d.value >= (b.x0 ?? 0) && d.value < (b.x1 ?? 0)
        );
        let y = yScale(bin ? getY(bin) : 0) - NUMBER_DOT_RADIUS - 8;
        while (
          placed.some(
            (p) => Math.hypot(p.x - x, p.y - y) < NUMBER_DOT_RADIUS * 2 + 2
          )
        ) {
          y -= NUMBER_DOT_ROW_HEIGHT;
        }
        placed.push({ x, y });
        return (
          <g key={d.muniOperator}>
            <line
              x1={x}
              x2={x}
              y1={y}
              y2={yScale(0)}
              stroke={annotationLineColor}
            />
            <NumberDot
              x={x}
              y={y}
              number={i + 1}
              color={colors(d.value)}
              numberColor={numberColor}
            />
          </g>
        );
      })}
    </g>
  );
};

// Numbered list in the same colors as the dots in the chart
const NumberedList = ({ numberColor }: { numberColor: NumberColor }) => {
  const { colors } = useChartState() as HistogramState;
  const { i18n } = useLingui();
  return (
    <Box
      component="ol"
      m={0}
      mb={8}
      pl={0}
      display="grid"
      columnGap={8}
      sx={{
        listStyle: "none",
        gridTemplateRows: { xxs: "none", md: "repeat(10, auto)" },
        gridAutoFlow: { xxs: "row", md: "column" },
        justifyContent: "start",
      }}
    >
      {numberedGroups.map((d, i) => (
        <Typography
          key={d.muniOperator}
          component="li"
          variant="caption"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <svg width={NUMBER_DOT_RADIUS * 2} height={NUMBER_DOT_RADIUS * 2}>
            <NumberDot
              x={NUMBER_DOT_RADIUS}
              y={NUMBER_DOT_RADIUS}
              number={i + 1}
              color={colors(d.value)}
              numberColor={numberColor}
            />
          </svg>
          <span>
            <Box component="span" fontWeight={700}>
              {d.value.toFixed(2)} {i18n._(RP_PER_KWH)}
            </Box>{" "}
            {d.muniOperator}
          </span>
        </Typography>
      ))}
    </Box>
  );
};

// Price distribution with a numbered list above the chart and numbered dots on the lines
export const PriceDistributionNumbered = ({
  numberColor,
}: {
  numberColor: NumberColor;
}) => {
  const { i18n } = useLingui();
  return (
    <Box width="100%" maxWidth="800px" m={5}>
      <Box display="flex" justifyContent="flex-start" mb={5}>
        <ColorLegend />
      </Box>
      <HistogramComponent
        data={mockData}
        medianValue={20}
        aspectRatio={0.3}
        fields={{
          x: {
            componentIri: "value",
            axisUnit: i18n._(RP_PER_KWH),
          },
          y: {
            axisLabel: "Number of municipalities",
          },
          label: {
            componentIri: "muniOperator",
          },
        }}
        measures={[
          {
            iri: "value",
            label: "value",
            __typename: "Measure",
          },
        ]}
      >
        <NumberedList numberColor={numberColor} />
        <ChartContainer>
          <ChartSvg style={{ overflow: "visible" }}>
            <AxisHeightLinear />
            <AxisWidthHistogramDomain />
            <HistogramColumns />
            <HistogramMedian label="CH Median" />
            <HistogramMinMaxValues />
            <NumberedLines numberColor={numberColor} />
            <InteractionHistogram />
          </ChartSvg>
          <Tooltip type="single" />
        </ChartContainer>
      </HistogramComponent>
    </Box>
  );
};

PriceDistributionNumbered.args = { numberColor: "white" };
PriceDistributionNumbered.argTypes = {
  numberColor: { control: "inline-radio", options: ["white", "dark"] },
};

const overlayOperators = ["BKW Energie AG", "EWS Energie AG"];
const overlayColor = (operator: string) =>
  getPalette("elcom")[overlayOperators.indexOf(operator)];

// Real 2027 H4 standard prices of all Swiss municipalities
const overlayData = (priceDistribution2027.observations ?? []).map((d) => ({
  ...d,
  muniOperator: `${d.municipalityLabel}, ${d.operatorLabel}`,
}));
const overlayMedian = priceDistribution2027.swissMedianObservations?.[0]?.value;

type PriceGroup = {
  key: string;
  value: number;
  operatorLabel: string;
  municipalityLabel: string;
  count: number;
};

// Municipalities of the selected operators with the same price, like the labels of the real chart
const priceGroups: PriceGroup[] = overlayOperators.flatMap((operator) =>
  groups(
    overlayData.filter((d) => d.operatorLabel === operator),
    (d) => d.value
  ).map(([value, municipalities]) => ({
    key: `${operator}-${value}`,
    value: value as number,
    operatorLabel: operator,
    municipalityLabel: municipalities[0].municipalityLabel ?? "",
    count: municipalities.length,
  }))
);
const priceGroupsByValue = [...priceGroups].sort((a, b) => a.value - b.value);

const SWARM_DOT_RADIUS = 5;
const SWARM_DOT_GAP = 2;
const counts = priceGroups.map((d) => d.count);
const countDomain = [min(counts) ?? 1, max(counts) ?? 1];
const dotRadiusScales = {
  sqrt: scaleSqrt().domain(countDomain).range([4, 16]),
  log: scaleLog().domain(countDomain).range([4, 16]),
};
const ROW_GAP = 14;
const LABEL_ROW_HEIGHT = 30;
const MEDIAN_TICK_DISTANCE = 20;

type BeeswarmOptions = {
  layout: BeeswarmLayout;
  dotSize: DotSize;
};

type DotSize = "fixed" | "sqrt" | "log";

type BeeswarmLayout =
  | "dots-ticks-labels"
  | "ticks-dots-labels"
  | "ticks-labels-dots";

// Dots stacked downwards when they would overlap, with y relative to the top of the dot area
const useBeeswarmDots = (dotSize: DotSize) => {
  const { xScale } = useChartState() as HistogramState;
  const placed: { d: PriceGroup; x: number; y: number; r: number }[] = [];
  const largestFirst = [...priceGroupsByValue].sort(
    (a, b) => (dotSize !== "fixed" ? b.count - a.count : 0) || a.value - b.value
  );
  largestFirst.forEach((d) => {
    const x = xScale(d.value);
    const r =
      dotSize === "fixed"
        ? SWARM_DOT_RADIUS
        : dotRadiusScales[dotSize](d.count);
    let y = r;
    while (
      placed.some((p) => Math.hypot(p.x - x, p.y - y) < p.r + r + SWARM_DOT_GAP)
    ) {
      y += 1;
    }
    placed.push({ d, x, y, r });
  });
  const height = Math.max(...placed.map((p) => p.y + p.r));
  return { dots: placed, height };
};

// Positions of the rows below the x-axis for each layout
const useBeeswarmRows = ({ layout, dotSize }: BeeswarmOptions) => {
  const { bounds } = useChartState() as HistogramState;
  const { labelFontSize } = useChartTheme();
  const { dots, height } = useBeeswarmDots(dotSize);
  const axisY = bounds.chartHeight;
  let dotsTop: number;
  let tickRowY: number;
  let labelRowY: number;
  if (layout === "dots-ticks-labels") {
    dotsTop = axisY + 6;
    tickRowY = dotsTop + height + ROW_GAP;
    labelRowY = tickRowY + ROW_GAP + labelFontSize;
  } else if (layout === "ticks-dots-labels") {
    tickRowY = axisY + ROW_GAP;
    dotsTop = tickRowY + 6;
    labelRowY = dotsTop + height + ROW_GAP + labelFontSize;
  } else {
    tickRowY = axisY + ROW_GAP;
    labelRowY = tickRowY + ROW_GAP + labelFontSize;
    dotsTop = labelRowY + LABEL_ROW_HEIGHT;
  }
  return {
    dots: dots.map((p) => ({ ...p, y: p.y + dotsTop })),
    dotsBottom: dotsTop + height,
    tickRowY,
    labelRowY,
  };
};

const BeeswarmDots = ({ options }: { options: BeeswarmOptions }) => {
  const { bounds } = useChartState() as HistogramState;
  const { annotationLineColor } = useChartTheme();
  const { dots } = useBeeswarmRows(options);
  const { margins, chartHeight } = bounds;
  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {dots.map(({ d, x, y, r }) => (
        <g key={d.key}>
          <line
            x1={x}
            x2={x}
            y1={chartHeight}
            y2={y}
            stroke={annotationLineColor}
            strokeOpacity={0.2}
          />
          <circle
            cx={x}
            cy={y}
            r={r}
            fill={overlayColor(d.operatorLabel)}
            stroke="white"
          />
        </g>
      ))}
    </g>
  );
};

const BeeswarmTicks = ({
  options,
  tickStep = 5,
}: {
  options: BeeswarmOptions;
  tickStep?: number;
}) => {
  const { data, getX, xScale, bounds, medianValue } =
    useChartState() as HistogramState;
  const { domainColor, labelColor, fontFamily } = useChartTheme();
  const { tickRowY } = useBeeswarmRows(options);
  const { margins, chartHeight } = bounds;
  const minValue = min(data, getX) ?? 0;
  const maxValue = max(data, getX) ?? 0;
  const ticks = xScale
    .ticks(5)
    .filter(
      (t) =>
        t % tickStep === 0 &&
        t > minValue &&
        t < maxValue &&
        (medianValue === undefined ||
          Math.abs(xScale(t) - xScale(medianValue)) > MEDIAN_TICK_DISTANCE)
    );
  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={xScale(t)}
            x2={xScale(t)}
            y1={chartHeight}
            y2={chartHeight + 4}
            stroke={domainColor}
          />
          <text
            x={xScale(t)}
            y={tickRowY}
            textAnchor="middle"
            stroke="white"
            strokeWidth={3}
            strokeLinejoin="round"
            paintOrder="stroke"
            style={{ fontFamily, fontSize: 10, fill: labelColor }}
          >
            {t}
          </text>
        </g>
      ))}
    </g>
  );
};

const BeeswarmMedian = ({ options }: { options: BeeswarmOptions }) => {
  const { bounds } = useChartState() as HistogramState;
  const { labelFontSize } = useChartTheme();
  const { labelRowY } = useBeeswarmRows(options);
  return (
    <HistogramMedian
      label="CH Median"
      labelOffset={
        labelRowY -
        labelFontSize -
        bounds.chartHeight -
        bounds.margins.bottom * 0.5
      }
    />
  );
};

// Hovers the dot closest to the mouse (Voronoi), only within the dot area
const BeeswarmInteraction = ({
  options,
  onHover,
}: {
  options: BeeswarmOptions;
  onHover: (d: PriceGroup | null) => void;
}) => {
  const ref = useRef<SVGGElement>(null);
  const { bounds } = useChartState() as HistogramState;
  const { dots, dotsBottom } = useBeeswarmRows(options);
  const { chartWidth, margins } = bounds;
  const dotsTop = Math.min(...dots.map((p) => p.y - p.r));
  const delaunay = Delaunay.from(
    dots,
    (p) => p.x,
    (p) => p.y
  );
  const findDot = (e: React.PointerEvent) => {
    const [x, y] = pointer(e, ref.current);
    onHover(dots[delaunay.find(x, y)]?.d ?? null);
  };
  return (
    <g ref={ref} transform={`translate(${margins.left} ${margins.top})`}>
      <rect
        y={dotsTop}
        width={chartWidth}
        height={dotsBottom - dotsTop}
        fill="none"
        pointerEvents="all"
        onPointerMove={findDot}
        onPointerLeave={() => onHover(null)}
      />
    </g>
  );
};

const BeeswarmTooltip = ({
  options,
  hovered,
}: {
  options: BeeswarmOptions;
  hovered: PriceGroup | null;
}) => {
  const { bounds } = useChartState() as HistogramState;
  const { i18n } = useLingui();
  const { dots } = useBeeswarmRows(options);
  const dot = dots.find((p) => p.d === hovered);
  if (!hovered || !dot) {
    return null;
  }
  return (
    <TooltipBoxPositioned
      x={dot.x}
      y={dot.y - dot.r}
      placement={{ x: "center", y: "top" }}
      margins={bounds.margins}
    >
      <Typography variant="caption">
        <Box component="span" fontWeight={700}>
          {hovered.value.toFixed(2)} {i18n._(RP_PER_KWH)}
        </Box>{" "}
        {hovered.operatorLabel},{" "}
        {hovered.count > 1
          ? `${hovered.count} municipalities`
          : hovered.municipalityLabel}
      </Typography>
    </TooltipBoxPositioned>
  );
};

const PriceGroupLegend = () => (
  <Box display="flex" flexWrap="wrap" gap={1}>
    {overlayOperators.map((operator) => (
      <LegendItem
        key={operator}
        item={operator}
        color={overlayColor(operator)}
        symbol="circle"
      />
    ))}
  </Box>
);

const realDataFields = (axisUnit: string) => ({
  x: {
    componentIri: "value",
    axisUnit,
  },
  y: {
    axisLabel: "Number of municipalities",
  },
  label: {
    componentIri: "muniOperator",
  },
});

const realDataMeasures = [
  {
    iri: "value",
    label: "value",
    __typename: "Measure" as const,
  },
];

// Price distribution with the price groups as a beeswarm of operator-colored dots below the x-axis
export const PriceDistributionBeeswarm = (options: BeeswarmOptions) => {
  const { i18n } = useLingui();
  const [hovered, setHovered] = useState<PriceGroup | null>(null);
  return (
    <Box width="100%" maxWidth="800px" m={5} mb={30}>
      <Box
        display="flex"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={3}
        mb={5}
      >
        <PriceGroupLegend />
        <ColorLegend />
      </Box>
      <HistogramComponent
        data={overlayData}
        medianValue={overlayMedian}
        aspectRatio={0.3}
        fields={realDataFields(i18n._(RP_PER_KWH))}
        measures={realDataMeasures}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear />
            <AxisWidthHistogramDomain />
            <HistogramColumns />
            <BeeswarmDots options={options} />
            <BeeswarmMedian options={options} />
            <HistogramMinMaxValues />
            <BeeswarmTicks options={options} />
            <InteractionHistogram />
            <BeeswarmInteraction options={options} onHover={setHovered} />
          </ChartSvg>
          <Tooltip type="single" />
          <BeeswarmTooltip options={options} hovered={hovered} />
        </ChartContainer>
      </HistogramComponent>
    </Box>
  );
};

PriceDistributionBeeswarm.args = {
  layout: "ticks-dots-labels",
  dotSize: "fixed",
};
PriceDistributionBeeswarm.argTypes = {
  layout: {
    control: "inline-radio",
    options: ["ticks-dots-labels", "dots-ticks-labels", "ticks-labels-dots"],
  },
  dotSize: { control: "inline-radio", options: ["fixed", "sqrt", "log"] },
};

type SwissColors = "gray" | "price";

// Swiss bars in one gray, at the same positions as HistogramColumns
const GraySwissColumns = () => {
  const { bins, xScale, yScale, bounds } = useChartState() as HistogramState;
  const { margins } = bounds;
  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {bins.map((d, i) =>
        d.x0 !== undefined && d.x1 !== undefined ? (
          <rect
            key={i}
            x={xScale(d.x0) + 1}
            width={Math.max(0, xScale(d.x1) - xScale(d.x0) - 1)}
            y={yScale(d.length)}
            height={Math.abs(yScale(d.length) - yScale(0))}
            fill={themePalette.monochrome[200]}
          />
        ) : null
      )}
    </g>
  );
};

type OperatorRange = {
  x0: number;
  x1: number;
  x: number;
  y: number;
  counts: { operator: string; count: number }[];
};

// Price ranges that contain municipalities of the selected operators
const useOperatorRanges = () => {
  const { bins, xScale, yScale } = useChartState() as HistogramState;
  return bins.flatMap((bin): OperatorRange[] => {
    const { x0, x1 } = bin;
    if (x0 === undefined || x1 === undefined) {
      return [];
    }
    const counts = overlayOperators
      .map((operator) => ({
        operator,
        count: bin.filter((d) => d.operatorLabel === operator).length,
      }))
      .filter((c) => c.count > 0);
    const total = counts.reduce((sum, c) => sum + c.count, 0);
    return total > 0
      ? [{ x0, x1, x: xScale((x0 + x1) / 2), y: yScale(total), counts }]
      : [];
  });
};

// Municipalities of the selected operators per price range, stacked in the operator colors
const OperatorColumns = () => {
  const { xScale, yScale, bounds } = useChartState() as HistogramState;
  const ranges = useOperatorRanges();
  const { margins } = bounds;
  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {ranges.map(({ x0, x1, counts }) => {
        let stacked = 0;
        return (
          <g key={x0}>
            {counts.map(({ operator, count }) => {
              const y0 = stacked;
              stacked += count;
              return (
                <rect
                  key={operator}
                  x={xScale(x0) + 1}
                  width={Math.max(0, xScale(x1) - xScale(x0) - 1)}
                  y={yScale(stacked)}
                  height={yScale(y0) - yScale(stacked)}
                  fill={overlayColor(operator)}
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

// Hovers the operator price range closest to the mouse horizontally
const OperatorRangesInteraction = ({
  onHover,
}: {
  onHover: (range: OperatorRange | null) => void;
}) => {
  const ref = useRef<SVGGElement>(null);
  const { bounds } = useChartState() as HistogramState;
  const ranges = useOperatorRanges();
  const { chartWidth, chartHeight, margins } = bounds;
  const findRange = (e: React.PointerEvent) => {
    const [x] = pointer(e, ref.current);
    const closest = ranges.reduce<OperatorRange | null>(
      (best, r) =>
        !best || Math.abs(r.x - x) < Math.abs(best.x - x) ? r : best,
      null
    );
    onHover(closest);
  };
  return (
    <g ref={ref} transform={`translate(${margins.left} ${margins.top})`}>
      <rect
        width={chartWidth}
        height={chartHeight}
        fill="none"
        pointerEvents="all"
        onPointerMove={findRange}
        onPointerLeave={() => onHover(null)}
      />
    </g>
  );
};

const OperatorRangeTooltip = ({ range }: { range: OperatorRange | null }) => {
  const { bounds } = useChartState() as HistogramState;
  const { i18n } = useLingui();
  if (!range) {
    return null;
  }
  return (
    <TooltipBoxPositioned
      x={range.x}
      y={range.y}
      placement={{ x: "center", y: "top" }}
      margins={bounds.margins}
    >
      <Typography variant="caption" fontWeight={700} display="block">
        {range.x0}–{range.x1} {i18n._(RP_PER_KWH)}
      </Typography>
      {range.counts.map(({ operator, count }) => (
        <Box key={operator} display="flex" alignItems="center" gap={1}>
          <Box width={8} height={8} bgcolor={overlayColor(operator)} />
          <Typography variant="caption">
            {operator}, {count} municipalities
          </Typography>
        </Box>
      ))}
    </TooltipBoxPositioned>
  );
};

const overlayDotsOptions: BeeswarmOptions = {
  layout: "ticks-dots-labels",
  dotSize: "sqrt",
};

// Price distribution with the Swiss histogram in the background and the selected operators on top
export const PriceDistributionOverlay = ({
  swissColors,
  showDots,
}: {
  swissColors: SwissColors;
  showDots: boolean;
}) => {
  const { i18n } = useLingui();
  const [hovered, setHovered] = useState<OperatorRange | null>(null);
  const [hoveredDot, setHoveredDot] = useState<PriceGroup | null>(null);
  return (
    <Box width="100%" maxWidth="800px" m={5} mb={showDots ? 30 : 5}>
      <Box
        display="flex"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={3}
        mb={5}
      >
        <Box display="flex" flexWrap="wrap" gap={1}>
          {overlayOperators.map((operator) => (
            <LegendItem
              key={operator}
              item={operator}
              color={overlayColor(operator)}
              symbol="square"
            />
          ))}
          {swissColors === "gray" && (
            <LegendItem
              item="Switzerland"
              color={themePalette.monochrome[200]}
              symbol="square"
            />
          )}
        </Box>
        {swissColors === "price" && <ColorLegend />}
      </Box>
      <HistogramComponent
        data={overlayData}
        medianValue={overlayMedian}
        aspectRatio={0.3}
        fields={realDataFields(i18n._(RP_PER_KWH))}
        measures={realDataMeasures}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear />
            <AxisWidthHistogramDomain />
            {swissColors === "gray" ? (
              <GraySwissColumns />
            ) : (
              <HistogramColumns />
            )}
            <OperatorColumns />
            {showDots ? (
              <>
                <BeeswarmDots options={overlayDotsOptions} />
                <BeeswarmMedian options={overlayDotsOptions} />
                <HistogramMinMaxValues />
                <BeeswarmTicks options={overlayDotsOptions} />
                <BeeswarmInteraction
                  options={overlayDotsOptions}
                  onHover={setHoveredDot}
                />
              </>
            ) : (
              <>
                <HistogramMedian label="CH Median" />
                <HistogramMinMaxValues />
              </>
            )}
            <OperatorRangesInteraction onHover={setHovered} />
          </ChartSvg>
          <OperatorRangeTooltip range={hovered} />
          {showDots && (
            <BeeswarmTooltip
              options={overlayDotsOptions}
              hovered={hoveredDot}
            />
          )}
        </ChartContainer>
      </HistogramComponent>
    </Box>
  );
};

PriceDistributionOverlay.args = { swissColors: "gray", showDots: false };
PriceDistributionOverlay.argTypes = {
  swissColors: { control: "inline-radio", options: ["gray", "price"] },
  showDots: { control: "boolean" },
};

const ZOOM_PADDING = 0.5;
const zoomDomain: [number, number] = [
  Math.floor(((min(priceGroups, (d) => d.value) ?? 0) - ZOOM_PADDING) * 2) / 2,
  Math.ceil(((max(priceGroups, (d) => d.value) ?? 0) + ZOOM_PADDING) * 2) / 2,
];
const zoomDotsOptions: BeeswarmOptions = {
  layout: "ticks-dots-labels",
  dotSize: "sqrt",
};

// Price distribution that can zoom the whole chart to the price range of the selected operators
export const PriceDistributionZoom = () => {
  const { i18n } = useLingui();
  const [zoomed, setZoomed] = useState(true);
  const [hovered, setHovered] = useState<PriceGroup | null>(null);
  const unit = i18n._(RP_PER_KWH);
  return (
    <Box width="100%" maxWidth="800px" m={5} mb={30}>
      <Box
        display="flex"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={3}
        mb={5}
      >
        <PriceGroupLegend />
        <ColorLegend />
      </Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Typography variant="caption">
          {zoomed
            ? `Zoomed: ${zoomDomain[0]}–${zoomDomain[1]} ${unit}`
            : "All of Switzerland"}
        </Typography>
        <Button
          size="sm"
          variant="outlined"
          onClick={() => setZoomed((z) => !z)}
        >
          {zoomed ? "Show all" : "Zoom to selected operators"}
        </Button>
      </Box>
      <HistogramComponent
        data={overlayData}
        medianValue={overlayMedian}
        aspectRatio={0.3}
        fields={realDataFields(unit)}
        measures={realDataMeasures}
        xDomain={zoomed ? zoomDomain : undefined}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear />
            <AxisWidthHistogramDomain />
            <HistogramColumns />
            <BeeswarmDots options={zoomDotsOptions} />
            <BeeswarmMedian options={zoomDotsOptions} />
            {!zoomed && <HistogramMinMaxValues />}
            <BeeswarmTicks
              options={zoomDotsOptions}
              tickStep={zoomed ? 1 : 5}
            />
            <InteractionHistogram />
            <BeeswarmInteraction
              options={zoomDotsOptions}
              onHover={setHovered}
            />
          </ChartSvg>
          <Tooltip type="single" />
          <BeeswarmTooltip options={zoomDotsOptions} hovered={hovered} />
        </ChartContainer>
      </HistogramComponent>
    </Box>
  );
};
