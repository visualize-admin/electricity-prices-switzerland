import { Box, BoxProps, Theme } from "@mui/material";
import React, { forwardRef, ReactNode } from "react";
import { createPortal } from "react-dom";
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

type TooltipChromeProps = {
  placement: TooltipPlacement;
  children: ReactNode;
  interactive?: boolean;
  sx?: BoxProps["sx"];
};

export const TooltipBox = forwardRef<HTMLDivElement, TooltipChromeProps>(
  ({ placement, children, interactive = false, sx }, ref) => {
    const { classes } = useTooltipStyles({ placement });

    return (
      <Box
        ref={ref}
        className={classes.tooltipBox}
        sx={{
          pointerEvents: interactive ? "all" : "none",
          ...sx,
          "&::before": {
            pointerEvents: interactive ? "all" : "none",
          },
        }}
      >
        {children}
      </Box>
    );
  }
);

export const TooltipBoxPositioned = forwardRef<HTMLDivElement, TooltipBoxProps>(
  ({ x, y, placement, margins, children, style, interactive = false }, ref) => {
    const { classes } = useTooltipStyles({ placement, position: "fixed" });

    const [anchorBounds, setAnchorBounds] = React.useState<DOMRect | null>(
      null
    );
    const anchorRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (!anchorRef.current) return;

      const updateBounds = () => {
        if (anchorRef.current) {
          setAnchorBounds(anchorRef.current.getBoundingClientRect());
        }
      };

      updateBounds();

      const resizeObserver = new ResizeObserver(updateBounds);
      resizeObserver.observe(anchorRef.current);

      return () => resizeObserver.disconnect();
    }, [x, y]);

    const tooltipLeft = anchorBounds ? anchorBounds.left + (x ?? 0) : 0;
    const tooltipTop = anchorBounds
      ? anchorBounds.top + mxYOffset(y ?? 0, placement)
      : 0;

    return (
      <>
        <div
          ref={anchorRef}
          style={{
            position: "absolute",
            left: margins.left,
            width: "100%",
            top: margins.top,
            pointerEvents: "none",
          }}
        />
        {anchorBounds &&
          createPortal(
            <Box
              ref={ref}
              className={classes.tooltipContainer}
              style={{
                maxWidth: anchorBounds ? anchorBounds.width : undefined,
                left: tooltipLeft,
                top: tooltipTop,
                pointerEvents: interactive ? "all" : "none",
                transform: mkTranslation(placement),
                ...style,
              }}
            >
              <TooltipBox placement={placement} interactive={interactive}>
                {children}
              </TooltipBox>
            </Box>,
            document.body
          )}
      </>
    );
  }
);

const useTooltipStyles = tss
  .withParams<{
    placement: TooltipPlacement;
    position?: "absolute" | "fixed";
  }>()
  .create(({ theme, placement, position = "absolute" }) => {
    const triangle = mkTriangle(theme, placement);
    return {
      tooltipContainer: {
        width: "fit-content",
        zIndex: theme.zIndex.tooltip,
        position,
        pointerEvents: "none",
        boxShadow: theme.shadows[4],

        // Hide tooltip when scroll is locked (e.g. on mobile when a modal is open)
        "[data-scroll-locked] &": {
          display: "none",
        },
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
        borderLeftColor: theme.palette.background.paper,
      };
    case p.x === "right" && p.y === "middle":
      return {
        left: `${-TRIANGLE_SIZE}px`,
        right: "unset",
        bottom: "unset",
        top: `calc(50% - ${TRIANGLE_SIZE}px)`,
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px 0`,
        borderTopColor: `transparent`,
        borderRightColor: theme.palette.background.paper,
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
        borderTopColor: theme.palette.background.paper,
        borderRightColor: theme.palette.background.paper,
        borderBottomColor: `transparent`,
        borderLeftColor: `transparent`,
      };
  }
};
