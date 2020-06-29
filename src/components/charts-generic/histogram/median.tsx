import { median } from "d3-array";
import * as React from "react";
import { useTheme } from "../../../themes";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";
import { HistogramState } from "./histogram-state";

export const Median = () => {
  const {
    data,
    bounds,
    getX,
    xScale,
    getY,
    yScale,
    bins,
    colors,
  } = useChartState() as HistogramState;
  const theme = useTheme();
  const { margins } = bounds;
  const {
    labelColor,
    domainColor,
    labelFontSize,
    gridColor,
    fontFamily,
  } = useChartTheme();

  const m = median(data, (d) => getX(d));
  console.log({ m });
  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      <line
        x1={xScale(m)}
        y1={bounds.chartHeight + 56}
        x2={xScale(m)}
        y2={0}
        stroke={domainColor}
        strokeDasharray="4px 2px"
      />
      <text
        x={xScale(m)}
        y={bounds.chartHeight + 68}
        style={{
          fontFamily,
          fill: labelColor,
          fontSize: labelFontSize,
          textAnchor: "middle",
        }}
      >
        {"CH Median"}
      </text>
    </g>
  );
};
