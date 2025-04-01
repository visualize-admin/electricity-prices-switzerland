import { axisBottom, axisTop } from "d3-axis";
import { select, Selection } from "d3-selection";
import { useEffect, useRef } from "react";

import {
  AreasState,
  LinesState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import { useFormatShortDateAuto } from "src/domain/helpers";

export const AxisTime = () => {
  const bottomRef = useRef<SVGGElement>(null);
  const topRef = useRef<SVGGElement>(null);
  const formatDateAuto = useFormatShortDateAuto();

  const { xScale, yScale, bounds, xUniqueValues } = useChartState() as
    | LinesState
    | AreasState;

  const { labelColor, gridColor, labelFontSize, fontFamily } = useChartTheme();

  // Approximate the longest date format we're using for
  // Roughly equivalent to estimateTextWidth("99.99.9999", 12);
  const maxLabelLength = 70;

  const maxTicks = Math.ceil(bounds.chartWidth / (maxLabelLength + 20));
  const ticks = Math.min(maxTicks, xUniqueValues.length);

  const mkAxisBottom = (
    g: Selection<SVGGElement, unknown, null, undefined>
  ) => {
    g.call(
      axisBottom(xScale)
        .ticks(ticks)
        .tickSize(0)
        .tickSizeInner(4)
        .tickFormat((x) => formatDateAuto(x as Date))
    );
    g.select(".domain").attr("stroke", "#ededed");
    g.selectAll(".tick line").attr("stroke", gridColor);
    g.selectAll(".tick text")
      .attr("font-size", labelFontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor);
  };

  const mkAxisTop = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    g.call(axisTop(xScale).ticks(0).tickSize(0));
    g.select(".domain").attr("stroke", "#ededed");
    g.selectAll(".tick line").attr("stroke", gridColor);
    g.selectAll(".tick text")
      .attr("font-size", labelFontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor);
  };

  useEffect(() => {
    const bottom = select(bottomRef.current);
    const top = select(topRef.current);
    mkAxisBottom(bottom as Selection<SVGGElement, unknown, null, undefined>);
    mkAxisTop(top as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <>
      <g
        ref={bottomRef}
        transform={`translate(${bounds.margins.left}, ${
          bounds.chartHeight + bounds.margins.top
        })`}
      />
      <g
        ref={topRef}
        transform={`translate(${bounds.margins.left}, ${
          bounds.margins.top + yScale(yScale.domain()[1])
        })`}
      />
    </>
  );
};
