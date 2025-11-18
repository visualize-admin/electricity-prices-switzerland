import { Meta, StoryObj } from "@storybook/react";
import { interpolateRdBu } from "d3";

import { chartPalette } from "src/themes/palette";

import ValueChipComponent from "./value-chip";

const meta: Meta<typeof ValueChipComponent> = {
  component: ValueChipComponent,
  title: "Components/ValueChip",
};

export default meta;
type Story = StoryObj<typeof ValueChipComponent>;

const colorBindDivergingPalette = Array.from({ length: 5 }, (_, i) => {
  const minT = 0.1;
  const maxT = 0.9;
  const t = minT + (i / (5 - 1)) * (maxT - minT);
  return interpolateRdBu(t);
});

export const ValueChip: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, minmax(40px, 1fr))",
        gap: "16px",
        padding: "24px",
        maxWidth: "500px",
      }}
    >
      {chartPalette.diverging.GreenToOrange.map((color, index) => (
        <div key={index}>
          <ValueChipComponent
            color={color}
            formattedValue={`Value ${index + 1}`}
          />
        </div>
      ))}
      {colorBindDivergingPalette.map((color, index) => (
        <div key={index}>
          <ValueChipComponent
            color={color}
            formattedValue={`Value ${index + 1}`}
          />
        </div>
      ))}
    </div>
  ),
};
