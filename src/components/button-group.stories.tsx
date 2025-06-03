import React, { useState } from "react";

import { StoryGrid } from "src/components/storybook/story-grid";

import { ButtonGroup } from "./button-group";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof ButtonGroup> = {
  title: "Components/ButtonGroup",
  component: ButtonGroup,
  parameters: {
    layout: "centered",
    docs: {
      page: () => <StoryGrid cols={2} title="Button group" />,
    },
  },
  tags: ["autodocs", "e2e:autodocs-screenshot"],
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

// Basic button group with string options
export const Basic: Story = {
  render: () => {
    const [selected, setSelected] = useState("option1");

    return (
      <ButtonGroup
        id="basic-button-group"
        label="Select an option"
        options={[
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
          { value: "option3", label: "Option 3" },
        ]}
        value={selected}
        setValue={setSelected}
      />
    );
  },
};

// Button group with long labels to demonstrate overflow handling
export const LongLabels: Story = {
  render: () => {
    const [selected, setSelected] = useState("option1");

    return (
      <div style={{ width: "300px" }}>
        <ButtonGroup
          id="long-labels-button-group"
          label="Select an option with long labels"
          options={[
            {
              value: "option1",
              label: "This is a very long option label that will overflow",
            },
            {
              value: "option2",
              label:
                "Another extremely long option that demonstrates text overflow handling",
            },
            { value: "option3", label: "Short option" },
          ]}
          value={selected}
          setValue={setSelected}
        />
      </div>
    );
  },
};

// Button group with hidden label
export const HiddenLabel: Story = {
  render: () => {
    const [selected, setSelected] = useState("option1");

    return (
      <ButtonGroup
        id="hidden-label-button-group"
        label="This label is hidden"
        showLabel={false}
        options={[
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
          { value: "option3", label: "Option 3" },
        ]}
        value={selected}
        setValue={setSelected}
      />
    );
  },
};
// Button group with many options
export const ManyOptions: Story = {
  render: () => {
    const [selected, setSelected] = useState("option1");

    return (
      <div style={{ width: "600px" }}>
        <ButtonGroup
          id="many-options-button-group"
          label="Many options"
          options={[
            { value: "option1", label: "Option 1" },
            { value: "option2", label: "Option 2" },
            { value: "option3", label: "Option 3" },
            { value: "option4", label: "Option 4" },
            { value: "option5", label: "Option 5" },
            { value: "option6", label: "Option 6" },
            { value: "option7", label: "Option 7" },
          ]}
          value={selected}
          setValue={setSelected}
        />
      </div>
    );
  },
};

// Controlled demo with external state management
export const ControlledDemo: Story = {
  render: () => {
    const [selected, setSelected] = useState("winter");
    const [message, setMessage] = useState("Winter is selected");

    const handleSeasonChange = (value: string) => {
      setSelected(value);
      setMessage(
        `${value.charAt(0).toUpperCase() + value.slice(1)} is selected`
      );
    };

    return (
      <div>
        <ButtonGroup
          id="controlled-button-group"
          label="Select a season"
          options={[
            { value: "winter", label: "Winter" },
            { value: "spring", label: "Spring" },
            { value: "summer", label: "Summer" },
            { value: "autumn", label: "Autumn" },
          ]}
          value={selected}
          setValue={handleSeasonChange}
        />
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
          }}
        >
          {message}
        </div>
      </div>
    );
  },
};
