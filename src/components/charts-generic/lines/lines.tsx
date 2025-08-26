import { ascending, line } from "d3";

import {
  LinesState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { GenericObservation } from "src/domain/data";

export const Lines = ({
  medianGroup,
  medianTotal,
}: {
  medianGroup?: string;
  medianTotal?: string;
}) => {
  const { getX, xScale, getY, yScale, grouped, colors, getColor, bounds } =
    useChartState() as LinesState;

  const lineGenerator = line<GenericObservation>()
    .x((d) => xScale(getX(d)))
    .y((d) => yScale(getY(d)))
    .defined((d) => !isNaN(getY(d)) || getY(d) === undefined);

  return (
    <g transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}>
      {grouped.map((lineData, index) => {
        const definedLineData = lineData[1].filter(
          (d) => !isNaN(getY(d)) || getY(d) === undefined
        );
        if (definedLineData.length === 1) {
          // We need to render a point for single data points
          const point = lineData[1][0];
          return (
            <circle
              key={index}
              cx={xScale(getX(point))}
              cy={yScale(getY(point))}
              r={2}
              fill={colors(getColor(point))}
            />
          );
        }
        const isMedianGroup = medianGroup === lineData[0];
        const isMedianTotal = medianTotal === lineData[0];
        return (
          <path
            d={
              lineGenerator(
                lineData[1].sort((a, b) => ascending(getX(a), getX(b)))
              ) as string
            }
            stroke={colors(getColor(lineData[1][0]))}
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={
              isMedianGroup ? "10,5,3,5" : isMedianTotal ? "3,3" : undefined
            }
          />
        );
      })}
    </g>
  );
};
