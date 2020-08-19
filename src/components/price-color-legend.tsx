import { Trans } from "@lingui/macro";
import { Box, Flex, Grid, Text } from "@theme-ui/components";
import * as React from "react";
import { useTheme } from "../themes";

const LEGEND_WIDTH = 176;
const TOP_LABEL_HEIGHT = 16;
const COLOR_HEIGHT = 12;
const BOTTOM_LABEL_HEIGHT = 16;

export const PriceColorLegend = () => {
  return (
    <Box
      sx={{
        width: LEGEND_WIDTH,
        zIndex: 13,
        bg: "rgba(245, 245, 245, 0.8)",
        borderRadius: "default",
        height: "fit-content",
        px: 4,
        py: 2,
      }}
    >
      <Flex
        sx={{
          justifyContent: "space-between",
          height: TOP_LABEL_HEIGHT,
          color: "text",
        }}
      >
        <Text sx={{ fontSize: 1 }}>
          <Trans id="price.legend.min">min</Trans>
        </Text>
        <Flex sx={{ flexDirection: "column", alignItems: "center" }}>
          <Text sx={{ fontSize: 1 }}>
            <Trans id="price.legend.median">median</Trans>
          </Text>
          <Box
            sx={{
              width: 0,
              borderLeft: "1px solid black",
              height: TOP_LABEL_HEIGHT + COLOR_HEIGHT,
              overflowY: "visible",
              zIndex: 14,
            }}
          ></Box>
        </Flex>
        <Text sx={{ fontSize: 1 }}>
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
      sx={{
        height: COLOR_HEIGHT + BOTTOM_LABEL_HEIGHT,
      }}
    >
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
