import { Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import React, { Fragment, ReactNode } from "react";

import { TooltipPlacement } from "src/components/charts-generic/interaction/tooltip";
import { TooltipBoxWithoutChartState } from "src/components/charts-generic/interaction/tooltip-box";
import ValueChip from "src/components/value-chip";

export const SelectedEntityCard: React.FC<{
  title: React.ReactNode;
  caption: React.ReactNode;
  values: {
    label: React.ReactNode;
    formattedValue: string;
    color: string | undefined;
  }[];
}> = ({ title, caption, values }) => (
  <>
    <Box
      display="flex"
      flexDirection="column"
      gap={-1}
      sx={{ minWidth: 0, overflow: "hidden" }}
    >
      <Typography variant="caption" color={"text.500"}>
        {caption}
      </Typography>
      <Typography variant="h5" fontWeight={700} sx={{ overflow: "hidden" }}>
        {title}
      </Typography>
    </Box>

    {values && values.length > 0 ? (
      <Box
        display="grid"
        width="100%"
        gridTemplateColumns="minmax(0, 1fr) minmax(0, max-content)"
        gap={1}
        alignItems="center"
        sx={{ minWidth: 0 }}
      >
        {values.map((d, i) => {
          return (
            <Fragment key={i}>
              <Typography variant="caption" sx={{ minWidth: 0, overflow: "hidden" }}>
                {d.label}
              </Typography>
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
  </>
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
    >
      <Box
        display="flex"
        width={240}
        maxWidth="min(240px, 90vw)"
        flexDirection="column"
        gap={1}
        sx={{ overflow: "hidden", minWidth: 0 }}
      >
        {children}
      </Box>
    </TooltipBoxWithoutChartState>
  );
};
