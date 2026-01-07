import { Box } from "@mui/material";
import * as React from "react";

import { DOT_RADIUS } from "src/components/charts-generic/rangeplot/rangeplot-state";
import {
  HistogramState,
  RangePlotState,
  StackedBarsState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import { GenericObservation } from "src/domain/data";

const ANNOTATION_DOT_RADIUS = 2.5;
const ANNOTATION_TRIANGLE_WIDTH = 5;
export const ANNOTATION_TRIANGLE_HEIGHT = ANNOTATION_TRIANGLE_WIDTH * 1.5;

export interface Annotation {
  datum?: GenericObservation;
  x: number;
  y: number;
  xLabel: number;
  yLabel: number;
  nbOfLines: number;
  value: string;
  label: string;
  onTheLeft?: boolean;
}

const AnnotationLine = ({
  x,
  y1,
  y2,
  annotationLineColor,
  annotationLabelUnderlineColor,
  annotationColor,
}: {
  x: number;
  y1: number;
  y2: number;
  annotationLineColor: string;
  annotationLabelUnderlineColor: string;
  annotationColor: string;
}) => (
  <g transform={`translate(0, 0)`}>
    <line x1={x} y1={y1} x2={x} y2={y2} stroke={annotationLineColor} />
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
);

export const AnnotationX = () => {
  const { bounds, annotations } = useChartState() as
    | RangePlotState
    | HistogramState
    | StackedBarsState;
  const { margins } = bounds;
  const {
    annotationLineColor,
    annotationColor,
    annotationFontSize,
    annotationLabelUnderlineColor,
  } = useChartTheme();

  const chartState = useChartState() as
    | HistogramState
    | RangePlotState
    | StackedBarsState;
  const bandScale =
    "bandScale" in chartState ? chartState.bandScale : undefined;
  const binMeta = "binMeta" in chartState ? chartState.binMeta : undefined;
  const groupedBy =
    "groupedBy" in chartState ? chartState.groupedBy : undefined;
  const getX = "getX" in chartState ? chartState.getX : undefined;

  return (
    <>
      {annotations?.map((a, i) => {
        let x = a.x;
        if (bandScale && binMeta && groupedBy && getX && a.datum) {
          const value = getX(a.datum);
          const bin =
            binMeta.find(
              (b) => !b.isNoData && value >= b.x0 && value <= b.x1
            ) || binMeta[0];
          if (bin?.label) {
            x = (bandScale(bin.label) ?? 0) + bandScale.bandwidth() / 2;
          }
        }
        x = margins.left + x;
        const y1 = a.yLabel + annotationFontSize * a.nbOfLines;
        return (
          <React.Fragment key={i}>
            <AnnotationLine
              x={x}
              y1={y1}
              y2={a.y + margins.top + (margins.annotations ?? 0) + DOT_RADIUS}
              annotationLineColor={annotationLineColor}
              annotationLabelUnderlineColor={annotationLabelUnderlineColor}
              annotationColor={annotationColor}
            />
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
      {annotations?.map((a, i) => {
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
  const { bounds, annotations, xAxisLabel } = useChartState() as
    | RangePlotState
    | HistogramState
    | StackedBarsState;
  const { annotationFontSize, fontFamily, annotationColor } = useChartTheme();
  const { width } = bounds;

  return (
    <>
      {annotations?.map((a, i) => (
        <Box
          key={`${a.label}-${i}`}
          sx={{
            width: width,
            zIndex: 2,
            position: "absolute",
            left: 0,
            top: a.yLabel,
            pointerEvents: "none",
            textAlign: "left",
            transform: `translate3d(${ANNOTATION_TRIANGLE_WIDTH}px, -40%, 0)`,
            fontFamily,
            fontSize: annotationFontSize,
            color: annotationColor,
            bgcolor: "transparent",
            hyphens: "auto",
            wordBreak: "break-word",
            lineHeight: 1.5,
          }}
        >
          <Box component="span" sx={{ fontWeight: 700 }}>
            {a.value} {xAxisLabel}{" "}
          </Box>
          {a.label}
        </Box>
      ))}
    </>
  );
};
