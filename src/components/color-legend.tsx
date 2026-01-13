import { Trans } from "@lingui/macro";
import { Box, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { makeStyles } from "tss-react/mui";

import { InfoDialogButton } from "src/components/info-dialog";
import { WidgetIcon } from "src/components/map-widget-icon";
import { Threshold } from "src/domain/map-encodings";
import { Icon } from "src/icons";
import { useIsMobile } from "src/lib/use-mobile";
import { chartPalette } from "src/themes/palette";

const LEGEND_WIDTH = 215;
const TOP_LABEL_HEIGHT = 14;
const COLOR_HEIGHT = 12;
const BOTTOM_LABEL_HEIGHT = 16;

const useStyles = makeStyles()((theme) => ({
  legendBox: {
    zIndex: 13,
    backgroundColor: "white",
    borderRadius: theme.shape.borderRadius,
    height: "fit-content",
    paddingLeft: 16,
    paddingRight: 16,
    display: "flex",
    boxShadow: theme.shadows[1],
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 16,
  },
}));

const LegendBox = ({
  children,
  ...props
}: React.ComponentProps<typeof Box>) => {
  const { classes } = useStyles();
  return (
    <Box className={classes.legendBox} {...props}>
      {children}
    </Box>
  );
};

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
  palette,
  thresholds,
}: {
  ticks: Tick[];
  id: string;
  title: React.ReactNode;
  mode?: LegendMode;
  infoDialogButtonProps?: React.ComponentProps<typeof InfoDialogButton>;
  palette: string[];
  thresholds?: Threshold[];
}) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(!isMobile);

  if (!open) {
    return (
      <WidgetIcon
        id={id}
        data-testid="map-legend"
        onClick={() => setOpen(true)}
      >
        <Icon name="infocircle" />
      </WidgetIcon>
    );
  }

  return (
    <LegendBox id={id} data-testid="map-legend">
      <Box alignItems="center" width="100%" mb={2} display="flex">
        <Typography variant="inherit" fontSize="0.625rem" lineHeight={1.5}>
          {title}
        </Typography>
        {infoDialogButtonProps ? (
          <InfoDialogButton
            iconOnly
            {...infoDialogButtonProps}
            sx={{ p: 0, width: 16, height: 16, ml: 1 }}
          />
        ) : null}
        <Box
          onClick={() => setOpen(false)}
          display={["flex", "none"]}
          sx={{ cursor: "pointer" }}
          justifyContent="flex-end"
          flexGrow={1}
        >
          <Icon name="clear" size={16} color="#666" />
        </Box>
      </Box>
      <Box width={LEGEND_WIDTH}>
        {mode === "minMedianMax" ? (
          <MinMedianMaxLegend
            ticks={ticks}
            palette={palette}
            thresholds={thresholds}
          />
        ) : (
          <YesNoLegend
            ticks={ticks}
            palette={palette}
            thresholds={thresholds}
          />
        )}
      </Box>
    </LegendBox>
  );
};

const MinMedianMaxLegend = ({
  ticks,
  palette,
  thresholds,
}: {
  ticks: Tick[];
  palette: string[];
  thresholds?: Threshold[];
}) => {
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        color="text"
        fontSize="0.625rem"
        lineHeight={1.5}
        height={TOP_LABEL_HEIGHT}
        sx={{
          pointerEvents: "none",
        }}
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
        display="flex"
        justifyContent="space-between"
        color="secondary.600"
        fontSize="0.625rem"
        mb={3}
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

      <ColorsLine palette={palette} thresholds={thresholds} />
    </>
  );
};

const YesNoLegend = ({
  ticks,
  palette,
  thresholds,
}: {
  ticks: Tick[];
  palette: string[];
  thresholds?: Threshold[];
}) => {
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        color="text"
        fontSize="0.625rem"
        lineHeight={1.5}
        height={TOP_LABEL_HEIGHT}
        width="100%"
        mb={1}
        sx={{
          pointerEvents: "none",
        }}
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

      <YesNoColorsLine palette={palette} thresholds={thresholds} />
    </>
  );
};

export const ColorLegend = () => {
  return (
    <Box
      width={LEGEND_WIDTH}
      zIndex={13}
      borderRadius={1}
      height="fit-content"
      pl={4}
      py={2}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        color="secondary.600"
        fontSize="0.625rem"
        mb={2}
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
      <ColorsLine palette={chartPalette.diverging.GreenToOrange} />
    </Box>
  );
};

const ColorsLine = ({
  palette,
  thresholds,
}: {
  palette: string[];
  thresholds?: Threshold[];
}) => {
  return (
    <Box
      data-name="color-line"
      display="flex"
      position="relative"
      sx={{
        height: COLOR_HEIGHT + BOTTOM_LABEL_HEIGHT,
      }}
    >
      <Box
        position="absolute"
        left="50%"
        width={0}
        borderLeft="1px dashed"
        zIndex={14}
        sx={{
          borderLeftColor: "text",
          height: COLOR_HEIGHT * 1.5,
          overflowY: "visible",
          transform: "translateY(-15%)",
        }}
      ></Box>
      <Box
        width={0}
        height={0}
        borderTop={`${COLOR_HEIGHT / 2}px solid transparent`}
        borderBottom={`${COLOR_HEIGHT / 2}px solid transparent`}
        borderRight={`${COLOR_HEIGHT / 2}px solid  ${palette[0]}`}
      />
      <Box
        display="grid"
        gridTemplateColumns=".8fr 1fr 1fr 1fr .8fr"
        columnGap={0}
        width="100%"
        sx={{
          height: COLOR_HEIGHT + BOTTOM_LABEL_HEIGHT,
        }}
      >
        {palette.map((bg, i) => {
          const threshold = thresholds?.[i];
          const labelContent = (
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
                cursor: threshold ? "help" : "default",
              }}
            >
              {threshold?.label ?? ""}
            </Typography>
          );

          return (
            <Box
              key={bg}
              display="flex"
              flexDirection="column"
              alignItems="flex-end"
              sx={{
                "&:last-of-type > div": { borderRight: 0 },
              }}
            >
              <Box
                bgcolor={bg}
                width="100%"
                height={COLOR_HEIGHT}
                borderRight="1px solid #FFF"
              />
              {threshold && threshold.value !== undefined ? (
                <Tooltip title={threshold.value.toFixed(2)} arrow>
                  {labelContent}
                </Tooltip>
              ) : (
                labelContent
              )}
            </Box>
          );
        })}
      </Box>
      <Box
        width={0}
        height={0}
        borderTop={`${COLOR_HEIGHT / 2}px solid transparent`}
        borderBottom={`${COLOR_HEIGHT / 2}px solid transparent`}
        borderLeft={`${COLOR_HEIGHT / 2}px solid ${
          palette[palette.length - 1]
        }`}
      />
    </Box>
  );
};

const YesNoColorsLine = ({
  palette,
}: {
  palette: string[];
  thresholds?: Threshold[];
}) => {
  const yesNoColors = [palette[0], palette[palette.length - 1]];
  return (
    <Box
      data-name="color-line"
      display="flex"
      position="relative"
      sx={{
        height: COLOR_HEIGHT + BOTTOM_LABEL_HEIGHT,
      }}
    >
      <Box
        display="grid"
        gridTemplateColumns="1fr 1fr"
        columnGap={0}
        width="100%"
        sx={{
          height: COLOR_HEIGHT + BOTTOM_LABEL_HEIGHT,
        }}
      >
        {yesNoColors.map((bg, i) => (
          <Box
            key={bg}
            display="flex"
            flexDirection="column"
            alignItems="center"
            sx={{
              "&:last-of-type > div": { borderRight: 0 },
            }}
          >
            <Box
              bgcolor={bg}
              width="100%"
              height={COLOR_HEIGHT}
              sx={{
                borderRight: i === 0 ? "1px solid #FFF" : 0,
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};
