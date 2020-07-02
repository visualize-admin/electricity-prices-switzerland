import { max, median, min, ascending } from "d3-array";
import * as React from "react";
import { RangePlotFields } from "../../../domain/config-types";
import { useFormatNumber, isNumber } from "../../../domain/helpers";
import { normalize } from "../../../lib/array";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";
import { RangePlotState } from "../rangeplot/rangeplot-state";
import { HistogramState } from "../histogram/histogram-state";
import { Observation } from "../../../domain/data";

export const ANNOTATION_DOT_RADIUS = 2.5;
export const ANNOTATION_SQUARE_SIDE = 8;
export const ANNOTATION_LABEL_HEIGHT = 20;

export interface Annotation {
  datum: Observation;
  x: number;
  y: number;
  value: string;
  label: string;
  onTheLeft: boolean;
}

export const AnnotationX = () => {
  const { bounds, annotations } = useChartState() as
    | RangePlotState
    | HistogramState;

  const { margins, chartWidth } = bounds;
  const { annotationfontSize, fontFamily, annotationColor } = useChartTheme();

  return (
    <>
      {annotations && (
        <g transform={`translate(${margins.left} ${margins.top})`}>
          {annotations.map((a, i) => {
            return (
              <React.Fragment key={i}>
                <text
                  x={
                    a.onTheLeft
                      ? a.x + ANNOTATION_SQUARE_SIDE
                      : a.x - ANNOTATION_SQUARE_SIDE
                  }
                  y={ANNOTATION_LABEL_HEIGHT * i + ANNOTATION_SQUARE_SIDE / 2}
                  fill={annotationColor}
                  style={{
                    textAnchor: a.onTheLeft ? "start" : "end",
                    fontFamily,
                    fontSize: annotationfontSize,
                    dominantBaseline: "central",
                  }}
                >
                  <tspan fontWeight="bold">{a.value}</tspan> {a.label}
                </text>
                <rect
                  x={a.x - ANNOTATION_SQUARE_SIDE / 2}
                  y={ANNOTATION_LABEL_HEIGHT * i}
                  width={ANNOTATION_SQUARE_SIDE}
                  height={ANNOTATION_SQUARE_SIDE}
                />
                <line
                  x1={a.x}
                  y1={ANNOTATION_LABEL_HEIGHT * i}
                  x2={a.x}
                  y2={a.y}
                  stroke={annotationColor}
                />
                <circle
                  cx={a.x}
                  cy={a.y}
                  r={ANNOTATION_DOT_RADIUS}
                  fill={annotationColor}
                />
              </React.Fragment>
            );
          })}
        </g>
      )}
    </>
  );
};
