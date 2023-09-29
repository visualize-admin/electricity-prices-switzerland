import { Trans, t } from "@lingui/macro";
import { Box, BoxProps } from "@mui/material";
import React, { useState } from "react";

import Flex from "src/components/flex";
import { makeStyles } from "src/themes/makeStyles";

import { useFormatCurrency } from "../domain/helpers";
import { IconClear } from "../icons/ic-clear";
import { IconInfo } from "../icons/ic-info";
import { useTheme } from "../themes";

import { InfoDialogButton } from "./info-dialog";

const LEGEND_WIDTH = 215;
const TOP_LABEL_HEIGHT = 14;
const COLOR_HEIGHT = 12;
const BOTTOM_LABEL_HEIGHT = 16;

const useStyles = makeStyles()((theme) => ({
  legendBox: {
    zIndex: 13,
    backgroundColor: "rgba(245, 245, 245, 0.8)",
    borderRadius: "default",
    height: "fit-content",
    padding: theme.spacing(2, 4),
  },

  clearIcon: {
    display: ["flex", "none"],
    cursor: "pointer",
    flexGrow: 1,
    justifyContent: "flex-end",
  },

  topLabel: {
    justifyContent: "space-between",
    color: "text",
    height: TOP_LABEL_HEIGHT,
    pointerEvents: "none",
  },

  legend: {
    width: LEGEND_WIDTH,
    zIndex: 13,
    borderRadius: theme.shape.borderRadius,
    height: "fit-content",
    padding: theme.spacing(2, 0),
    paddingLeft: theme.spacing(4),
  },

  legendItems: {
    justifyContent: "space-between",
    color: theme.palette.grey[600],
    fontSize: "0.625rem",
    marginBottom: 2,
  },

  dash: {
    position: "absolute",
    left: "50%",
    width: 0,
    borderLeft: "1px dashed",
    borderLeftColor: theme.palette.text.primary,
    height: COLOR_HEIGHT * 1.5,
    overflowY: "visible",
    zIndex: 14,
    transform: "translateY(-15%)",
  },

  barContainer: {
    gridTemplateColumns: ".8fr 1fr 1fr 1fr .8fr",
    columnGap: 0,
    height: COLOR_HEIGHT + BOTTOM_LABEL_HEIGHT,
    width: "100%",
  },

  bar: {
    width: "100%",
    height: COLOR_HEIGHT,
    borderRight: "1px solid #FFF",
  },

  belowCaption: {
    fontSize: "0.625rem",
    color: theme.palette.grey[600],
    transform: "translateX(50%)",
    letterSpacing: -0.4,
    textAlign: "right",
    width: "fit-content",
  },

  triangle: {
    width: 0,
    height: 0,
    borderTop: `${COLOR_HEIGHT / 2}px solid transparent`,
    borderBottom: `${COLOR_HEIGHT / 2}px solid transparent`,
    borderRight: `${COLOR_HEIGHT / 2}px solid  ${theme.palette.diverging[0]}`,
  },

  triangleRight: {
    width: 0,
    height: 0,
    borderTop: `${COLOR_HEIGHT / 2}px solid transparent`,
    borderBottom: `${COLOR_HEIGHT / 2}px solid transparent`,
    borderLeft: `${COLOR_HEIGHT / 2}px solid ${
      theme.palette.diverging[theme.palette.diverging.length - 1]
    }`,
  },
}));

const LegendBox = ({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: BoxProps["sx"];
}) => {
  const { classes } = useStyles();
  return (
    <Box className={classes.legendBox} sx={sx}>
      {children}
    </Box>
  );
};
export const MapPriceColorLegend = ({
  stats,
}: {
  stats: [number | undefined, number | undefined, number | undefined];
}) => {
  const { classes } = useStyles();
  const formatCurrency = useFormatCurrency();
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <LegendBox sx={{ width: "auto" }}>
        <Flex
          onClick={() => setOpen(true)}
          sx={{
            cursor: "pointer",
            flexGrow: 1,
            justifyContent: "flex-end",
          }}
        >
          <IconInfo color="#333" />
        </Flex>
      </LegendBox>
    );
  }
  return (
    <LegendBox
      sx={{
        fontSize: "0.625rem",
        lineHeight: 1.25,
      }}
    >
      <Flex
        sx={{
          alignItems: "center",
          width: "100%",
          mb: -2,
        }}
      >
        <Box sx={{ mr: 1 }}>
          <Trans id="map.legend.title">
            Tarifvergleich in Rp./kWh (Angaben exkl. MwSt.)
          </Trans>
        </Box>
        <InfoDialogButton
          smaller
          slug="help-price-comparison"
          label={t({ id: "help.price-comparison", message: `Tarifvergleich` })}
        />
        <Box onClick={() => setOpen(false)} className={classes.clearIcon}>
          <IconClear size={16} color="#666" />
        </Box>
      </Flex>
      <Box
        sx={{
          mt: 1,
          width: LEGEND_WIDTH,
        }}
      >
        <Flex className={classes.topLabel}>
          <Box sx={{ flex: "1 1 0px", display: "flex" }}>
            {stats[0] && formatCurrency(stats[0])}
          </Box>
          <Box sx={{ flex: "1 1 0px", textAlign: "center" }}>
            {stats[1] && formatCurrency(stats[1])}
          </Box>
          <Box sx={{ flex: "1 1 0px", textAlign: "right" }}>
            {stats[2] && formatCurrency(stats[2])}
          </Box>
        </Flex>
        <Flex
          sx={{
            justifyContent: "space-between",
            color: "grey.600",
            mb: 2,
          }}
        >
          <Box sx={{ flex: "1 1 0px" }}>
            <Trans id="price.legend.min">min</Trans>
          </Box>

          <Box sx={{ flex: "1 1 0px", textAlign: "center" }}>
            <Trans id="price.legend.median">median</Trans>
          </Box>

          <Box sx={{ flex: "1 1 0px", textAlign: "right" }}>
            <Trans id="price.legend.max">max</Trans>
          </Box>
        </Flex>

        <ColorsLine />
      </Box>
    </LegendBox>
  );
};

export const PriceColorLegend = () => {
  const { classes } = useStyles();
  return (
    <Box className={classes.legend}>
      <Flex className={classes.legendItems}>
        <Box sx={{ flex: "1 1 0px" }}>
          <Trans id="price.legend.min">min</Trans>
        </Box>

        <Box sx={{ flex: "1 1 0px", textAlign: "center" }}>
          <Trans id="price.legend.median">median</Trans>
        </Box>

        <Box sx={{ flex: "1 1 0px", textAlign: "right" }}>
          <Trans id="price.legend.max">max</Trans>
        </Box>
      </Flex>

      <ColorsLine />
    </Box>
  );
};

export const ColorsLine = () => {
  const { classes } = useStyles();
  const { palette } = useTheme();
  return (
    <Flex
      sx={{ height: COLOR_HEIGHT + BOTTOM_LABEL_HEIGHT, position: "relative" }}
      data-name="color-line"
    >
      <Box className={classes.dash}></Box>
      <Box className={classes.triangle} />
      <Box display="grid" className={classes.barContainer}>
        {palette.diverging.map((bg, i) => (
          <Flex
            key={bg}
            sx={{
              flexDirection: "column",
              alignItems: "flex-end",
              ":last-of-type > div": { borderRight: 0 },
            }}
          >
            <Box className={classes.bar} style={{ backgroundColor: bg }} />

            <Box className={classes.belowCaption}>{PRICE_THRESHOLDS[i]}</Box>
          </Flex>
        ))}
      </Box>
      <Box className={classes.triangleRight} />
    </Flex>
  );
};
const PRICE_THRESHOLDS = ["-15%", "-5%", "+5%", "+15%"];
