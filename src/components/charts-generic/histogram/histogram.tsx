import { useTheme } from "@mui/material";
import * as React from "react";

import { Column } from "src/components/charts-generic/columns/columns-simple";
import {
  HistogramState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";

export const HistogramColumns = () => {
  const { bounds, xScale, getY, yScale, bins, colors } =
    useChartState() as HistogramState;
  const theme = useTheme();
  const { margins } = bounds;

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {bins.map((d, i) => (
        <React.Fragment key={i}>
          {d.x0 && d.x1 && (
            <Column
              x={xScale(d.x0) + 1}
              width={Math.max(0, xScale(d.x1) - xScale(d.x0) - 1)}
              y={yScale(getY(d))}
              height={Math.abs(yScale(getY(d)) - yScale(0))}
              color={
                !colors
                  ? theme.palette.primary.main
                  : colors(d.x0 + (d.x1 - d.x0) / 2)
              }
            />
          )}
        </React.Fragment>
      ))}
    </g>
  );
};
