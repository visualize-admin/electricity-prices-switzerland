import { axisRight } from "d3-axis";
import { select, Selection } from "d3-selection";
import * as React from "react";
import { useEffect, useRef } from "react";

import { BAR_HEIGHT } from "../constants";
import { BarsState, useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";

export const AxisHeightBand = () => {
  const ref = useRef<SVGGElement>(null);
  const { xScale, yScale, bounds } = useChartState() as BarsState;

  const { labelColor, gridColor, labelFontSize, fontFamily, domainColor } =
    useChartTheme();

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    const hasNegativeValues = xScale.domain()[0] < 0;

    const fontSize = labelFontSize;
    g.call(axisRight(yScale).tickSizeOuter(0).tickSizeInner(0));

    g.selectAll(".tick line").attr(
      "stroke",
      hasNegativeValues ? gridColor : domainColor
    );
    g.selectAll(".tick text")
      .attr("font-size", fontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor)
      .attr("x", 0)
      .attr("y", -BAR_HEIGHT / 2)
      .attr("dx", 6)
      .attr("dy", -6);
  };
  useEffect(() => {
    const g = select(ref.current);
    mkAxis(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <g
      ref={ref}
      transform={`translate(${bounds.margins.left}, ${bounds.margins.top})`}
    />
  );
};
