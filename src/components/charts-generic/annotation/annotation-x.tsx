import { max, median, min, ascending } from "d3-array";
import * as React from "react";
import { RangePlotFields } from "../../../domain/config-types";
import { useFormatNumber } from "../../../domain/helpers";
import { normalize } from "../../../lib/array";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";
import { RangePlotState } from "../rangeplot/rangeplot-state";
import { HistogramState } from "../histogram/histogram-state";

export const ANNOTATION_DOT_RADIUS = 2.5;
export const ANNOTATION_SQUARE_SIDE = 8;
export const ANNOTATION_LABEL_HEIGHT = 20;

export const AnnotationX = ({
  annotation,
}: Pick<RangePlotFields, "annotation">) => {
  const {
    bounds,
    xScale,
    getX,
    yScale,
    getY,
  } = useChartState() as RangePlotState;
  // | HistogramState;
  const formatNumber = useFormatNumber();
  const { margins, chartWidth } = bounds;
  const { annotationfontSize, fontFamily, annotationColor } = useChartTheme();

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {annotation
        .sort((a, b) => ascending(getX(a), getX(b)))
        .map((datum, i) => {
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
                y2={yScale(getY(datum))}
                stroke={annotationColor}
              />
              <circle
                cx={xPosition}
                cy={yScale(getY(datum))}
                r={ANNOTATION_DOT_RADIUS}
                fill={annotationColor}
              />
            </React.Fragment>
          );
        })}
    </g>
  );
};
