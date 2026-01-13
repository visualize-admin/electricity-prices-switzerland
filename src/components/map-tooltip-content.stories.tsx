import { Box, Paper } from "@mui/material";

import { StoryGrid } from "src/components/storybook/story-grid";
import { chartPalette } from "src/themes/palette";

import { SelectedEntityCard as SelectedEntityCardComponent } from "./map-tooltip";

import type { Decorator, Meta, StoryObj } from "@storybook/react";

const TooltipDecorator: Decorator = (Story) => (
  <Box padding={1}>
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

const meta: Meta<typeof SelectedEntityCardComponent> = {
  title: "Components/SelectedEntityCard",
  component: SelectedEntityCardComponent,
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
type Story = StoryObj<typeof SelectedEntityCardComponent>;

// Mock color scale
const greens = chartPalette.sequential.green;

// Basic tooltip with municipality data
export const SelectedEntityCard: Story = {
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
