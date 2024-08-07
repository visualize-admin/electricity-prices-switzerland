import { Trans, t } from "@lingui/macro";
import { Box, BoxProps } from "@mui/material";
import { useTheme, Typography } from "@mui/material";
import React, { useState } from "react";

import { useFormatCurrency } from "../domain/helpers";
import { IconClear } from "../icons/ic-clear";
import { IconInfo } from "../icons/ic-info";

import { InfoDialogButton } from "./info-dialog";

const LEGEND_WIDTH = 215;
const TOP_LABEL_HEIGHT = 14;
const COLOR_HEIGHT = 12;
const BOTTOM_LABEL_HEIGHT = 16;

const LegendBox = ({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: BoxProps["sx"];
}) => {
  return (
    <Box
      sx={{
        zIndex: 13,
        bgcolor: "rgba(245, 245, 245, 0.8)",
        borderRadius: 1,
        height: "fit-content",
        px: 4,
        py: 2,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};
export const MapPriceColorLegend = ({
  stats,
}: {
  stats: [number | undefined, number | undefined, number | undefined];
}) => {
  const formatCurrency = useFormatCurrency();
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <LegendBox sx={{ width: "auto" }}>
        <Box
          onClick={() => setOpen(true)}
          sx={{
            cursor: "pointer",
            flexGrow: 1,
            justifyContent: "flex-end",
          }}
          display="flex"
        >
          <IconInfo color="#333" />
        </Box>
      </LegendBox>
    );
  }
  return (
    <LegendBox>
      <Box sx={{ alignItems: "center", width: "100%" }} display="flex">
        <Typography
          variant="inherit"
          sx={{ fontSize: "0.625rem", lineHeight: 1.5, mr: 1 }}
        >
          <Trans id="map.legend.title">
            Tarifvergleich in Rp./kWh (Angaben exkl. MwSt.)
          </Trans>
        </Typography>
        <InfoDialogButton
          smaller
          iconOnly
          slug="help-price-comparison"
          label={t({ id: "help.price-comparison", message: `Tarifvergleich` })}
        />
        <Box
          onClick={() => setOpen(false)}
          sx={{
            display: ["flex", "none"],
            cursor: "pointer",
            flexGrow: 1,
            justifyContent: "flex-end",
          }}
        >
          <IconClear size={16} color="#666" />
        </Box>
      </Box>
      <Box
        sx={{
          mt: 1,
          width: LEGEND_WIDTH,
        }}
      >
        <Box
          sx={{
            justifyContent: "space-between",
            color: "text",
            fontSize: "0.625rem",
            lineHeight: 1.5,
            height: TOP_LABEL_HEIGHT,
            pointerEvents: "none",
          }}
          display="flex"
        >
          <Typography
            variant="inherit"
            sx={{ flex: "1 1 0px", display: "flex" }}
          >
            {stats[0] && formatCurrency(stats[0])}
          </Typography>
          <Typography
            variant="inherit"
            sx={{ flex: "1 1 0px", textAlign: "center" }}
          >
            {stats[1] && formatCurrency(stats[1])}
          </Typography>
          <Typography
            variant="inherit"
            sx={{ flex: "1 1 0px", textAlign: "right" }}
          >
            {stats[2] && formatCurrency(stats[2])}
          </Typography>
        </Box>
        <Box
          sx={{
            justifyContent: "space-between",
            color: "grey.600",
            fontSize: "0.625rem",
            mb: 2,
          }}
          display="flex"
        >
          <Typography variant="inherit" sx={{ flex: "1 1 0px" }}>
            <Trans id="price.legend.min">min</Trans>
          </Typography>
          <Typography
            variant="inherit"
            sx={{ flex: "1 1 0px", textAlign: "center" }}
          >
            <Trans id="price.legend.median">median</Trans>
          </Typography>
          <Typography
            variant="inherit"
            sx={{ flex: "1 1 0px", textAlign: "right" }}
          >
            <Trans id="price.legend.max">max</Trans>
          </Typography>
        </Box>

        <ColorsLine />
      </Box>
    </LegendBox>
  );
};

export const PriceColorLegend = () => {
  return (
    <Box
      sx={{
        width: LEGEND_WIDTH,
        zIndex: 13,
        borderRadius: 1,
        height: "fit-content",
        pl: 4,
        py: 2,
      }}
    >
      <Box
        sx={{
          justifyContent: "space-between",
          color: "grey.600",
          fontSize: "0.625rem",
          mb: 2,
        }}
        display="flex"
      >
        <Typography variant="inherit" sx={{ flex: "1 1 0px" }}>
          <Trans id="price.legend.min">min</Trans>
        </Typography>
        <Typography
          variant="inherit"
          sx={{ flex: "1 1 0px", textAlign: "center" }}
        >
          <Trans id="price.legend.median">median</Trans>
        </Typography>
        <Typography
          variant="inherit"
          sx={{ flex: "1 1 0px", textAlign: "right" }}
        >
          <Trans id="price.legend.max">max</Trans>
        </Typography>
      </Box>

      <ColorsLine />
    </Box>
  );
};

export const ColorsLine = () => {
  const { palette } = useTheme();
  return (
    <Box
      sx={{ height: COLOR_HEIGHT + BOTTOM_LABEL_HEIGHT, position: "relative" }}
      data-name="color-line"
      display="flex"
    >
      <Box
        sx={{
          position: "absolute",
          left: "50%",
          width: 0,
          borderLeft: "1px dashed",
          borderLeftColor: "text",
          height: COLOR_HEIGHT * 1.5,
          overflowY: "visible",
          zIndex: 14,
          transform: "translateY(-15%)",
        }}
      ></Box>
      <Box
        sx={{
          width: 0,
          height: 0,
          borderTop: `${COLOR_HEIGHT / 2}px solid transparent`,
          borderBottom: `${COLOR_HEIGHT / 2}px solid transparent`,
          borderRight: `${COLOR_HEIGHT / 2}px solid  ${palette.diverging[0]}`,
        }}
      />
      <Box
        display="grid"
        sx={{
          gridTemplateColumns: ".8fr 1fr 1fr 1fr .8fr",
          columnGap: 0,
          height: COLOR_HEIGHT + BOTTOM_LABEL_HEIGHT,
          width: "100%",
        }}
      >
        {palette.diverging.map((bg, i) => (
          <Box
            key={bg}
            sx={{
              flexDirection: "column",
              alignItems: "flex-end",
              "&:last-of-type > div": { borderRight: 0 },
            }}
            display="flex"
          >
            <Box
              sx={{
                bgcolor: bg,
                width: "100%",
                height: COLOR_HEIGHT,
                borderRight: "1px solid #FFF",
              }}
            />
            <Typography
              variant="inherit"
              sx={{
                fontSize: "0.625rem",
                color: "grey.600",
                transform: "translateX(50%)",
                letterSpacing: -0.4,
                textAlign: "right",
                width: "fit-content",
              }}
            >
              {PRICE_THRESHOLDS[i]}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          width: 0,
          height: 0,
          borderTop: `${COLOR_HEIGHT / 2}px solid transparent`,
          borderBottom: `${COLOR_HEIGHT / 2}px solid transparent`,
          borderLeft: `${COLOR_HEIGHT / 2}px solid ${
            palette.diverging[palette.diverging.length - 1]
          }`,
        }}
      />
    </Box>
  );
};
const PRICE_THRESHOLDS = ["-15%", "-5%", "+5%", "+15%"];
