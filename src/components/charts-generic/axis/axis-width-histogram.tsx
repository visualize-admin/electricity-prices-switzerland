import { axisBottom, select, Selection } from "d3";
import { useEffect, useRef } from "react";

import {
  HistogramState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";

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

export const AxisWidthHistogram = () => {
  const { xScale, bounds, binMeta, bandScale } =
    useChartState() as HistogramState;
  const { chartHeight, margins } = bounds;
  const { labelColor, labelFontSize, gridColor, fontFamily } = useChartTheme();
  const xAxisRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const g = select(xAxisRef.current) as Selection<
      SVGGElement,
      unknown,
      null,
      undefined
    >;
    g.selectAll("*").remove();
    if (!binMeta || !bandScale) {
      const ticks = Math.min(bounds.chartWidth / 60, 10);
      g.call(axisBottom(xScale).ticks(ticks).tickSizeInner(6).tickSizeOuter(0));
      g.selectAll(".tick line").attr("stroke", gridColor);
      g.selectAll(".tick text")
        .attr("font-size", labelFontSize)
        .attr("font-family", fontFamily)
        .attr("fill", labelColor);
      g.select("path.domain").attr("stroke", gridColor);
      return;
    }

    binMeta.forEach((bin, i) => {
      const label = bin.label ?? String(i);
      const x = (bandScale(label) ?? 0) + bandScale.bandwidth() / 2;
      g.append("line")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", 0)
        .attr("y2", 6)
        .attr("stroke", gridColor);
      g.append("text")
        .attr("x", x)
        .attr("y", labelFontSize + 8)
        .attr("font-size", labelFontSize)
        .attr("font-family", fontFamily)
        .attr("fill", labelColor)
        .attr("text-anchor", "middle")
        .text(bin.label);
    });
  }, [
    xScale,
    bounds,
    labelColor,
    labelFontSize,
    gridColor,
    fontFamily,
    binMeta,
    bandScale,
  ]);

  return (
    <g
      ref={xAxisRef}
      key="x-axis-histogram"
      transform={`translate(${margins.left}, ${chartHeight + margins.top})`}
    />
  );
};
