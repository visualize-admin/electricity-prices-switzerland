import { Trans } from "@lingui/macro";
import { Box, Flex, Grid, Text } from "@theme-ui/components";
import * as React from "react";

const LEGEND_WIDTH = 154;
const TOP_LABEL_HEIGHT = 16;
const COLOR_HEIGHT = 12;
const BOTTOM_LABEL_HEIGHT = 16;

export const PriceColorLegend = () => {
  return (
    <Box sx={{ width: LEGEND_WIDTH }}>
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
              zIndex: 12,
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

export const ColorsLine = () => (
  <Flex
    sx={{
      height: COLOR_HEIGHT,
      zIndex: 10,
    }}
  >
    <Box
      sx={{
        width: 0,
        height: 0,
        borderTop: `${COLOR_HEIGHT / 2}px solid transparent`,
        borderBottom: `${COLOR_HEIGHT / 2}px solid transparent`,
        borderRight: `${COLOR_HEIGHT / 2}px solid  #24B39C`,
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
      {["#24B39C", "#A8DC90", "#E7EC83", "#F1B865", "#D64B47"].map((bg, i) => (
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
        borderLeft: `${COLOR_HEIGHT / 2}px solid #D64B47`,
      }}
    />
  </Flex>
);
const PRICE_THRESHOLDS = ["-15%", "-5%", "+5%", "+15%"];
