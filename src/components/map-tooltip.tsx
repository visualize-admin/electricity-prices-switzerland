import { Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import React, { Fragment, ReactNode } from "react";

import { TooltipBoxWithoutChartState } from "src/components/charts-generic/interaction/tooltip-box";
import { getContrastColor } from "src/domain/helpers";

export const MapTooltipContent: React.FC<{
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
      sx={{
        flexDirection: "column",
        gap: -1,
      }}
      display={"flex"}
    >
      <Typography variant="caption" color={"text.500"}>
        {caption}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
    </Box>

    {values && values.length > 0 ? (
      <Box
        display="grid"
        sx={{
          width: "100%",
          gridTemplateColumns: "1fr auto",
          gap: 1,
          alignItems: "center",
        }}
      >
        <>
          {values.map((d, i) => {
            return (
              <Fragment key={i}>
                <Typography variant="caption">{d.label}</Typography>
                <Box
                  sx={{
                    borderRadius: 9999,
                    px: 2,
                    display: "flex",
                    // lineHeight: 1,
                    alignItems: "center",
                    justifyContent: "flex-end",
                    height: "24px",
                  }}
                  style={{ background: d.color }}
                >
                  <Typography
                    variant="caption"
                    style={{
                      color: getContrastColor(d.color),
                    }}
                  >
                    {d.formattedValue}
                  </Typography>
                </Box>
              </Fragment>
            );
          })}
        </>
      </Box>
    ) : (
      <Typography variant="caption" sx={{ color: "secondary.main" }}>
        <Trans id="map.tooltipnodata">No data</Trans>
      </Typography>
    )}
  </>
);

export const MapTooltip = ({
  x,
  y,
  children,
}: {
  x: number;
  y: number;
  children: ReactNode;
}) => {
  return (
    <TooltipBoxWithoutChartState
      x={x}
      y={y - 20}
      placement={{ x: "center", y: "top" }}
      margins={{ bottom: 0, left: 0, right: 0, top: 0 }}
    >
      <Box
        sx={{ width: 200, flexDirection: "column", gap: 1 }}
        display={"flex"}
      >
        {children}
      </Box>
    </TooltipBoxWithoutChartState>
  );
};
