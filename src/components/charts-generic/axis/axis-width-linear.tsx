import { axisBottom, axisTop, NumberValue, select, Selection } from "d3";
import { useEffect, useRef } from "react";

import {
  RangePlotState,
  DotPlotState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import { useFormatCurrency } from "src/domain/helpers";
import { estimateTextWidth } from "src/lib/estimate-text-width";

export const AxisWidthLinear = ({
  position,
  format = "number",
}: {
  position: "top" | "bottom";
  format?: "number" | "currency";
}) => {
  switch (position) {
    case "top":
      return <AxisWidthLinearTop format={format} />;
    case "bottom":
      return <AxisWidthLinearBottom format={format} />;
    default: {
      const _exhaustiveCheck: never = position;
      return _exhaustiveCheck;
    }
  }
};

const AxisWidthLinearBottom = ({
  format,
}: {
  format: "number" | "currency";
}) => {
  const formatCurrency = useFormatCurrency();
  const { xScale, bounds } = useChartState() as DotPlotState | RangePlotState;
  const { chartHeight, margins } = bounds;
  const { labelColor, labelFontSize, gridColor, fontFamily } = useChartTheme();
  const xAxisRef = useRef<SVGGElement>(null);

  const formatValue =
    format === "currency" ? formatCurrency : (d: NumberValue) => d.toString();

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    const maxLabelLength = estimateTextWidth(formatValue(xScale.domain()[1]));
    const ticks = Math.min(bounds.chartWidth / (maxLabelLength + 20), 4);
    const tickValues = xScale.ticks(ticks);

    g.call(
      axisBottom(xScale)
        .tickValues(tickValues)
        .tickSizeInner(-chartHeight)
        .tickSizeOuter(-chartHeight)
        .tickFormat(formatValue)
    );

    g.selectAll(".tick line").attr("stroke", gridColor).attr("stroke-width", 1);
    g.selectAll(".tick text")
      .attr("font-size", labelFontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor)
      .attr("x", 0)
      .attr("dy", labelFontSize)
      .attr("text-anchor", "middle");

    g.select("path.domain").attr("stroke", gridColor);
  };

  useEffect(() => {
    const g = select(xAxisRef.current);
    mkAxis(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <g
      ref={xAxisRef}
      key="x-axis-linear"
      transform={`translate(${margins.left}, ${chartHeight + margins.top})`}
    />
  );
};

const AxisWidthLinearTop = ({ format }: { format: "number" | "currency" }) => {
  const formatCurrency = useFormatCurrency();
  const { xScale, bounds, xAxisLabel } = useChartState() as
    | DotPlotState
    | RangePlotState;
  const { chartWidth, chartHeight, margins } = bounds;
  const { labelColor, labelFontSize, gridColor, fontFamily } = useChartTheme();
  const xAxisRef = useRef<SVGGElement>(null);

  const formatValue =
    format === "currency" ? formatCurrency : (d: NumberValue) => d.toString();

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    const maxLabelLength = estimateTextWidth(formatValue(xScale.domain()[1]));
    const ticks = Math.min(bounds.chartWidth / (maxLabelLength + 40), 10);
    const tickValues = xScale.ticks(ticks);

    g.call(
      axisTop(xScale)
        .tickValues(tickValues)
        .tickSizeInner(-chartHeight)
        .tickSizeOuter(-chartHeight)
        .tickFormat(formatValue)
        .tickPadding(6)
    );

    g.selectAll(".tick line").attr("stroke", gridColor).attr("stroke-width", 1);
    g.selectAll(".tick text")
      .attr("font-size", labelFontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor)
      .attr("x", 0)
      .attr("text-anchor", "middle");

    g.select("path.domain").remove();
  };

  useEffect(() => {
    const g = select(xAxisRef.current);
    mkAxis(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <>
      <g transform={`translate(${margins.left}, ${margins.top})`}>
        {xAxisLabel && (
          <text
            x={chartWidth + margins.right}
            y={0}
            dy={-labelFontSize * 2}
            fontSize={labelFontSize}
            textAnchor="end"
          >
            {xAxisLabel}
          </text>
        )}
      </g>
      <g
        ref={xAxisRef}
        key="x-axis-linear"
        transform={`translate(${margins.left}, ${margins.top})`}
      />
    </>
  );
};
