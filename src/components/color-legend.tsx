import styled from "@emotion/styled";
import { Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import { useState } from "react";

import { InfoDialogButton } from "src/components/info-dialog";
import { Icon } from "src/icons";
import { useIsMobile } from "src/lib/use-mobile";
import { chartPalette } from "src/themes/palette";

const LEGEND_WIDTH = 215;
const TOP_LABEL_HEIGHT = 14;
const COLOR_HEIGHT = 12;
const BOTTOM_LABEL_HEIGHT = 16;

const LegendBox = styled(Box)({
  zIndex: 13,
  bgcolor: "rgba(245, 245, 245, 0.8)",
  borderRadius: 1,
  height: "fit-content",
  px: 4,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  py: 2,
});

type Tick = {
  value: number | undefined;
  label: string;
};

type LegendMode = "minMedianMax" | "yesNo";

export const MapColorLegend = ({
  ticks,
  id,
  title,
  mode = "minMedianMax",
  infoDialogButtonProps,
}: {
  ticks: Tick[];
  id: string;
  title: React.ReactNode;
  mode?: LegendMode;
  infoDialogButtonProps?: React.ComponentProps<typeof InfoDialogButton>;
}) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(!isMobile);

  if (!open) {
    return (
      <LegendBox sx={{ width: "auto" }} id={id}>
        <Box
          onClick={() => setOpen(true)}
          sx={{
            cursor: "pointer",
            flexGrow: 1,
            justifyContent: "flex-end",
          }}
          display="flex"
        >
          <Icon name="infocircle" color="#333" />
        </Box>
      </LegendBox>
    );
  }

  return (
    <LegendBox id={id}>
      <Box sx={{ alignItems: "center", width: "100%", mb: -1 }} display="flex">
        <Typography
          variant="inherit"
          sx={{ fontSize: "0.625rem", lineHeight: 1.5, mr: 1, mb: 2 }}
        >
          {title}
        </Typography>
        {infoDialogButtonProps ? (
          <InfoDialogButton iconOnly {...infoDialogButtonProps} />
        ) : null}
        <Box
          onClick={() => setOpen(false)}
          sx={{
            display: ["flex", "none"],
            cursor: "pointer",
            flexGrow: 1,
            justifyContent: "flex-end",
          }}
        >
          <Icon name="clear" size={16} color="#666" />
        </Box>
      </Box>
      <Box
        sx={{
          width: LEGEND_WIDTH,
        }}
      >
        {mode === "minMedianMax" ? (
          <MinMedianMaxLegend ticks={ticks} />
        ) : (
          <YesNoLegend ticks={ticks} />
        )}
      </Box>
    </LegendBox>
  );
};

const MinMedianMaxLegend = ({ ticks }: { ticks: Tick[] }) => {
  return (
    <>
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
        {ticks.map((stat, index) => (
          <Typography
            key={index}
            variant="inherit"
            sx={{
              flex: "1 1 0px",
              textAlign:
                index === 0
                  ? "left"
                  : index === ticks.length - 1
                  ? "right"
                  : "center",
              ...(index === 0 ? { display: "flex" } : {}),
            }}
          >
            {stat.label || ""}
          </Typography>
        ))}
      </Box>
      <Box
        sx={{
          justifyContent: "space-between",
          color: "secondary.600",
          fontSize: "0.625rem",
          mb: 3,
        }}
        display="flex"
      >
        <Typography
          variant="inherit"
          component="span"
          sx={{ flex: "1 1 0px", lineHeight: 1 }}
        >
          <Trans id="price.legend.min">min</Trans>
        </Typography>
        <Typography
          variant="inherit"
          component="span"
          sx={{ flex: "1 1 0px", textAlign: "center", lineHeight: 1 }}
        >
          <Trans id="price.legend.median">median</Trans>
        </Typography>
        <Typography
          variant="inherit"
          component="span"
          sx={{ flex: "1 1 0px", textAlign: "right", lineHeight: 1 }}
        >
          <Trans id="price.legend.max">max</Trans>
        </Typography>
      </Box>

      <ColorsLine />
    </>
  );
};

const YesNoLegend = ({ ticks }: { ticks: Tick[] }) => {
  return (
    <>
      <Box
        sx={{
          justifyContent: "space-between",
          color: "text",
          fontSize: "0.625rem",
          lineHeight: 1.5,
          height: TOP_LABEL_HEIGHT,
          pointerEvents: "none",
          width: "100%",
          mb: 1,
        }}
        display="flex"
      >
        {ticks.map((stat, index) => (
          <Typography
            key={index}
            variant="inherit"
            sx={{
              flex: "1 1 0px",
              textAlign: index === 0 ? "left" : "right",
              ...(index === 0 ? { display: "flex" } : {}),
            }}
          >
            {stat.label || ""}
          </Typography>
        ))}
      </Box>

      <YesNoColorsLine />
    </>
  );
};

export const ColorLegend = () => {
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
          color: "secondary.600",
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

const ColorsLine = () => {
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
          borderRight: `${COLOR_HEIGHT / 2}px solid  ${
            chartPalette.diverging.GreenToOrange[0]
          }`,
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
        {chartPalette.diverging.GreenToOrange.map((bg, i) => (
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
                mt: 1,
                fontSize: "0.625rem",
                color: "secondary.600",
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
            chartPalette.diverging.GreenToOrange[
              chartPalette.diverging.GreenToOrange.length - 1
            ]
          }`,
        }}
      />
    </Box>
  );
};

const YesNoColorsLine = () => {
  const yesNoColors = [
    chartPalette.diverging.GreenToOrange[
      chartPalette.diverging.GreenToOrange.length - 1
    ],
    chartPalette.diverging.GreenToOrange[0],
  ];

  return (
    <Box
      sx={{ height: COLOR_HEIGHT + BOTTOM_LABEL_HEIGHT, position: "relative" }}
      data-name="color-line"
      display="flex"
    >
      <Box
        display="grid"
        sx={{
          gridTemplateColumns: "1fr 1fr",
          columnGap: 0,
          height: COLOR_HEIGHT + BOTTOM_LABEL_HEIGHT,
          width: "100%",
        }}
      >
        {yesNoColors.map((bg, i) => (
          <Box
            key={bg}
            sx={{
              flexDirection: "column",
              alignItems: "center",
              "&:last-of-type > div": { borderRight: 0 },
            }}
            display="flex"
          >
            <Box
              sx={{
                bgcolor: bg,
                width: "100%",
                height: COLOR_HEIGHT,
                borderRight: i === 0 ? "1px solid #FFF" : 0,
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const PRICE_THRESHOLDS = ["-15%", "-5%", "+5%", "+15%"];
