import { useTheme } from "@mui/material";
import { ascending } from "d3-array";
import { line } from "d3-shape";
import * as React from "react";

import { LinesState } from "src/components/charts-generic/lines/lines-state";
import { useChartState } from "src/components/charts-generic/use-chart-state";
import { GenericObservation } from "src/domain/data";

export const Lines = () => {
  const { getX, xScale, getY, yScale, grouped, colors, getColor, bounds } =
    useChartState() as LinesState;
  const theme = useTheme();

  const lineGenerator = line<GenericObservation>()
    .x((d) => xScale(getX(d)))
    .y((d) => yScale(getY(d)))
    .defined((d) => !isNaN(getY(d)) || getY(d) === undefined);
  return (
    <>
      {/* <g transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}>
        {grouped.map((lineData, index) => {
          return (
            <>
              {lineData[1].map((d) => (
                <circle
                  cx={xScale(getX(d))}
                  cy={yScale(getY(d))}
                  r={4}
                  fill="hotpink"
                />
              ))}
            </>
          );
        })}
      </g> */}
      <g transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}>
        {grouped.map((lineData, index) => {
          return (
            <Line
              key={index}
              path={
                lineGenerator(
                  lineData[1].sort((a, b) => ascending(getX(a), getX(b)))
                ) as string
              }
              color={
                grouped.length > 1
                  ? colors(getColor(lineData[1][0]))
                  : theme.palette.primary.main
              }
            />
          );
        })}
      </g>
    </>
  );
};

const Line = React.memo(({ path, color }: { path: string; color: string }) => {
  return <path d={path} stroke={color} fill="none" strokeWidth={2} />;
});
