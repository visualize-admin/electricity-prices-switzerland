import { Trans } from "@lingui/macro";
import { Box, Stack, Typography } from "@mui/material";
import { ScaleThreshold } from "d3";
import { Fragment } from "react";

import Flex from "src/components/flex";
import { useFormatCurrency } from "src/domain/helpers";
import { OperatorObservationFieldsFragment } from "src/graphql/queries";

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

export const MapTooltipContent: React.FC<{
  colorScale: ScaleThreshold<number, string>;
  hovered: MapHoverState;
  tooltipContent: {
    id: string;
    name: string;
    observations: OperatorObservationFieldsFragment[] | undefined;
  };
}> = ({ colorScale, hovered, tooltipContent }) => {
  const formatNumber = useFormatCurrency();
  if (!tooltipContent) {
    return null;
  }
  return (
    <>
      <Box
        display="grid"
        sx={{
          width: "100%",
          gridTemplateColumns: "1fr auto",
          gap: 1,
          alignItems: "center",
        }}
      >
        <Typography variant="meta" sx={{ fontWeight: "bold" }}>
          {tooltipContent.name}
        </Typography>

        {hovered && hovered.type === "canton" ? (
          <>
            <Box
              sx={{
                borderRadius: 99999,
                px: 2,
                display: "inline-block",
              }}
              style={{
                background: colorScale(hovered.value),
              }}
            >
              <Typography variant="meta">
                {formatNumber(hovered.value)}
              </Typography>
            </Box>
          </>
        ) : null}
      </Box>
      <Box
        display="grid"
        sx={{
          width: "100%",
          gridTemplateColumns: "1fr auto",
          gap: 1,
          alignItems: "center",
        }}
      >
        {hovered.type === "municipality" ? (
          <>
            {tooltipContent.observations ? (
              tooltipContent.observations.map((d, i) => {
                return (
                  <Fragment key={i}>
                    <Typography variant="meta" sx={{}}>
                      {d.operatorLabel}
                    </Typography>
                    <Box
                      sx={{
                        borderRadius: 99999,
                        px: 2,
                        display: "inline-block",
                      }}
                      style={{ background: colorScale(d.value) }}
                    >
                      <Typography variant="meta">
                        {formatNumber(d.value)}
                      </Typography>
                    </Box>
                  </Fragment>
                );
              })
            ) : (
              <Typography variant="meta" sx={{ color: "secondary" }}>
                <Trans id="map.tooltipnodata">Keine Daten</Trans>
              </Typography>
            )}
          </>
        ) : null}
      </Box>
    </>
  );
};
