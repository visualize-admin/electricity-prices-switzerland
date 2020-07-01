import { axisBottom } from "d3-axis";
import { select, Selection } from "d3-selection";
import * as React from "react";
import { useEffect, useRef } from "react";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";

import { estimateTextWidth } from "../../../lib/estimate-text-width";
import { useFormatNumber } from "../../../domain/helpers";
import { HistogramState } from "../histogram/histogram-state";

export const AxisWidthHistogram = () => {
  const formatNumber = useFormatNumber();
  const {
    xScale,
    bounds,
    xAxisLabel,
    colors,
  } = useChartState() as HistogramState;
  const { chartWidth, chartHeight, margins } = bounds;
  const {
    labelColor,
    domainColor,
    labelFontSize,
    gridColor,
    fontFamily,
  } = useChartTheme();
  const xAxisRef = useRef<SVGGElement>(null);

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    const maxLabelLength = estimateTextWidth(formatNumber(xScale.domain()[1]));
    const ticks = Math.min(bounds.chartWidth / (maxLabelLength + 20), 4);
    const tickValues = xScale.ticks(ticks);

    g.call(
      axisBottom(xScale)
        .tickValues(colors.domain())
        // .tickValues(tickValues)
        .tickSizeInner(16)
        // .tickSizeInner(-chartHeight)
        .tickSizeOuter(xAxisLabel ? -chartHeight : 0)
        .tickFormat(formatNumber)
    );

    g.selectAll(".tick line")
      // FIXME: stroke should depend on whether there is a colorScale defined for the bars
      .attr("stroke", domainColor)
      .attr("stroke-width", 1);
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
      {xAxisLabel && (
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
        </g>
      )}
      <g
        ref={xAxisRef}
        key="x-axis-linear"
        transform={`translate(${margins.left}, ${chartHeight + margins.top})`}
      />
    </>
  );
};

export const AxisWidthHistogramDomain = () => {
  const { xScale, yScale, bounds } = useChartState() as HistogramState;
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
      .attr("transform", `translate(0, -${bounds.chartHeight - yScale(0)})`)
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
