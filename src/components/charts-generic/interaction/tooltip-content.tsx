import { Trans } from "@lingui/macro";
import { Box, Stack, Typography } from "@mui/material";
import { ScaleThreshold } from "d3";
import React, { Fragment } from "react";

import Flex from "src/components/flex";
import { useFormatCurrency } from "src/domain/helpers";
import { OperatorObservationFieldsFragment } from "src/graphql/queries";
import { makeStyles } from "src/themes/makeStyles";

import { LegendItem, LegendSymbol } from "../legends/color";

import { TooltipValue } from "./tooltip";

// Generic
export const TooltipSingle = ({
  xValue,
  segment,
  yValue,
  color,
}: {
  xValue?: string;
  segment?: string;
  yValue?: string;
  color?: string;
}) => {
  return (
    <Stack
      display="flex"
      typography="meta"
      spacing="0.25rem"
      direction="column"
      fontWeight="normal"
      fontSize="0.75rem"
    >
      <Flex sx={{ alignItems: "center", gap: "0.25rem" }}>
        {color && <LegendSymbol color={color} symbol="square" />}
        {xValue && <Box sx={{ fontWeight: "bold" }}>{xValue}</Box>}
      </Flex>
      {segment && <div>{segment}</div>}
      {yValue && <div>{yValue}</div>}
    </Stack>
  );
};

export const TooltipMultiple = ({
  xValue,
  segmentValues,
}: {
  xValue?: string;
  segmentValues: TooltipValue[];
}) => {
  return (
    <Box>
      {xValue && (
        <Typography
          variant="meta"
          sx={{ fontWeight: "bold", fontSize: "0.75rem" }}
        >
          {xValue}
        </Typography>
      )}
      {segmentValues.map((segment, i) =>
        segment.color ? (
          <LegendItem
            key={i}
            item={`${segment.label}: ${segment.value}`}
            color={segment.color}
            symbol="square"
          />
        ) : null
      )}
    </Box>
  );
};

// Chart Specific
export const TooltipHistogram = ({
  firstLine,
  secondLine,
  thirdLine,
}: {
  firstLine?: string;
  secondLine?: string;
  thirdLine?: string;
}) => {
  return (
    <Box>
      {firstLine && (
        <Typography
          variant="meta"
          sx={{ fontWeight: "bold", fontSize: "0.85rem" }}
        >
          {firstLine}
        </Typography>
      )}
      {secondLine && <Typography variant="meta">{secondLine}</Typography>}
      {thirdLine && <Typography variant="meta">{thirdLine}</Typography>}
    </Box>
  );
};

const useStyles = makeStyles()(({ spacing: s }) => ({
  mapTooltipGrid: {
    width: "100%",
    gridTemplateColumns: "1fr auto",
    columnGap: s(2),
    rowGap: s(1),
    alignItems: "center",
  },
}));

export type MapHoverState =
  | {
      x: number;
      y: number;
      id: string;
      type: "municipality";
    }
  | {
      x: number;
      y: number;
      id: string;
      type: "canton";
      value: number;
      label: string;
    };

const TooltipChip = ({
  background,
  children,
}: {
  background: string;
  children: React.ReactNode;
}) => {
  return (
    <Box
      typography="caption"
      sx={{
        borderRadius: 99999,
        px: 2,
        fontWeight: "bold",
        display: "inline-block",
      }}
      style={{
        background,
      }}
    >
      {children}
    </Box>
  );
};

export const MapTooltipContent: React.FC<{
  colorScale: ScaleThreshold<number, string>;
  hovered: MapHoverState;
  tooltipContent: {
    id: string;
    name: string;
    observations: OperatorObservationFieldsFragment[] | undefined;
  };
}> = ({ colorScale, hovered, tooltipContent }) => {
  const { classes } = useStyles();
  const formatNumber = useFormatCurrency();
  if (!tooltipContent) {
    return null;
  }
  return (
    <>
      <Box display="grid" className={classes.mapTooltipGrid}>
        <Typography
          variant="meta"
          display="block"
          sx={{ fontWeight: "bold", mb: 2 }}
        >
          {tooltipContent.name}
        </Typography>

        {hovered && hovered.type === "canton" ? (
          <TooltipChip background={colorScale(hovered.value)}>
            {formatNumber(hovered.value)}
          </TooltipChip>
        ) : null}
      </Box>
      <Box display="grid" className={classes.mapTooltipGrid}>
        {hovered.type === "municipality" ? (
          <>
            {tooltipContent.observations ? (
              tooltipContent.observations.map((d, i) => {
                return (
                  <Fragment key={i}>
                    <Typography variant="caption">{d.operatorLabel}</Typography>
                    <TooltipChip background={colorScale(d.value)}>
                      {formatNumber(d.value)}
                    </TooltipChip>
                  </Fragment>
                );
              })
            ) : (
              <Typography
                variant="meta"
                sx={{ color: "secondary" }}
                fontSize="0.5rem"
              >
                <Trans id="map.tooltipnodata">Keine Daten</Trans>
              </Typography>
            )}
          </>
        ) : null}
      </Box>
    </>
  );
};
