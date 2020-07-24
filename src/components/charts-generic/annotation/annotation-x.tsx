import * as React from "react";
import { Box } from "theme-ui";
import { GenericObservation } from "../../../domain/data";
import { HistogramState } from "../histogram/histogram-state";
import { RangePlotState } from "../rangeplot/rangeplot-state";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";

export const ANNOTATION_DOT_RADIUS = 2.5;
export const ANNOTATION_SQUARE_SIDE = 8;
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
  const { annotationColor } = useChartTheme();

  return (
    <>
      {annotations &&
        annotations.map((a, i) => {
          return (
            <React.Fragment key={i}>
              <g transform={`translate(${margins.left}, 0)`}>
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
                  y2={a.y + margins.top}
                  stroke={annotationColor}
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

  const { chartWidth, margins } = bounds;
  return (
    <>
      {annotations &&
        annotations.map((a, i) => (
          <Box
            key={`${a.label}-${i}`}
            sx={{
              maxWidth: chartWidth * 0.5,
              width: "fit-content",
              p: 1,
              zIndex: 2,
              position: "absolute",
              left: a.xLabel! + margins.left,
              top: a.yLabel,
              pointerEvents: "none",
              textAlign: a.onTheLeft ? "right" : "left",
              transform: mkTranslation(a.onTheLeft, ANNOTATION_SQUARE_SIDE),
              fontFamily,
              fontSize: annotationfontSize,
              color: annotationColor,
              bg: "monochrome100",
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
