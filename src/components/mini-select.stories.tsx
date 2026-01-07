import { Box } from "@mui/material";
import { useState } from "react";

import { MiniSelect } from "./mini-select";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof MiniSelect> = {
  title: "components/MiniSelect",
  component: MiniSelect,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A compact native select component with minimal styling, designed for inline use in tight spaces. Features optional labels and support for disabled options.",
      },
    },
  },
  argTypes: {
    onChange: { action: "changed" },
    value: { control: "text" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    id: { control: "text" },
    options: {
      control: "object",
      description:
        "Array of options with value, label, and optional disabled property",
    },
  },
};

export default meta;

type Story = StoryObj<typeof MiniSelect>;

// Basic select with simple options
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("option2");

    return (
      <Box sx={{ maxWidth: 150 }}>
        <MiniSelect
          {...args}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          options={[
            { value: "option1", label: "Option 1" },
            { value: "option2", label: "Super Long name for Option 2" },
            { value: "option3", label: "Option 3" },
          ]}
        />
      </Box>
    );
  },
  args: {
    id: "basic-select",
    label: "Choose an option",
  },
};

// Without label
export const WithoutLabel: Story = {
  render: () => {
    const [value, setValue] = useState("medium");

    return (
      <Box sx={{ minWidth: 120 }}>
        <MiniSelect
          id="size-select"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          options={[
            { value: "small", label: "Small" },
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large" },
          ]}
        />
      </Box>
    );
  },
};
