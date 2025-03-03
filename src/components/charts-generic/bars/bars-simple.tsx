import { useTheme } from "@mui/material";
import * as React from "react";

import { BAR_HEIGHT } from "src/components/charts-generic/constants";
import {
  BarsState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";

export const Bars = () => {
  const { sortedData, bounds, getX, xScale, getY, yScale } =
    useChartState() as BarsState;
  const theme = useTheme();
  const { labelColor, labelFontSize, fontFamily, domainColor } =
    useChartTheme();
  const { margins } = bounds;

  return (
    <>
      <g transform={`translate(${margins.left}, ${margins.top})`}>
        {sortedData.map((d, i) => {
          return (
            <g transform={`translate(0, ${yScale(getY(d))})`} key={i}>
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={yScale.bandwidth()}
                stroke={domainColor}
              />
              <text
                x={0}
                y={0}
                style={{
                  fontFamily,
                  fill: labelColor,
                  fontSize: labelFontSize,
                }}
              >
                {getY(d)}
              </text>
              <Bar
                key={i}
                x={0}
                width={xScale(getX(d))}
                y={0}
                height={BAR_HEIGHT}
                color={
                  getX(d) <= 0
                    ? theme.palette.secondary.main
                    : theme.palette.primary.main
                }
              />
            </g>
          );
        })}
      </g>
    </>
  );
};

export const Bar = React.memo(
  ({
    x,
    y,
    width,
    height,
    color,
    fillOpacity = 1,
    stroke,
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    fillOpacity?: number;
    stroke?: string;
  }) => {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        fillOpacity={fillOpacity}
        stroke={stroke}
      />
    );
  }
);
