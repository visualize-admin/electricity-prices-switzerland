import { max, median, min } from "d3-array";
import * as React from "react";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";
import { BoxPlotState, DOT_RADIUS } from "./boxplot-state";

export const BoxPlotRows = () => {
  const {
    bounds,
    xScale,
    getX,
    getY,
    yScale,
    colors,
    grouped,
  } = useChartState() as BoxPlotState;

  const { margins, chartWidth } = bounds;
  const {
    labelColor,
    gridColor,
    labelFontSize,
    fontFamily,
    domainColor,
  } = useChartTheme();

  console.log({ grouped });
  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {grouped.map((row) => {
        const xMin = min(row[1], (d) => getX(d));
        const m = median(row[1], (d) => getX(d));
        const xMax = max(row[1], (d) => getX(d));
        return (
          <g key={row[0]} transform={`translate(0, ${yScale(row[0])})`}>
            <rect
              x={xScale(xMin) - DOT_RADIUS}
              width={xScale(xMax) - xScale(xMin) + DOT_RADIUS * 2}
              height={DOT_RADIUS * 2}
              rx={DOT_RADIUS}
            />

            <circle
              cx={xScale(xMin)}
              cy={DOT_RADIUS}
              r={DOT_RADIUS}
              fill={colors(xMin)}
            />
            <circle
              cx={xScale(xMax)}
              cy={DOT_RADIUS}
              r={DOT_RADIUS}
              fill={colors(xMax)}
            />
            <text
              x={xScale(xMin) - 16}
              y={DOT_RADIUS}
              style={{
                fontFamily,
                fill: labelColor,
                fontSize: labelFontSize,
                textAnchor: "end",
                dominantBaseline: "middle",
              }}
            >
              {row[0]}
            </text>
            {/*  <g
              transform={`translate(0, ${BAR_SPACE_ON_TOP - BAR_AXIS_OFFSET})`}
            >
              {row[1].map((d, i) => (
                <Bar
                  key={i}
                  y={yScaleIn(getSegment(d)) as number}
                  x={0}
                  width={xScale(Math.max(0, getX(d)))}
                  height={yScaleIn.bandwidth()}
                  color={colors(getSegment(d))}
                />
              ))}
            </g> */}
          </g>
        );
      })}
    </g>
  );
};
