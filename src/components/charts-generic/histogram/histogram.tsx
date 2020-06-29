import * as React from "react";
import { useTheme } from "../../../themes";
import { useChartState } from "../use-chart-state";
import { HistogramState } from "./histogram-state";
import { Column } from "../columns/columns-simple";

export const HistogramColumns = () => {
  const {
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

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {bins.map((d, i) => (
        <Column
          key={i}
          x={xScale(d.x0) + 1}
          width={Math.max(0, xScale(d.x1) - xScale(d.x0) - 1)}
          y={yScale(getY(d))}
          height={Math.abs(yScale(getY(d)) - yScale(0))}
          color={!colors ? theme.colors.primary : colors(d.x0)}
        />
      ))}
    </g>
  );
};
