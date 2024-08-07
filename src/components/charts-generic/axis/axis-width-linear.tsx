import { t } from "@lingui/macro";
import { axisBottom, axisTop } from "d3-axis";
import { select, Selection } from "d3-selection";
import * as React from "react";
import { useEffect, useRef } from "react";

import { estimateTextWidth } from "src/lib/estimate-text-width";

import { useFormatCurrency } from "../../../domain/helpers";
import { RangePlotState, useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";

export const AxisWidthLinear = ({ position }: { position: "top" | "bottom" }) =>
  position === "bottom" ? <AxisWidthLinearBottom /> : <AxisWidthLinearTop />;

export const AxisWidthLinearBottom = () => {
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
    <>
      {/*
      <g transform={`translate(${margins.left}, ${margins.top})`}>
     <text
          x={chartWidth}
          y={chartHeight + margins.bottom}
          dy={-labelFontSize}
          fontSize={labelFontSize}
          textAnchor="end"
        >
          {xAxisLabel}
        </text>
      </g> */}
      <g
        ref={xAxisRef}
        key="x-axis-linear"
        transform={`translate(${margins.left}, ${chartHeight + margins.top})`}
      />
    </>
  );
};

export const AxisWidthLinearTop = () => {
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
          {t({ id: "chart.axis.unit.Rp/kWh", message: `Rp./kWh` })}
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

export const AxisWidthLinearDomain = () => {
  const { xScale, bounds } = useChartState() as RangePlotState;
  const { chartHeight, margins } = bounds;
  const { domainColor } = useChartTheme();
  const xAxisDomainRef = useRef<SVGGElement>(null);

  const mkAxisDomain = (
    g: Selection<SVGGElement, unknown, null, undefined>
  ) => {
    g.call(axisBottom(xScale).tickSizeOuter(0));
    g.selectAll(".tick line").remove();
    g.selectAll(".tick text").remove();
    g.select("path.domain")
      .attr("data-name", "width-axis-domain")
      .attr("transform", `translate(0, -${bounds.chartHeight})`)
      .attr("stroke", domainColor);
  };

  useEffect(() => {
    const g = select(xAxisDomainRef.current);
    mkAxisDomain(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <g
      ref={xAxisDomainRef}
      key="x-axis-linear-domain"
      transform={`translate(${margins.left}, ${chartHeight + margins.top})`}
    />
  );
};
