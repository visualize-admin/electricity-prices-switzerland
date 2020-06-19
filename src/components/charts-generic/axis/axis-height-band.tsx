import { axisRight } from "d3-axis";
import { select, Selection } from "d3-selection";
import * as React from "react";
import { useEffect, useRef } from "react";
import { BarsState } from "../bars/bars-state";
import { BAR_HEIGHT } from "../constants";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";

export const AxisHeightBand = () => {
  const ref = useRef<SVGGElement>(null);
  const { xScale, yScale, bounds } = useChartState() as BarsState;

  const {
    labelColor,
    gridColor,
    labelFontSize,
    fontFamily,
    domainColor,
  } = useChartTheme();

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

// export const AxisHeightBandDomain = () => {
//   const ref = useRef<SVGGElement>(null);
//   const { xScale, yScale, bounds } = useChartState() as ColumnsState;
//   const { chartHeight, margins } = bounds;
//   const { domainColor } = useChartTheme();

//   const mkAxisDomain = (
//     g: Selection<SVGGElement, unknown, null, undefined>
//   ) => {
//     g.call(axisRight(xScale).tickSizeOuter(0));
//     g.selectAll(".tick line").remove();
//     g.selectAll(".tick text").remove();
//     g.select(".domain")
//       .attr("transform", `translate(0, -${bounds.chartHeight - yScale(0)})`)
//       .attr("stroke", domainColor);
//   };

//   useEffect(() => {
//     const g = select(ref.current);
//     mkAxisDomain(g as Selection<SVGGElement, unknown, null, undefined>);
//   });

//   return (
//     <g
//       ref={ref}
//       transform={`translate(${margins.left}, ${chartHeight + margins.top})`}
//     />
//   );
// };
