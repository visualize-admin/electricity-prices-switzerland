import { useTheme } from "@mui/material";
import * as React from "react";

import {
  ColumnsState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";

export const Columns = () => {
  const { sortedData, bounds, getX, xScale, getY, yScale } =
    useChartState() as ColumnsState;
  const theme = useTheme();
  const { margins } = bounds;

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {sortedData.map((d, i) => (
        <Column
          key={i}
          x={xScale(getX(d)) as number}
          width={xScale.bandwidth()}
          y={yScale(Math.max(0, getY(d)))}
          height={Math.abs(yScale(getY(d)) - yScale(0))}
          color={
            getY(d) <= 0
              ? theme.palette.secondary.main
              : theme.palette.primary.main
          }
        />
      ))}
    </g>
  );
};

export const Column = React.memo(
  ({
    x,
    y,
    width,
    height,
    color,
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
  }) => {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke="none"
      />
    );
  }
);
