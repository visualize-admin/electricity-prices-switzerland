import { Menu, MenuProps, PaperProps, Theme } from "@mui/material";

import { TRIANGLE_SIZE } from "src/components/charts-generic/interaction/tooltip";

const arrowSx = (theme: Theme): PaperProps["sx"] => ({
  overflow: "visible",
  marginBottom: `${TRIANGLE_SIZE + 8}px`,
  "&::before": {
    content: "''",
    display: "block",
    position: "absolute",
    bottom: -TRIANGLE_SIZE,
    left: "50%",
    transform: "translateX(-50%)",
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px 0 ${TRIANGLE_SIZE}px`,
    borderTopColor: theme.palette.background.paper,
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
  },
});

/**
 * A MUI Menu that opens above its anchor element and sports a downward-pointing
 * arrow centered on the bottom edge of the paper — matching the TooltipBox style.
 *
 * Accepts the full Menu API; callers can add content-specific paper styles via
 * slotProps.paper.sx (merged on top of the structural styles defined here).
 */
export const TooltipMenu = ({ slotProps, ...props }: MenuProps) => {
  const callerPaperSx = (slotProps?.paper as PaperProps | undefined)?.sx;

  return (
    <Menu
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      transformOrigin={{ vertical: "bottom", horizontal: "center" }}
      {...props}
      slotProps={{
        ...slotProps,
        paper: {
          ...(slotProps?.paper as PaperProps | undefined),
          sx: [arrowSx, ...(Array.isArray(callerPaperSx) ? callerPaperSx : callerPaperSx ? [callerPaperSx] : [])],
        },
      }}
    />
  );
};
