import * as React from "react";
import { useFormatNumber } from "../../../domain/helpers";
import { useTheme } from "../../../themes";
import { Column } from "../columns/columns-simple";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";
import {
  ANNOTATION_LABEL_HEIGHT,
  ANNOTATION_SQUARE_SIDE,
  HistogramState,
} from "./histogram-state";

export const HistogramColumns = () => {
  const {
    bounds,
    xScale,
    getY,
    yScale,
    bins,
    colors,
  } = useChartState() as HistogramState;
  const theme = useTheme();
  const { margins } = bounds;

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {bins.map((d, i) => (
        <Column
          key={i}
          x={xScale(d.x0) + 1}
          width={Math.max(0, xScale(d.x1) - xScale(d.x0) - 1)}
          y={yScale(getY(d))}
          height={Math.abs(yScale(getY(d)) - yScale(0))}
          color={!colors ? theme.colors.primary : colors(d.x0)}
        />
      ))}
    </g>
  );
};
