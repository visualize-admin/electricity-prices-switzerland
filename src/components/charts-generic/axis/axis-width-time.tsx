import { axisBottom } from "d3-axis";
import { select, Selection } from "d3-selection";
import * as React from "react";
import { useEffect, useRef } from "react";
import { useFormatShortDateAuto } from "../../../domain/helpers";
import { AreasState } from "../areas/areas-state";
import { LinesState } from "../lines/lines-state";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";

export const AxisTime = () => {
  const ref = useRef<SVGGElement>(null);
  const formatDateAuto = useFormatShortDateAuto();

  const { xScale, yScale, bounds, xUniqueValues } = useChartState() as
    | LinesState
    | AreasState;

  const { labelColor, gridColor, domainColor, labelFontSize, fontFamily } =
    useChartTheme();

  const hasNegativeValues = yScale.domain()[0] < 0;

  // Approximate the longest date format we're using for
  // Roughly equivalent to estimateTextWidth("99.99.9999", 12);
  const maxLabelLength = 70;

  const maxTicks = Math.ceil(bounds.chartWidth / (maxLabelLength + 20));
  const ticks = Math.min(maxTicks, xUniqueValues.length);
  const every = Math.ceil(xUniqueValues.length / ticks);

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    g.call(
      axisBottom(xScale)
        .ticks(ticks)
        // .ticks(timeYear.every(every))
        .tickFormat((x) => formatDateAuto(x as Date))
    );
    g.select(".domain").attr("stroke", "gridColor");
    g.selectAll(".tick line").attr("stroke", "gridColor");
    g.selectAll(".tick text")
      .attr("font-size", labelFontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor);
  };

  useEffect(() => {
    const g = select(ref.current);
    mkAxis(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <g
      ref={ref}
      transform={`translate(${bounds.margins.left}, ${
        bounds.chartHeight + bounds.margins.top
      })`}
    />
  );
};

export const AxisTimeDomain = () => {
  const ref = useRef<SVGGElement>(null);

  const { xScale, yScale, bounds } = useChartState() as LinesState | AreasState;

  const { domainColor } = useChartTheme();

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    g.call(axisBottom(xScale).tickSizeOuter(0));
    g.selectAll(".tick line").remove();
    g.selectAll(".tick text").remove();
    g.select(".domain")
      .attr("transform", `translate(0, -${bounds.chartHeight - yScale(0)})`)
      .attr("stroke", domainColor);
  };

  useEffect(() => {
    const g = select(ref.current);
    mkAxis(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <g
      ref={ref}
      transform={`translate(${bounds.margins.left}, ${
        bounds.chartHeight + bounds.margins.top
      })`}
    />
  );
};
