import { Box, useMediaQuery, useTheme } from "@mui/material";
import * as React from "react";

import { DOT_RADIUS } from "src/components/charts-generic/rangeplot/rangeplot-state";
import {
  HistogramState,
  RangePlotState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import { GenericObservation } from "src/domain/data";
import { getLocalizedLabel } from "src/domain/translation";

const ANNOTATION_DOT_RADIUS = 2.5;
const ANNOTATION_TRIANGLE_WIDTH = 5;
export const ANNOTATION_TRIANGLE_HEIGHT = ANNOTATION_TRIANGLE_WIDTH * 1.5;

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
    annotationFontSize,
    annotationLabelUnderlineColor,
  } = useChartTheme();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <>
      {annotations &&
        annotations.map((a, i) => {
          const x = margins.left + a.x;
          const y1 =
            (isMobile ? margins.top / 2 + a.yLabel : a.yLabel) +
            annotationFontSize * a.nbOfLines;
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
  const { annotationFontSize, fontFamily, annotationColor } = useChartTheme();
  const { width } = bounds;

  return (
    <>
      {annotations &&
        annotations.map((a, i) => (
          <Box
            key={`${a.label}-${i}`}
            sx={{
              width: width,
              p: { xxs: 0, md: 1 },
              zIndex: 2,
              position: "absolute",
              left: 0,
              top: { xxs: bounds.margins.top / 2 + a.yLabel, md: a.yLabel },
              pointerEvents: "none",
              textAlign: "left",
              transform: `translate3d(${ANNOTATION_TRIANGLE_WIDTH}px, -40%, 0)`,
              fontFamily,
              fontSize: annotationFontSize,
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
