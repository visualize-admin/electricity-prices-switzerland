import * as React from "react";
import { useTheme } from "../../../themes";
import { useChartState } from "../use-chart-state";
import {
  HistogramState,
  ANNOTATION_SQUARE_SIDE,
  ANNOTATION_LABEL_HEIGHT,
  ANNOTATION_DOT_RADIUS,
} from "./histogram-state";
import { Column } from "../columns/columns-simple";
import { useFormatNumber } from "../../../domain/helpers";
import { useAnnotation } from "../use-annotation";
import { useChartTheme } from "../use-chart-theme";
import { DOT_RADIUS } from "../rangeplot/rangeplot-state";

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

export const HistogramAnnotation = () => {
  const { bounds, xScale, getX, yScale } = useChartState() as HistogramState;
  const formatNumber = useFormatNumber();
  const { margins, chartWidth } = bounds;
  const [{ d }] = useAnnotation();
  const { annotationfontSize, fontFamily, annotationColor } = useChartTheme();

  return (
    <>
      {d && (
        <g transform={`translate(${margins.left} ${margins.top})`}>
          {d.map((datum, i) => {
            const xPosition = xScale(getX(datum));
            const onTheLeft = xPosition <= chartWidth / 2;
            return (
              <React.Fragment key={i}>
                <text
                  x={
                    onTheLeft
                      ? xPosition + ANNOTATION_SQUARE_SIDE
                      : xPosition - ANNOTATION_SQUARE_SIDE
                  }
                  y={ANNOTATION_LABEL_HEIGHT * i + ANNOTATION_SQUARE_SIDE / 2}
                  fill={annotationColor}
                  style={{
                    textAnchor: onTheLeft ? "start" : "end",
                    fontFamily,
                    fontSize: annotationfontSize,
                    dominantBaseline: "central",
                  }}
                >
                  {formatNumber(getX(datum))}
                </text>
                <rect
                  x={xPosition - ANNOTATION_SQUARE_SIDE / 2}
                  y={ANNOTATION_LABEL_HEIGHT * i}
                  width={ANNOTATION_SQUARE_SIDE}
                  height={ANNOTATION_SQUARE_SIDE}
                />
                <line
                  x1={xPosition}
                  y1={ANNOTATION_LABEL_HEIGHT * i}
                  x2={xPosition}
                  y2={yScale(0)}
                  stroke={annotationColor}
                />
              </React.Fragment>
            );
          })}
        </g>
      )}
    </>
  );
};
