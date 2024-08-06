import * as React from "react";
import { Box } from "@mui/material";

import { GenericObservation } from "../../../domain/data";
import { getLocalizedLabel } from "../../../domain/translation";
import { DOT_RADIUS } from "../rangeplot/rangeplot-state";
import {
  HistogramState,
  RangePlotState,
  useChartState,
} from "../use-chart-state";
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
  nbOfLines: number;
  value: string;
  label: string;
  onTheLeft: boolean;
}

export const AnnotationX = () => {
  const { bounds, annotations } = useChartState() as
    | RangePlotState
    | HistogramState;

  const { margins } = bounds;
  const {
    annotationLineColor,
    annotationColor,
    annotationfontSize,
    annotationLabelUnderlineColor,
  } = useChartTheme();

  return (
    <>
      {annotations &&
        annotations.map((a, i) => {
          const x = margins.left + a.x;
          const y1 = a.yLabel + annotationfontSize * a.nbOfLines;
          return (
            <React.Fragment key={i}>
              <g transform={`translate(0, 0)`}>
                <line
                  x1={x}
                  y1={y1}
                  x2={x}
                  y2={
                    a.y + margins.top + (margins.annotations ?? 0) + DOT_RADIUS
                  }
                  stroke={annotationLineColor}
                />
                <line
                  x1={0}
                  y1={y1 + 0.5}
                  x2={x}
                  y2={y1 + 0.5}
                  stroke={annotationLabelUnderlineColor}
                  strokeDasharray="2px 4px"
                />
                <polygon
                  points={`${x - ANNOTATION_TRIANGLE_WIDTH},${y1} ${
                    x + ANNOTATION_TRIANGLE_WIDTH
                  },${y1} ${x},${y1 + ANNOTATION_TRIANGLE_HEIGHT} `}
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
              <g
                transform={`translate(${margins.left}, ${
                  margins.top + (margins.annotations ?? 0)
                })`}
              >
                {/* Data Point indicator */}
                <circle
                  cx={a.x}
                  cy={a.y + DOT_RADIUS}
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

  const { width } = bounds;
  return (
    <>
      {annotations &&
        annotations.map((a, i) => (
          <Box
            key={`${a.label}-${i}`}
            sx={{
              width: width,
              p: 1,
              zIndex: 2,
              position: "absolute",
              left: 0,
              top: a.yLabel,
              pointerEvents: "none",
              textAlign: "left",
              transform: `translate3d(${ANNOTATION_TRIANGLE_WIDTH}px, -40%, 0)`,
              fontFamily,
              fontSize: annotationfontSize,
              color: annotationColor,
              bgcolor: "transparent",
              hyphens: "auto",
              wordBreak: "break-word",
            }}
          >
            <Box component="span" sx={{ fontWeight: "bold" }}>
              {a.value} {getLocalizedLabel({ id: "unit" })}{" "}
            </Box>
            {a.label}
          </Box>
        ))}
    </>
  );
};
