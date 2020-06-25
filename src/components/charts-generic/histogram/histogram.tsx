import * as React from "react";
import { useTheme } from "../../../themes";
import { useChartState } from "../use-chart-state";
import { HistogramState } from "./histogram-state";
import { Column } from "../columns/columns-simple";

export const HistogramColumns = () => {
  const {
    bounds,
    xScale,
    getY,
    yScale,
    bins,
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
          y={yScale(d.length)}
          // height={yScale(0) - yScale(getY(d))}
          height={Math.abs(yScale(d.length) - yScale(0))}
          color={getY(d) <= 0 ? theme.colors.secondary : theme.colors.primary}
        />
      ))}
    </g>
  );
};
