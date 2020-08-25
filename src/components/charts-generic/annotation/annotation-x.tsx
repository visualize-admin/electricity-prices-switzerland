import * as React from "react";
import { Box } from "theme-ui";
import { GenericObservation } from "../../../domain/data";
import { HistogramState } from "../histogram/histogram-state";
import { RangePlotState } from "../rangeplot/rangeplot-state";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";

export const ANNOTATION_DOT_RADIUS = 2.5;
export const ANNOTATION_TRIANGLE_WIDTH = 5;
export const ANNOTATION_TRIANGLE_HEIGHT = ANNOTATION_TRIANGLE_WIDTH * 1.5;
export const ANNOTATION_LABEL_HEIGHT = 20;

export interface Annotation {
  datum: GenericObservation;
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
  const { annotationLineColor, annotationColor } = useChartTheme();

  return (
    <>
      {annotations &&
        annotations.map((a, i) => {
          return (
            <React.Fragment key={i}>
              <g transform={`translate(${margins.left}, 0)`}>
                <line
                  x1={a.x}
                  y1={a.yLabel}
                  x2={a.x}
                  y2={a.y + margins.top}
                  stroke={annotationLineColor}
                />
                <polygon
                  points={`${a.x - ANNOTATION_TRIANGLE_WIDTH},${a.yLabel} ${
                    a.x + ANNOTATION_TRIANGLE_WIDTH
                  },${a.yLabel} ${a.x},${
                    a.yLabel + ANNOTATION_TRIANGLE_HEIGHT
                  } `}
                  fill={annotationColor}
                />
              </g>
            </React.Fragment>
          );
        })}
    </>
  );
};

export const AnnotationXDataPoint = () => {
  const { bounds, annotations } = useChartState() as
    | RangePlotState
    | HistogramState;

  const { margins } = bounds;
  const { annotationColor } = useChartTheme();

  return (
    <>
      {annotations &&
        annotations.map((a, i) => {
          return (
            <React.Fragment key={i}>
              <g transform={`translate(${margins.left}, 0)`}>
                {/* Data Point indicator */}
                <circle
                  cx={a.x}
                  cy={a.y + margins.top}
                  r={ANNOTATION_DOT_RADIUS}
                  fill={annotationColor}
                />
              </g>
            </React.Fragment>
          );
        })}
    </>
  );
};

export const AnnotationXLabel = () => {
  const { bounds, annotations } = useChartState() as
    | RangePlotState
    | HistogramState;

  const { annotationfontSize, fontFamily, annotationColor } = useChartTheme();

  const { width, margins } = bounds;
  return (
    <>
      {annotations &&
        annotations.map((a, i) => (
          <Box
            key={`${a.label}-${i}`}
            sx={{
              maxWidth: width * 0.5,
              width: "fit-content",
              p: 1,
              zIndex: 2,
              position: "absolute",
              left: a.xLabel! + margins.left,
              top: a.yLabel,
              pointerEvents: "none",
              textAlign: a.onTheLeft ? "right" : "left",
              transform: mkTranslation(a.onTheLeft, ANNOTATION_TRIANGLE_WIDTH),
              fontFamily,
              fontSize: annotationfontSize,
              color: annotationColor,
              bg: "transparent",
              hyphens: "auto",
              wordBreak: "break-word",
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
    ? `translate3d(calc(-100% - ${offset}px), -40%, 0)`
    : `translate3d(${offset}px, -40%, 0)`;
