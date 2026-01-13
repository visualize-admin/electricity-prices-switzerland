import { Box } from "@mui/material";

import { NoDataAvailable } from "./no-data-available";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof NoDataAvailable> = {
  title: "Components/NoDataAvailable",
  component: NoDataAvailable,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof NoDataAvailable>;

export const Default: Story = {
  render: () => (
    <Box width={400}>
      <NoDataAvailable />
    </Box>
  ),
};
