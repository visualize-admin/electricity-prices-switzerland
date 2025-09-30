import { StoryGrid } from "src/components/storybook/story-grid";
import withQueryClient from "src/components/storybook/with-query-client";
import { chartPalette } from "src/themes/palette";

import { MapColorLegend } from "./color-legend";

import type { Decorator, Meta, StoryObj } from "@storybook/react";

const withContainer: Decorator = (Story) => (
  <div
    style={{
      minHeight: 130,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Story />
  </div>
);
const meta: Meta<typeof MapColorLegend> = {
  title: "Components/MapColorLegend",
  component: MapColorLegend,
  parameters: {
    docs: {
      page: () => <StoryGrid title={""} />,
    },
  },
  argTypes: {
    id: { control: "text" },
    title: { control: "text" },
    mode: {
      control: "select",
      options: ["minMedianMax", "yesNo"],
      defaultValue: "minMedianMax",
    },
    ticks: { control: "object" },
    infoDialogButtonProps: { control: "object" },
  },
  decorators: [withQueryClient, withContainer],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MapColorLegend>;

export const Default: Story = {
  args: {
    id: "map-legend",
    title: "Price Distribution",
    mode: "minMedianMax",
    ticks: [
      { value: 100, label: "$100" },
      { value: 250, label: "$250" },
      { value: 500, label: "$500" },
      { value: 750, label: "$750" },
      { value: 1000, label: "$1000" },
    ],
    palette: chartPalette.diverging.GreenToOrange,
  },
};

export const YesNoMode: Story = {
  args: {
    id: "map-legend-yesno",
    title: "Service Quality",
    mode: "yesNo",
    ticks: [
      { value: 0, label: "Not compliant" },
      { value: 1, label: "Compliant" },
    ],
    palette: chartPalette.diverging.GreenToOrange,
  },
};

export const EmptyTicks: Story = {
  args: {
    id: "map-legend-empty",
    title: "No Data Available",
    mode: "minMedianMax",
    ticks: [
      { value: undefined, label: "" },
      { value: undefined, label: "" },
      { value: undefined, label: "" },
    ],
    palette: chartPalette.diverging.GreenToOrange,
  },
};

export const ReversedColors: Story = {
  args: {
    id: "map-legend-reversed-colors",
    title: "Legend with reversed colors",
    mode: "minMedianMax",
    ticks: [
      { value: 1000, label: "$1,000" },
      { value: 5000, label: "$5,000" },
      { value: 10000, label: "$10,000" },
      { value: 50000, label: "$50,000" },
      { value: 100000, label: "$100,000" },
    ],
    palette: chartPalette.diverging.GreenToOrange.slice().reverse(),
  },
};
