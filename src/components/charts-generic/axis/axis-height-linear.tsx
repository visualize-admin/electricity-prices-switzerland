import { axisLeft } from "d3-axis";
import { select, Selection } from "d3-selection";
import * as React from "react";
import { useEffect, useRef } from "react";
import { useFormatCurrency, useFormatNumber } from "../../../domain/helpers";
import { getLocalizedLabel } from "../../../domain/translation";
import { AreasState } from "../areas/areas-state";
import { ColumnsState } from "../columns/columns-state";
import { LinesState } from "../lines/lines-state";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";

const TICK_MIN_HEIGHT = 50;

export const AxisHeightLinear = ({
  format,
}: {
  format?: "currency" | "number";
}) => {
  const ref = useRef<SVGGElement>(null);
  const formatNumber =
    format === "currency" ? useFormatCurrency() : useFormatNumber();

  const { yScale, yAxisLabel, bounds } = useChartState() as
    | ColumnsState
    | LinesState
    | AreasState;

  const ticks = Math.max(Math.min(bounds.chartHeight / TICK_MIN_HEIGHT, 4), 2);
  const { axisLabelColor, labelColor, labelFontSize, gridColor, fontFamily } =
    useChartTheme();

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
      .attr("x", -6)
      .attr("dy", 3)
      .attr("text-anchor", "end");
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
          y={0}
          dy={bounds.margins.top / 2}
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

export const AxisHeightLinearDomain = () => {
  const ref = useRef<SVGGElement>(null);
  const { xScale, yScale, bounds } = useChartState() as
    | ColumnsState
    | LinesState
    | AreasState;
  const { domainColor } = useChartTheme();

  const mkAxisDomain = (
    g: Selection<SVGGElement, unknown, null, undefined>
  ) => {
    g.call(axisLeft(yScale).tickSizeOuter(0));

    g.select(".domain")
      .attr("data-name", "height-axis-domain")
      .attr("transform", `translate(${xScale(0 as $FixMe)}, 0)`)
      .attr("stroke", domainColor);

    g.selectAll(".tick line").remove();
    g.selectAll(".tick text").remove();
  };
  useEffect(() => {
    const g = select(ref.current);
    mkAxisDomain(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <g
      ref={ref}
      transform={`translate(${bounds.margins.left}, ${bounds.margins.top})`}
    />
  );
};
