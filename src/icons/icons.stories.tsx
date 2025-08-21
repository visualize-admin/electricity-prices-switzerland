import { Icon, IconName, Icons } from "./index";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Icon> = {
  title: "Icons/All Icons",
  component: Icon,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

const iconNames = Object.keys(Icons) as IconName[];

export const AllIcons: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: "16px",
        padding: "16px",
      }}
    >
      {iconNames.map((name) => (
        <div
          key={name}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "8px",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
          }}
        >
          <Icon name={name} size={24} />
          <span
            style={{
              fontSize: "12px",
              marginTop: "8px",
              textAlign: "center",
              wordBreak: "break-all",
            }}
          >
            {name}
          </span>
        </div>
      ))}
    </div>
  ),
};
