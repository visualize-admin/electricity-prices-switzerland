import { Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import React, { Fragment, ReactNode } from "react";

import { TooltipPlacement } from "src/components/charts-generic/interaction/tooltip";
import { TooltipBoxWithoutChartState } from "src/components/charts-generic/interaction/tooltip-box";
import ValueChip from "src/components/value-chip";

/** Tooltip inner width; keep in sync with `maxWidth` clamp below. */
const MAP_TOOLTIP_WIDTH_PX = 280;

export const SelectedEntityCard: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  caption: React.ReactNode;
  values: {
    label: React.ReactNode;
    unit?: React.ReactNode;
    formattedValue: string;
    color: string | undefined;
  }[];
}> = ({ title, subtitle, caption, values }) => (
  <Box
    display="flex"
    flexDirection="column"
    gap={1}
    sx={{ minWidth: 0, overflow: "hidden" }}
  >
    <Box
      display="flex"
      flexDirection="column"
      sx={{ minWidth: 0, overflow: "hidden", lineHeight: 1.5 }}
    >
      <Typography variant="caption" color="text.secondary" component="div">
        {caption}
      </Typography>
      <Typography
        variant="body1"
        fontWeight={700}
        color="text.primary"
        component="div"
        sx={{ fontSize: (t) => t.typography.pxToRem(16), lineHeight: 1.5 }}
      >
        {title}
      </Typography>
    </Box>

    {subtitle ? (
      <Box
        sx={{
          minWidth: 0,
          typography: "body3",
          lineHeight: 1.5,
          color: "text.primary",
          fontSize: (t) => t.typography.pxToRem(14),
        }}
      >
        {subtitle}
      </Box>
    ) : null}

    {values && values.length > 0 ? (
      <Box
        display="grid"
        width="100%"
        gridTemplateColumns="minmax(0, 1fr) minmax(0, max-content)"
        columnGap={0.5}
        rowGap="9px"
        alignItems="center"
        sx={{ minWidth: 0 }}
      >
        {values.map((d, i) => {
          const showUnit =
            d.unit != null &&
            d.unit !== "" &&
            !(typeof d.unit === "string" && d.unit.trim() === "");
          return (
            <Fragment key={i}>
              <Box
                sx={{
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "baseline",
                  gap: 0.25,
                  overflow: "hidden",
                }}
              >
                <Typography
                  variant="caption"
                  component="span"
                  color="text.primary"
                  noWrap
                  sx={{ minWidth: 0, lineHeight: 1.5 }}
                >
                  {d.label}
                </Typography>
                {showUnit ? (
                  <Typography
                    variant="caption"
                    component="span"
                    color="text.secondary"
                    sx={{ flexShrink: 0, lineHeight: 1.5 }}
                  >
                    ({d.unit})
                  </Typography>
                ) : null}
              </Box>
              <ValueChip color={d.color} formattedValue={d.formattedValue} />
            </Fragment>
          );
        })}
      </Box>
    ) : (
      <Typography variant="caption" color="secondary.main">
        <Trans id="map.tooltipnodata">No data</Trans>
      </Typography>
    )}
  </Box>
);

export const defaultMapTooltipPlacement = { x: "center", y: "top" } as const;

export const MapTooltip = ({
  x,
  y,
  children,
  placement = defaultMapTooltipPlacement,
}: {
  x: number;
  y: number;
  children: ReactNode;
  placement?: TooltipPlacement;
}) => {
  return (
    <TooltipBoxWithoutChartState
      x={x}
      y={y - 20}
      placement={placement ?? defaultMapTooltipPlacement}
      margins={{ bottom: 0, left: 0, right: 0, top: 0 }}
      boxSx={{
        width: MAP_TOOLTIP_WIDTH_PX,
        maxWidth: `min(${MAP_TOOLTIP_WIDTH_PX}px, 90vw)`,
        boxSizing: "border-box",
        px: 2,
        py: 1.5,
      }}
    >
      <Box
        display="flex"
        width="100%"
        flexDirection="column"
        gap={1}
        sx={{ overflow: "hidden", minWidth: 0 }}
      >
        {children}
      </Box>
    </TooltipBoxWithoutChartState>
  );
};
