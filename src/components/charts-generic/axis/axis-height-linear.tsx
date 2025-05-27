import { axisLeft, select, Selection } from "d3";
import { useEffect, useRef } from "react";

import {
  AreasState,
  ColumnsState,
  LinesState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import { useFormatCurrency, useFormatNumber } from "src/domain/helpers";
import { getLocalizedLabel } from "src/domain/translation";
import { useIsMobile } from "src/lib/use-mobile";

import { MINI_CHART_WIDTH } from "../constants";

const TICK_MIN_HEIGHT = 50;

export const AxisHeightLinear = ({
  format,
}: {
  format?: "currency" | "number";
}) => {
  const ref = useRef<SVGGElement>(null);
  const formatNumber =
    format === "currency" ? useFormatCurrency() : useFormatNumber();

  const isMobile = useIsMobile();

  const { yScale, yAxisLabel, bounds } = useChartState() as
    | ColumnsState
    | LinesState
    | AreasState;

  const ticks = Math.max(Math.min(bounds.chartHeight / TICK_MIN_HEIGHT, 4), 2);
  const { axisLabelColor, labelColor, labelFontSize, gridColor, fontFamily } =
    useChartTheme();

  const isMiniChart = bounds.width <= MINI_CHART_WIDTH;

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    const tickValues = yScale.ticks(ticks);
    const yDomain = yScale.domain();
    // Ensure we have a tick above the maximum value
    if (
      Math.max(yDomain[0], yDomain[1]) >
      Math.max(tickValues[0], tickValues[tickValues.length - 1])
    ) {
      const diff =
        tickValues[1] > tickValues[0]
          ? tickValues[1] - tickValues[0]
          : tickValues[0] - tickValues[1];
      tickValues.push(tickValues[tickValues.length - 1] + diff);
    }
    g.call(
      axisLeft(yScale)
        .tickValues(tickValues)
        .tickSizeInner(-bounds.chartWidth)
        .tickFormat(formatNumber)
    );

    g.select(".domain").remove();

    g.selectAll(".tick line").attr("stroke", gridColor).attr("stroke-width", 1);
    g.selectAll(".tick text")
      .attr("font-size", labelFontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor)
      .attr("x", isMiniChart ? -bounds.margins.left : -6)
      .attr("dy", 3)
      .attr("text-anchor", isMiniChart ? "start" : "end");
  };
  useEffect(() => {
    const g = select(ref.current);
    mkAxis(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <>
      <g>
        <text
          x={0}
          y={isMobile ? bounds.margins.top / 2 - labelFontSize : 0}
          dy={bounds.margins.top / 2 - labelFontSize / 2}
          fontSize={labelFontSize}
          fill={axisLabelColor}
        >
          {yAxisLabel && getLocalizedLabel({ id: yAxisLabel })}
        </text>
      </g>
      <g
        ref={ref}
        transform={`translate(${bounds.margins.left}, ${bounds.margins.top})`}
      />
    </>
  );
};
