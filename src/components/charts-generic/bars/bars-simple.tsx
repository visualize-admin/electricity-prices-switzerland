import * as React from "react";
import { useTheme } from "../../../themes";
import { BAR_AXIS_OFFSET, BAR_HEIGHT, BAR_SPACE_ON_TOP } from "../constants";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";
import { BarsState } from "./bars-state";

export const Bars = () => {
  const {
    sortedData,
    bounds,
    getX,
    xScale,
    getY,
    getBarHeight,
    barHeightScale,
    yScale,
  } = useChartState() as BarsState;
  const theme = useTheme();
  const {
    labelColor,
    gridColor,
    labelFontSize,
    fontFamily,
    domainColor,
  } = useChartTheme();
  const { margins } = bounds;

  return (
    <>
      <g transform={`translate(${margins.left}, ${margins.top})`}>
        {sortedData.map((d, i) => {
          return (
            <g transform={`translate(0, ${yScale(getY(d))})`}>
              <line
                x1={0}
                y1={BAR_SPACE_ON_TOP - BAR_AXIS_OFFSET * 2}
                x2={0}
                y2={yScale.bandwidth()}
                stroke={domainColor}
              />
              <text
                x={0}
                y={BAR_SPACE_ON_TOP * (1 / 2)}
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
                y={BAR_SPACE_ON_TOP - BAR_AXIS_OFFSET}
                height={BAR_HEIGHT}
                color={
                  getX(d) <= 0 ? theme.colors.secondary : theme.colors.primary
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