import { Trans } from "@lingui/macro";
import { Box, Flex, Grid, Text } from "@theme-ui/components";
import * as React from "react";
import { useTheme } from "../themes";
import { useFormatCurrency } from "../domain/helpers";

const LEGEND_WIDTH = 176;
const TOP_LABEL_HEIGHT = 16;
const COLOR_HEIGHT = 12;
const BOTTOM_LABEL_HEIGHT = 16;

export const PriceColorLegend = ({
  stats,
}: {
  stats: [number, number, number];
}) => {
  const formatCurrency = useFormatCurrency();
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
          height: TOP_LABEL_HEIGHT * 2,
          color: "text",
          fontSize: 1,
        }}
      >
        <Flex
          sx={{
            flexDirection: "column",
            flexGrow: 1,
            flexShrink: 1,
            alignItems: "center",
          }}
        >
          <Text>{formatCurrency(stats[0])}</Text>
          <Text sx={{ color: "monochrome600" }}>
            <Trans id="price.legend.min">min</Trans>
          </Text>
        </Flex>

        <Flex
          sx={{
            flexDirection: "column",
            flexGrow: 1,
            flexShrink: 1,
            alignItems: "center",
          }}
        >
          <Text>{formatCurrency(stats[1])}</Text>
          <Text sx={{ color: "monochrome600" }}>
            <Trans id="price.legend.median">median</Trans>
          </Text>
        </Flex>
        <Flex
          sx={{
            flexDirection: "column",
            flexGrow: 1,
            flexShrink: 1,
            alignItems: "center",
          }}
        >
          <Text>{formatCurrency(stats[2])}</Text>
          <Text sx={{ color: "monochrome600" }}>
            <Trans id="price.legend.max">max</Trans>
          </Text>
        </Flex>
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
