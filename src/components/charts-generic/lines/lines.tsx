import { ascending, line } from "d3";

import {
  LinesState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";

export const Lines = ({
  medianGroup,
  medianTotal,
}: {
  medianGroup?: string;
  medianTotal?: string;
}) => {
  const { getX, xScale, getY, yScale, grouped, colors, getColor, bounds } =
    useChartState() as LinesState;

  type XY = { x: Date; y: number; color: string };
  const xys = grouped.map((group) => {
    return [
      group[0],
      group[1]
        .map((d) => {
          const x = getX(d);
          const y = getY(d);
          return {
            x,
            y,
            color: getColor(d),
          };
        })
        .filter(
          (point): point is XY =>
            point.y !== undefined && point.x !== undefined && !isNaN(point.y)
        )
        .sort((a, b) => ascending(a.x, b.x)),
    ] as const;
  });

  const lineGenerator = line<{ x: Date; y: number }>()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y));

  return (
    <g transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}>
      {xys.map(([id, data], index) => {
        if (data.length === 1) {
          const point = data[0];
          return (
            <circle
              key={index}
              cx={xScale(point.x)}
              cy={yScale(point.y)}
              r={2}
              fill={colors(point.color)}
            />
          );
        }
        const isMedianGroup = medianGroup === id;
        const isMedianTotal = medianTotal === id;
        return (
          <path
            key={index}
            d={lineGenerator(data) as string}
            stroke={colors(data[0]?.color)}
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
