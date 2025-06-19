import { Box, Paper } from "@mui/material";
import React from "react";

import { StoryGrid } from "src/components/storybook/story-grid";
import { chartPalette } from "src/themes/palette";

import { MapTooltipContent as MapTooltipContentComponent } from "./map-tooltip";

import type { Decorator, Meta, StoryObj } from "@storybook/react";

const TooltipDecorator: Decorator = (Story) => (
  <Box
    sx={{
      // Prevent margin collapse
      padding: 1,
    }}
  >
    <Paper
      sx={{
        m: 2,
        p: 2,
        maxWidth: 300,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Story />
    </Paper>
  </Box>
);

const meta: Meta<typeof MapTooltipContentComponent> = {
  title: "Components/MapTooltipContent",
  component: MapTooltipContentComponent,
  parameters: {
    layout: "centered",
    docs: {
      page: () => <StoryGrid cols={2} title="Map tooltip" />,
    },
  },
  tags: ["autodocs", "e2e:autodocs-screenshot"],
  decorators: [TooltipDecorator],
};

export default meta;
type Story = StoryObj<typeof MapTooltipContentComponent>;

// Mock color scale
const greens = chartPalette.sequential.green;

// Basic tooltip with municipality data
export const MapTooltipContent: Story = {
  args: {
    title: "Zürich",
    caption: "Municipality",
    values: [
      {
        label: "Total price",
        formattedValue: "24.5 Rp./kWh",
        color: greens[5],
      },
      {
        label: "Grid component",
        formattedValue: "9.8 Rp./kWh",
        color: greens[3],
      },
      {
        label: "Energy component",
        formattedValue: "12.3 Rp./kWh",
        color: greens[4],
      },
    ],
  },
};

// Tooltip with operator data
export const OperatorTooltip: Story = {
  args: {
    title: "EWZ",
    caption: "Operator",
    values: [
      {
        label: "Average price",
        formattedValue: "22.1 Rp./kWh",
        color: greens[4],
      },
      {
        label: "Municipalities served",
        formattedValue: "15",
        color: undefined,
      },
    ],
  },
};

// Tooltip with no data
export const NoDataTooltip: Story = {
  args: {
    title: "Small Municipality",
    caption: "Municipality",
    values: [],
  },
};
