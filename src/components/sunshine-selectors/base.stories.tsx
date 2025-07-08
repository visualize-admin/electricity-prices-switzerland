import {
  energyTariffCategoryOptions,
  indicatorOptions,
  netTariffCategoryOptions,
  networkLevelOptions,
  typologyOptions,
} from "src/domain/sunshine";

import { SunshineSelectorsBase } from "./base";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof SunshineSelectorsBase> = {
  title: "Components/SunshineSelectors",
  component: SunshineSelectorsBase,
};

export default meta;
type Story = StoryObj<typeof SunshineSelectorsBase>;

export const SunshineSelectors: Story = {
  args: {
    year: "2024",
    years: ["2024", "2023", "2022"],
    viewBy: "all_grid_operators",
    viewByOptions: ["all_grid_operators", "canton", "municipality"],
    typology: "total",
    typologyOptions: typologyOptions,
    indicator: "saidi",
    indicatorOptions: indicatorOptions,
    netTariffsCategoryOptions: netTariffCategoryOptions,
    energyTariffsCategoryOptions: energyTariffCategoryOptions,
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
