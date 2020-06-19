import * as React from "react";
import { useTheme } from "../../../themes";
import { useChartState } from "../use-chart-state";
import { BarsState } from "./bars-state";

export const Bars = () => {
  const {
    sortedData,
    bounds,
    getX,
    xScale,
    getY,
    yScale,
  } = useChartState() as BarsState;
  const theme = useTheme();
  const { margins } = bounds;

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {sortedData.map((d, i) => (
        <Bar
          key={i}
          x={0}
          width={xScale(getX(d))}
          y={yScale(getY(d))}
          height={yScale.bandwidth()}
          color={getX(d) <= 0 ? theme.colors.secondary : theme.colors.primary}
        />
      ))}
    </g>
  );
};

const Bar = React.memo(
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
