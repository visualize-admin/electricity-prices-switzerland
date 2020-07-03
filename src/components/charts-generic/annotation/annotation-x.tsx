import * as React from "react";
import { Box } from "theme-ui";
import { Observation } from "../../../domain/data";
import { HistogramState } from "../histogram/histogram-state";
import { RangePlotState } from "../rangeplot/rangeplot-state";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";

export const ANNOTATION_DOT_RADIUS = 2.5;
export const ANNOTATION_SQUARE_SIDE = 8;
export const ANNOTATION_LABEL_HEIGHT = 20;

export interface Annotation {
  datum: Observation;
  x: number;
  y: number;
  xLabel: number;
  yLabel: number;
  value: string;
  label: string;
  onTheLeft: boolean;
}

export const AnnotationX = () => {
  const { bounds, annotations } = useChartState() as
    | RangePlotState
    | HistogramState;

  const { margins } = bounds;
  const { annotationColor } = useChartTheme();

  return (
    <>
      {annotations && (
        <g transform={`translate(${margins.left} ${margins.top})`}>
          {annotations.map((a, i) => {
            return (
              <React.Fragment key={i}>
                <rect
                  x={a.x - ANNOTATION_SQUARE_SIDE / 2}
                  y={a.yLabel}
                  width={ANNOTATION_SQUARE_SIDE}
                  height={ANNOTATION_SQUARE_SIDE}
                />
                <line
                  x1={a.x}
                  y1={a.yLabel}
                  x2={a.x}
                  y2={a.y}
                  stroke={annotationColor}
                />
                {/* Data Point indicator */}
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

export const AnnotationXLabel = () => {
  const { bounds, annotations } = useChartState() as
    | RangePlotState
    | HistogramState;

  const { annotationfontSize, fontFamily, annotationColor } = useChartTheme();

  const { chartWidth, margins } = bounds;
  return (
    <>
      {annotations &&
        annotations.map((a) => (
          <Box
            key={a.label}
            sx={{
              width: chartWidth * 0.5,
              p: 1,
              zIndex: 2,
              position: "absolute",
              left: a.xLabel! + margins.left,
              top: a.yLabel + margins.top,
              pointerEvents: "none",
              textAlign: a.onTheLeft ? "right" : "left",
              transform: mkTranslation(a.onTheLeft, ANNOTATION_SQUARE_SIDE),
              fontFamily,
              fontSize: annotationfontSize,
              color: annotationColor,
              bg: "monochrome100",
              wordBreak: ["break-all", "break-word", "break-word"],
            }}
          >
            <Box as="span" sx={{ fontWeight: "bold" }}>
              {a.value}{" "}
            </Box>
            {a.label}
          </Box>
        ))}
    </>
  );
};

const mkTranslation = (onTheLeft: boolean, offset: number) =>
  onTheLeft
    ? `translate3d(calc(-100% - ${offset}px), -50%, 0)`
    : `translate3d(${offset}px, -50%, 0)`;
