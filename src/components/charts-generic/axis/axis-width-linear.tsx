import { t } from "@lingui/macro";
import { axisBottom, axisTop, select, Selection } from "d3";
import { useEffect, useRef } from "react";

import {
  RangePlotState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import { useFormatCurrency } from "src/domain/helpers";
import { estimateTextWidth } from "src/lib/estimate-text-width";

export const AxisWidthLinear = ({
  position,
}: {
  position: "top" | "bottom";
}) => {
  switch (position) {
    case "top":
      return <AxisWidthLinearTop />;
    case "bottom":
      return <AxisWidthLinearBottom />;
    default:
      const _exhaustiveCheck: never = position;
      return _exhaustiveCheck;
  }
};

const AxisWidthLinearBottom = () => {
  const formatCurrency = useFormatCurrency();
  const { xScale, bounds } = useChartState() as RangePlotState;
  const { chartHeight, margins } = bounds;
  const { labelColor, labelFontSize, gridColor, fontFamily } = useChartTheme();
  const xAxisRef = useRef<SVGGElement>(null);

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    const maxLabelLength = estimateTextWidth(
      formatCurrency(xScale.domain()[1])
    );
    const ticks = Math.min(bounds.chartWidth / (maxLabelLength + 20), 4);
    const tickValues = xScale.ticks(ticks);

    g.call(
      axisBottom(xScale)
        .tickValues(tickValues)
        .tickSizeInner(-chartHeight)
        .tickSizeOuter(-chartHeight)
        .tickFormat(formatCurrency)
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

const AxisWidthLinearTop = () => {
  const formatCurrency = useFormatCurrency();
  const { xScale, yScale, bounds } = useChartState() as RangePlotState;
  const { chartWidth, chartHeight, margins } = bounds;
  const { labelColor, labelFontSize, gridColor, fontFamily } = useChartTheme();
  const xAxisRef = useRef<SVGGElement>(null);

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    const maxLabelLength = estimateTextWidth(
      formatCurrency(xScale.domain()[1])
    );
    const ticks = Math.min(bounds.chartWidth / (maxLabelLength + 40), 10);
    const tickValues = xScale.ticks(ticks);

    g.call(
      axisTop(xScale)
        .tickValues(tickValues)
        .tickSizeInner(-chartHeight)
        .tickSizeOuter(-chartHeight)
        .tickFormat(formatCurrency)
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
      <g
        transform={`translate(${margins.left}, ${
          yScale.range()[0] + (margins.annotations ?? 0) + margins.top
        })`}
      >
        <text
          x={chartWidth + margins.right}
          y={0}
          dy={-labelFontSize * 2}
          fontSize={labelFontSize}
          textAnchor="end"
        >
          {t({ id: "chart.axis.unit.Rp/kWh", message: "Rp./kWh" })}
        </text>
      </g>
      <g
        ref={xAxisRef}
        key="x-axis-linear"
        transform={`translate(${margins.left}, ${
          yScale.range()[0] + (margins.annotations ?? 0) + margins.top
        })`}
      />
    </>
  );
};
