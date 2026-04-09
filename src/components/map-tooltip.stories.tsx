import { Trans } from "@lingui/macro";
import { Box, Paper } from "@mui/material";

import { StoryGrid } from "src/components/storybook/story-grid";
import { chartPalette } from "src/themes/palette";

import {
  MapTooltip,
  SelectedEntityCard,
  defaultMapTooltipPlacement,
} from "./map-tooltip";

import type { Meta } from "@storybook/react";
import type { ComponentProps, ReactNode } from "react";

const greens = chartPalette.sequential.green;
const oranges = chartPalette.sequential.orange;

type SelectedEntityCardProps = ComponentProps<typeof SelectedEntityCard>;

/**
 * `MapTooltip` uses `TooltipBoxWithoutChartState` with `position: absolute` and `left` / `top`
 * from `x` / `y`. Parent must be `position: relative` — same contract as `generic-map` /
 * deck.gl overlays. Red dot marks the anchor.
 */
function MapTooltipStage(props: {
  anchorX: number;
  anchorY: number;
  children: ReactNode;
}) {
  const { anchorX, anchorY, children } = props;
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: 560,
        minHeight: 300,
        mx: "auto",
        bgcolor: "grey.100",
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 1,
        backgroundImage:
          "repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(0,0,0,.035) 24px), repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(0,0,0,.035) 24px)",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          left: anchorX,
          top: anchorY,
          width: 10,
          height: 10,
          marginLeft: -5,
          marginTop: -5,
          borderRadius: "50%",
          bgcolor: "error.main",
          border: "2px solid",
          borderColor: "background.paper",
          boxShadow: 1,
          zIndex: 0,
        }}
      />
      {children}
    </Box>
  );
}

function mapTooltipWithCard(
  anchorX: number,
  anchorY: number,
  card: SelectedEntityCardProps
) {
  return (
    <MapTooltipStage anchorX={anchorX} anchorY={anchorY}>
      <MapTooltip
        x={anchorX}
        y={anchorY}
        placement={defaultMapTooltipPlacement}
      >
        <SelectedEntityCard {...card} />
      </MapTooltip>
    </MapTooltipStage>
  );
}

const meta: Meta = {
  title: "Components/MapTooltip",
  parameters: {
    layout: "centered",
    docs: {
      page: () => <StoryGrid cols={2} title="Map tooltip" />,
      description: {
        component:
          "Map hover: `MapTooltip` + `SelectedEntityCard`. Row **labels** carry the metric or operator name; **units** appear in muted parentheses; **ValueChip** shows the numeric value only (Swiss-style decimals in app via formatters). Data from `formatEnergyPricesEntity` / `formatSunshineEntity` → `useSelectedEntityData`.",
      },
    },
  },
  tags: ["autodocs", "e2e:autodocs-screenshot"],
};

export default meta;

/** Electricity — canton, single “average” row (Figma: Total / Durchschnitt). */
export function ElectricityCantonAverageTooltip() {
  return mapTooltipWithCard(260, 170, {
    title: "Nidwalden",
    caption: <Trans id="canton">Canton</Trans>,
    values: [
      {
        label: "Total (average)",
        unit: "Rp./kWh",
        formattedValue: "23,40",
        color: greens[5],
      },
    ],
  });
}

/** Electricity — municipality with several operators; chip = price only. */
export function ElectricityMunicipalityOperatorsTooltip() {
  return mapTooltipWithCard(280, 200, {
    title: "Luzern",
    caption: <Trans id="municipality">Municipality</Trans>,
    values: [
      {
        label: "CKW AG",
        unit: "Rp./kWh",
        formattedValue: "24,50",
        color: greens[5],
      },
      {
        label: "ewl energie wasser luzern (ewl) Kabelnetz AG",
        unit: "Rp./kWh",
        formattedValue: "23,95",
        color: greens[4],
      },
    ],
  });
}

/** Electricity — one operator, total row. */
export function ElectricityOperatorTotalTooltip() {
  return mapTooltipWithCard(270, 190, {
    title: "Elektrizitätswerk der Stadt Zürich",
    caption: <Trans id="operator">Operator</Trans>,
    values: [
      {
        label: "Total",
        unit: "Rp./kWh",
        formattedValue: "22,10",
        color: greens[4],
      },
    ],
  });
}

/** Sunshine — several operators; title + subtitle metric line (production uses `subtitle` + rows without row units). */
export function SunshineMultiOperatorNetworkCostsTooltip() {
  return mapTooltipWithCard(290, 210, {
    title: (
      <Trans id="map.tooltip.multiple-grid-operators">
        Multiple grid operators
      </Trans>
    ),
    subtitle: (
      <>
        <Box component="span" sx={{ color: "text.primary" }}>
          Network Costs
        </Box>
        <Box component="span" sx={{ color: "text.500" }}>
          {" "}
          (CHF/km)
        </Box>
      </>
    ),
    caption: <Trans id="operator">Operator</Trans>,
    values: [
      {
        label: "Elektrizitätswerk des Kantons Zürich (EKZ)",
        formattedValue: "1 842",
        color: greens[4],
      },
      {
        label: "Elektrizitätswerk der Stadt Zürich",
        formattedValue: "1 905",
        color: greens[5],
      },
    ],
  });
}

/** Sunshine — single operator; metric label + unit on the row, SAIDI value in chip. */
export function SunshineSingleOperatorSaidiTooltip() {
  return mapTooltipWithCard(300, 220, {
    title: "Elektrizitätswerk der Stadt Zürich",
    caption: <Trans id="operator">Operator</Trans>,
    values: [
      {
        label: "SAIDI Total",
        unit: "Min./year",
        formattedValue: "42",
        color: oranges[4],
      },
    ],
  });
}

/** Sunshine — energy tariff, multiple operators. */
export function SunshineMultiOperatorEnergyTariffTooltip() {
  return mapTooltipWithCard(275, 205, {
    title: (
      <Trans id="map.tooltip.multiple-grid-operators">
        Multiple grid operators
      </Trans>
    ),
    subtitle: (
      <>
        <Box component="span" sx={{ color: "text.primary" }}>
          Energy Tariff
        </Box>
        <Box component="span" sx={{ color: "text.500" }}>
          {" "}
          (Rp./kWh)
        </Box>
      </>
    ),
    caption: <Trans id="operator">Operator</Trans>,
    values: [
      { label: "CKW AG", formattedValue: "18,20", color: greens[3] },
      { label: "AEW Energie AG", formattedValue: "17,65", color: greens[4] },
    ],
  });
}

export function NoDataTooltip() {
  return mapTooltipWithCard(250, 160, {
    title: "Example Gemeinde",
    caption: <Trans id="municipality">Municipality</Trans>,
    values: [],
  });
}

/** Stress ellipsis: long title and long operator name + unit. */
export function LongLabelsTooltip() {
  return mapTooltipWithCard(265, 185, {
    title:
      "Very Long Municipality Name That Should Ellipsize In The Tooltip Title",
    caption: <Trans id="municipality">Municipality</Trans>,
    values: [
      {
        label:
          "Extremely long operator name that must not blow out the grid width",
        unit: "Rp./kWh",
        formattedValue: "19,99",
        color: greens[4],
      },
    ],
  });
}

/** Card without map chrome — e.g. mobile summary. */
export function SelectedEntityCardInPaper() {
  const props: SelectedEntityCardProps = {
    title: "Winterthur",
    caption: <Trans id="municipality">Municipality</Trans>,
    values: [
      {
        label: "Stadtwerk Winterthur",
        unit: "Rp./kWh",
        formattedValue: "11,90",
        color: greens[4],
      },
      {
        label: "EKZ Netz AG",
        unit: "Rp./kWh",
        formattedValue: "12,35",
        color: greens[5],
      },
    ],
  };
  return (
    <Box p={2} maxWidth={320}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <SelectedEntityCard {...props} />
      </Paper>
    </Box>
  );
}
