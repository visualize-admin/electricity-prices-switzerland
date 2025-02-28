import { max, min } from "d3-array";
import { axisBottom } from "d3-axis";
import { select, Selection } from "d3-selection";
import { useEffect, useRef } from "react";

import {
  HistogramState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import { useFormatCurrency } from "src/domain/helpers";

export const AxisWidthHistogram = () => {
  const formatCurrency = useFormatCurrency();
  const { data, getX, xScale, bounds, xAxisLabel } =
    useChartState() as HistogramState;
  const { chartWidth, chartHeight, margins } = bounds;
  const { labelColor, domainColor, labelFontSize, gridColor, fontFamily } =
    useChartTheme();
  const xAxisRef = useRef<SVGGElement>(null);

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    const minValue = min(data, (d) => getX(d)) || 0;
    const maxValue = max(data, (d) => getX(d)) || 10000;
    const tickValues = [minValue, maxValue];
    g.call(
      axisBottom(xScale)
        .tickValues(tickValues)
        .tickSizeInner(16)
        .tickSizeOuter(xAxisLabel ? -chartHeight : 0)
        .tickFormat(formatCurrency)
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
