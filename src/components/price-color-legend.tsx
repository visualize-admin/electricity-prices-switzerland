import { Trans, t } from "@lingui/macro";
import { Box, BoxProps, Flex, Grid, Text } from "@theme-ui/components";
import React, { useState } from "react";
import { useTheme } from "../themes";
import { useFormatCurrency } from "../domain/helpers";
import { InfoDialogButton } from "./info-dialog";
import { IconInfo } from "../icons/ic-info";
import { IconClear } from "../icons/ic-clear";

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
        bg: "rgba(245, 245, 245, 0.8)",
        borderRadius: "default",
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
    <LegendBox>
      <Flex sx={{ alignItems: "center", width: "100%" }}>
        <Text sx={{ fontSize: 1, lineHeight: 1.5, mr: 1 }}>
          <Trans id="map.legend.title">
            Tarifvergleich in Rp./kWh (Angaben exkl. MWST)
          </Trans>
        </Text>
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
      </Flex>
      <Box
        sx={{
          mt: 1,
          width: LEGEND_WIDTH,
        }}
      >
        <Flex
          sx={{
            justifyContent: "space-between",
            color: "text",
            fontSize: 1,
            lineHeight: 1.5,
            height: TOP_LABEL_HEIGHT,
            pointerEvents: "none",
          }}
        >
          <Text sx={{ flex: "1 1 0px", display: "flex" }}>
            {stats[0] && formatCurrency(stats[0])}
          </Text>
          <Text sx={{ flex: "1 1 0px", textAlign: "center" }}>
            {stats[1] && formatCurrency(stats[1])}
          </Text>
          <Text sx={{ flex: "1 1 0px", textAlign: "right" }}>
            {stats[2] && formatCurrency(stats[2])}
          </Text>
        </Flex>
        <Flex
          sx={{
            justifyContent: "space-between",
            color: "monochrome600",
            fontSize: 1,
            mb: 2,
          }}
        >
          <Text sx={{ flex: "1 1 0px" }}>
            <Trans id="price.legend.min">min</Trans>
          </Text>

          <Text sx={{ flex: "1 1 0px", textAlign: "center" }}>
            <Trans id="price.legend.median">median</Trans>
          </Text>

          <Text sx={{ flex: "1 1 0px", textAlign: "right" }}>
            <Trans id="price.legend.max">max</Trans>
          </Text>
        </Flex>

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
        borderRadius: "default",
        height: "fit-content",
        pl: 4,
        py: 2,
      }}
    >
      <Flex
        sx={{
          justifyContent: "space-between",
          color: "monochrome600",
          fontSize: 1,
          mb: 2,
        }}
      >
        <Text sx={{ flex: "1 1 0px" }}>
          <Trans id="price.legend.min">min</Trans>
        </Text>

        <Text sx={{ flex: "1 1 0px", textAlign: "center" }}>
          <Trans id="price.legend.median">median</Trans>
        </Text>

        <Text sx={{ flex: "1 1 0px", textAlign: "right" }}>
          <Trans id="price.legend.max">max</Trans>
        </Text>
      </Flex>

      <ColorsLine />
    </Box>
  );
};

export const ColorsLine = () => {
  const { palettes } = useTheme();
  return (
    <Flex
      sx={{ height: COLOR_HEIGHT + BOTTOM_LABEL_HEIGHT, position: "relative" }}
      data-name="color-line"
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
          borderRight: `${COLOR_HEIGHT / 2}px solid  ${palettes.diverging[0]}`,
        }}
      />
      <Grid
        sx={{
          gridTemplateColumns: ".8fr 1fr 1fr 1fr .8fr",
          columnGap: 0,
          height: COLOR_HEIGHT + BOTTOM_LABEL_HEIGHT,
          width: "100%",
        }}
      >
        {palettes.diverging.map((bg, i) => (
          <Flex
            key={bg}
            sx={{
              flexDirection: "column",
              alignItems: "flex-end",
              ":last-of-type > div": { borderRight: 0 },
            }}
          >
            <Box
              sx={{
                bg,
                width: "100%",
                height: COLOR_HEIGHT,
                borderRight: "1px solid #FFF",
              }}
            />

            <Text
              sx={{
                fontSize: 1,
                color: "monochrome600",
                transform: "translateX(50%)",
                letterSpacing: -0.4,
                textAlign: "right",
                width: "fit-content",
              }}
            >
              {PRICE_THRESHOLDS[i]}
            </Text>
          </Flex>
        ))}
      </Grid>
      <Box
        sx={{
          width: 0,
          height: 0,
          borderTop: `${COLOR_HEIGHT / 2}px solid transparent`,
          borderBottom: `${COLOR_HEIGHT / 2}px solid transparent`,
          borderLeft: `${COLOR_HEIGHT / 2}px solid ${
            palettes.diverging[palettes.diverging.length - 1]
          }`,
        }}
      />
    </Flex>
  );
};
const PRICE_THRESHOLDS = ["-15%", "-5%", "+5%", "+15%"];
