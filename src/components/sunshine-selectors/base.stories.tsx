import {
  indicatorOptions,
  netElectricityCategoryOptions,
  networkLevelOptions,
  saidiSaifiTypes,
} from "src/domain/sunshine";

import { withUrqlClient } from "../../../.storybook/decorators";

import { SunshineSelectorsBase } from "./base";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof SunshineSelectorsBase> = {
  title: "Components/SunshineSelectors",
  component: SunshineSelectorsBase,
  decorators: [withUrqlClient],
};

export default meta;
type Story = StoryObj<typeof SunshineSelectorsBase>;

export const SunshineSelectors: Story = {
  args: {
    year: "2024",
    years: ["2024", "2023", "2022"],
    peerGroup: "all_grid_operators",
    peerGroupOptions: ["all_grid_operators", "canton", "municipality"],
    saidiSaifiType: "total",
    saidiSaifiTypes: saidiSaifiTypes,
    indicator: "saidi",
    indicatorOptions: indicatorOptions,
    categoryOptions: netElectricityCategoryOptions,
    networkLevel: "NE5",
    networkLevelOptions: networkLevelOptions,
    getItemLabel: (id) => {
      const labels: Record<string, string> = {
        all_grid_operators: "All grid operators",
        canton: "Canton",
        municipality: "Municipality",
        total: "Total (planned and unplanned)",
        planned: "Planned",
        unplanned: "Unplanned",
        saidi: "Power Outage Duration (SAIDI)",
        saifi: "Power Outage Frequency (SAIFI)",
      };
      return labels[id] || id;
    },
  },
};
