import * as React from "react";
import { useChartState } from "../use-chart-state";
import { GroupedBarsState } from "./bars-grouped-state";

export const BarsGrouped = () => {
  const {
    bounds,
    xScale,
    yScaleIn,
    getX,
    yScale,
    getSegment,
    colors,
    grouped,
  } = useChartState() as GroupedBarsState;
  const { margins } = bounds;

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {grouped.map((segment) => (
        <g key={segment[0]} transform={`translate(0, ${yScale(segment[0])})`}>
          {segment[1].map((d, i) => (
            <Bar
              key={i}
              y={yScaleIn(getSegment(d)) as number}
              x={0}
              width={xScale(Math.max(0, getX(d)))}
              // height={Math.abs(yScale(getY(d)) - yScale(0))}
              height={yScaleIn.bandwidth()}
              color={colors(getSegment(d))}
            />
          ))}
        </g>
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
        stroke="none"
        fill={color}
      />
    );
  }
);
