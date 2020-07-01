import { median } from "d3-array";
import * as React from "react";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";
import { HistogramState } from "./histogram-state";

export const Median = ({ label }: { label: string }) => {
  const {
    data,
    bounds,
    getX,
    xScale,
    yScale,
  } = useChartState() as HistogramState;
  const { margins } = bounds;
  const {
    labelColor,
    domainColor,
    labelFontSize,
    fontFamily,
  } = useChartTheme();

  const m = median(data, (d) => getX(d));

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      <line
        x1={xScale(m)}
        y1={bounds.chartHeight + 44}
        x2={xScale(m)}
        y2={yScale(yScale.domain()[1])}
        stroke={domainColor}
        strokeDasharray="4px 2px"
      />
      <text
        x={xScale(m)}
        y={bounds.chartHeight + 56}
        style={{
          fontFamily,
          fill: labelColor,
          fontSize: labelFontSize,
          textAnchor: "middle",
        }}
      >
        {label}
      </text>
    </g>
  );
};
