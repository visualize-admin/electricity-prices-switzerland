import * as React from "react";
import { BAR_AXIS_OFFSET, BAR_SPACE_ON_TOP, BAR_HEIGHT } from "../constants";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";
import { GroupedBarsState } from "./bars-grouped-state";
import { Bar } from "./bars-simple";
import { useFormatCurrency } from "../../../domain/helpers";

export const BarsGrouped = () => {
  const {
    bounds,
    xScale,
    yScaleIn,
    getX,
    getY,
    yScale,
    getSegment,
    colors,
    grouped,
  } = useChartState() as GroupedBarsState;
  const { margins } = bounds;
  const {
    labelColor,
    gridColor,
    labelFontSize,
    fontFamily,
    domainColor,
    markBorderColor,
  } = useChartTheme();

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {grouped.map((segment) => {
        return (
          <g key={segment[0]} transform={`translate(0, ${yScale(segment[0])})`}>
            <g
              transform={`translate(0, ${BAR_SPACE_ON_TOP - BAR_AXIS_OFFSET})`}
            >
              {segment[1].map((d, i) => (
                <Bar
                  key={i}
                  y={yScaleIn(getSegment(d)) as number}
                  x={0}
                  width={xScale(Math.max(0, getX(d)))}
                  height={yScaleIn.bandwidth()}
                  color={colors(getSegment(d))}
                  stroke={markBorderColor}
                />
              ))}
            </g>
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
              {segment[0]}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export const BarsGroupedLabels = () => {
  const {
    bounds,
    xScale,
    yScaleIn,
    getX,
    getY,
    yScale,
    getSegment,
    colors,
    grouped,
  } = useChartState() as GroupedBarsState;
  const { margins } = bounds;
  const { axisLabelColor, labelFontSize, fontFamily } = useChartTheme();
  const formatCurrency = useFormatCurrency();

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {grouped.map((segment) => {
        return (
          <g key={segment[0]} transform={`translate(0, ${yScale(segment[0])})`}>
            <g
              transform={`translate(0, ${BAR_SPACE_ON_TOP - BAR_AXIS_OFFSET})`}
            >
              {segment[1].map((d, i) => (
                <text
                  style={{
                    fontFamily,
                    fill: axisLabelColor,
                    fontSize: labelFontSize,
                  }}
                  x={0}
                  y={yScaleIn(getSegment(d)) as number}
                  dx={6}
                  dy={labelFontSize * 1.5}
                >
                  <tspan fontWeight="bold">{formatCurrency(getX(d))}</tspan>{" "}
                  {getSegment(d)}
                </text>
              ))}
            </g>
          </g>
        );
      })}
    </g>
  );
};
