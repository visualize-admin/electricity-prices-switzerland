import { Box, Theme, useTheme } from "@mui/material";
import React, { forwardRef, ReactNode } from "react";
import { tss } from "tss-react/mui";

import {
  TOOLTIP_OFFSET,
  TooltipPlacement,
  TRIANGLE_SIZE,
  XPlacement,
  YPlacement,
} from "src/components/charts-generic/interaction/tooltip";
import { Margins } from "src/components/charts-generic/use-width";

type TooltipBoxProps = {
  x: number | undefined;
  y: number | undefined;
  placement: TooltipPlacement;
  margins: Margins;
  children: ReactNode;
  style?: React.HTMLAttributes<HTMLDivElement>["style"];
  interactive?: boolean;
};

export const TooltipBox = forwardRef<HTMLDivElement, TooltipBoxProps>(
  ({ x, y, placement, margins, children, style, interactive = false }, ref) => {
    const theme = useTheme();
    const triangle = mkTriangle(theme, placement);

    return (
      <Box
        ref={ref}
        style={{
          width: "fit-content",
          zIndex: 2,
          position: "absolute",
          left: x! + margins.left,
          top: mxYOffset(y!, placement) + margins.top,
          pointerEvents: interactive ? "all" : "none",
          transform: mkTranslation(placement),
          boxShadow: theme.shadows[4],
          ...style,
        }}
      >
        <Box
          sx={{
            padding: 3,
            pointerEvents: interactive ? "all" : "none",
            bgcolor: theme.palette.background.paper,
            filter: `drop-shadow(${theme.shadows[6]})`,

            "&::before": {
              content: "''",
              display: "block",
              position: "absolute",
              pointerEvents: interactive ? "all" : "none",
              zIndex: -1,
              width: 0,
              height: 0,
              borderStyle: "solid",
              ...triangle,
            },
          }}
        >
          {children}
        </Box>
      </Box>
    );
  }
);

const useTooltipStyles = tss
  .withParams<{
    placement: TooltipPlacement;
  }>()
  .create(({ theme, placement }) => {
    const triangle = mkTriangle(theme, placement);
    return {
      tooltipContainer: {
        width: "fit-content",
        zIndex: theme.zIndex.tooltip,
        position: "absolute",
        pointerEvents: "none",
        boxShadow: theme.shadows[4],
      },
      tooltipBox: {
        padding: theme.spacing(3, 4),
        borderRadius: 0.5,
        pointerEvents: "none" as const,
        backgroundColor: theme.palette.background.paper,
        filter: `drop-shadow(${theme.shadows?.[6]})`,

        "&::before": {
          content: "''",
          display: "block",
          position: "absolute",
          pointerEvents: "none",
          zIndex: -1,
          width: 0,
          height: 0,
          borderStyle: "solid",
          top: triangle.top,
          right: triangle.right,
          bottom: triangle.bottom,
          left: triangle.left,
          borderWidth: triangle.borderWidth,
          borderTopColor: triangle.borderTopColor,
          borderRightColor: triangle.borderRightColor,
          borderBottomColor: triangle.borderBottomColor,
          borderLeftColor: triangle.borderLeftColor,
        },
      },
    };
  });

export const TooltipBoxWithoutChartState = ({
  x,
  y,
  placement,
  margins,
  children,
}: TooltipBoxProps) => {
  const theme = useTheme();
  const { classes } = useTooltipStyles({ placement });

  return (
    <Box
      className={classes.tooltipContainer}
      style={{
        left: x! + margins.left,
        top: mxYOffset(y!, placement) + margins.top,
        transform: mkTranslation(placement),
      }}
    >
      <Box className={classes.tooltipBox}>{children}</Box>
    </Box>
  );
};

// tooltip anchor position
const mxYOffset = (yAnchor: number, p: TooltipPlacement) =>
  p.y === "top"
    ? yAnchor - TRIANGLE_SIZE - TOOLTIP_OFFSET
    : p.y === "bottom"
    ? yAnchor + TRIANGLE_SIZE + TOOLTIP_OFFSET
    : yAnchor;

// tooltip translation
const mkTranslation = (p: TooltipPlacement) =>
  `translate3d(${mkXTranslation(p.x, p.y)}, ${mkYTranslation(p.y)}, 0)`;

type XTranslation = "-100%" | "-50%" | 0 | string;
type YTranslation = "-100%" | "-50%" | 0;
const mkXTranslation = (xP: XPlacement, yP: YPlacement): XTranslation => {
  if (yP !== "middle") {
    return xP === "left" ? "-100%" : xP === "center" ? "-50%" : 0;
  } else {
    return xP === "left"
      ? `calc(-100% - ${TRIANGLE_SIZE + TOOLTIP_OFFSET}px)`
      : xP === "center"
      ? "-50%"
      : `${TRIANGLE_SIZE + TOOLTIP_OFFSET}px`;
  }
};
const mkYTranslation = (yP: YPlacement): YTranslation =>
  yP === "top" ? "-100%" : yP === "middle" ? "-50%" : 0;

// triangle position
const mkTriangle = (theme: Theme, p: TooltipPlacement) => {
  switch (true) {
    case p.x === "right" && p.y === "bottom":
      return {
        left: 0,
        right: "unset",
        bottom: "unset",
        top: `-${TRIANGLE_SIZE}px`,
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderTopColor: `transparent`,
        borderRightColor: `transparent`,
        borderBottomColor: theme.palette.background.paper,
        borderLeftColor: theme.palette.background.paper,
      };
    case p.x === "center" && p.y === "bottom":
      return {
        left: `calc(50% - ${TRIANGLE_SIZE}px)`,
        right: "unset",
        bottom: "unset",
        top: `-${TRIANGLE_SIZE}px`,
        borderWidth: `0 ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderTopColor: `transparent`,
        borderRightColor: `transparent`,
        borderBottomColor: theme.palette.background.paper,
        borderLeftColor: `transparent`,
      };
    case p.x === "left" && p.y === "bottom":
      return {
        left: `calc(100% - ${TRIANGLE_SIZE * 2}px)`,
        right: "unset",
        bottom: "unset",
        top: `-${TRIANGLE_SIZE}px`,
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderTopColor: `transparent`,
        borderRightColor: theme.palette.background.paper,
        borderBottomColor: theme.palette.background.paper,
        borderLeftColor: `transparent`,
      };
    // triangle position downwards pointing (placement "top")
    case p.x === "right" && p.y === "top":
      return {
        left: 0,
        right: "unset",
        bottom: `-${TRIANGLE_SIZE}px`,
        top: "unset",
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderTopColor: theme.palette.background.paper,
        borderRightColor: `transparent`,
        borderBottomColor: `transparent`,
        borderLeftColor: theme.palette.background.paper,
      };
    case p.x === "center" && p.y === "top":
      return {
        left: `calc(50% - ${TRIANGLE_SIZE}px)`,
        right: "unset",
        bottom: `-${TRIANGLE_SIZE}px`,
        top: "unset",
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px 0 ${TRIANGLE_SIZE}px`,
        borderTopColor: theme.palette.background.paper,
        borderRightColor: `transparent`,
        borderBottomColor: `transparent`,
        borderLeftColor: `transparent`,
      };
    case p.x === "left" && p.y === "top":
      return {
        left: `calc(100% - ${TRIANGLE_SIZE * 2}px)`,
        right: "unset",
        bottom: `-${TRIANGLE_SIZE}px`,
        top: "unset",
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderTopColor: theme.palette.background.paper,
        borderRightColor: theme.palette.background.paper,
        borderBottomColor: `transparent`,
        borderLeftColor: `transparent`,
      };
    // triangle pointing towards the side (left /right) (placement "middle")
    case p.x === "left" && p.y === "middle":
      return {
        left: "100%",
        right: "unset",
        bottom: "unset",
        top: `calc(50% - ${TRIANGLE_SIZE}px)`,
        borderWidth: `${TRIANGLE_SIZE}px 0 ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderTopColor: `transparent`,
        borderRightColor: `transparent`,
        borderBottomColor: `transparent`,
        borderLeftColor: `background.paper`,
      };
    case p.x === "right" && p.y === "middle":
      return {
        left: `${-TRIANGLE_SIZE}px`,
        right: "unset",
        bottom: "unset",
        top: `calc(50% - ${TRIANGLE_SIZE}px)`,
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px 0`,
        borderTopColor: `transparent`,
        borderRightColor: `background.paper`,
        borderBottomColor: `transparent`,
        borderLeftColor: `transparent`,
      };
    case p.x === "center" && p.y === "middle":
      return {
        left: `${-TRIANGLE_SIZE}px`,
        right: "unset",
        bottom: "unset",
        top: `calc(50% - ${TRIANGLE_SIZE}px)`,
        borderWidth: 0,
        borderTopColor: `transparent`,
        borderRightColor: `transparent`,
        borderBottomColor: `transparent`,
        borderLeftColor: `transparent`,
      };
    default:
      return {
        left: `calc(100% - ${TRIANGLE_SIZE * 2}px)`,
        right: "unset",
        bottom: `-${TRIANGLE_SIZE}px`,
        top: "unset",
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderTopColor: `background.paper`,
        borderRightColor: `background.paper`,
        borderBottomColor: `transparent`,
        borderLeftColor: `transparent`,
      };
  }
};
