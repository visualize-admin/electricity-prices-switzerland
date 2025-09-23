import { Trend } from "src/graphql/resolver-types";
import costsAndTariffsData from "src/mocks/sunshine-costsAndTariffs-426.json";
import powerStabilityData from "src/mocks/sunshine-powerStability-426.json";


import { NetworkCostTrendChart } from "./network-cost-trend-chart";
import { PowerStabilityChart } from "./power-stability-chart";
import { DesignGrid, DesignStory } from "./storybook/base-style";
import { TariffsTrendChart } from "./tariffs-trend-chart";

import type { Meta, StoryObj } from "@storybook/react";

const NetworkCostTrendChartProgressStory = () => {
  return (
    <DesignStory
      title="Network Cost Trend Chart"
      reference="ElCom Library (Sunshine Indicators)"
    >
      <DesignGrid>
        <NetworkCostTrendChart
          observations={costsAndTariffsData.networkCosts.yearlyData}
          networkCosts={{
            ...costsAndTariffsData.networkCosts,
            operatorTrend: Trend.Down,
            peerGroupMedianTrend: Trend.Down,
          }}
          operatorLabel="Fluxonomy Energy"
          id="228"
          viewBy="progress"
          compareWith={[]}
          mini={false}
        />
      </DesignGrid>
    </DesignStory>
  );
};

const PowerStabilityChartProgressStory = () => {
  return (
    <DesignStory
      title="Power Stability Chart"
      reference="ElCom Library (Sunshine Indicators)"
    >
      <DesignGrid>
        <PowerStabilityChart
          observations={powerStabilityData.saidi.yearlyData}
          id="228"
          operatorLabel="Fluxonomy Energy"
          viewBy="progress"
          overallOrRatio="overall"
          duration="total"
          compareWith={[]}
        />
      </DesignGrid>
    </DesignStory>
  );
};

const TariffsTrendChartProgressStory = () => {
  return (
    <DesignStory
      title="Tariffs Trend Chart"
      reference="ElCom Library (Sunshine Indicators)"
    >
      <DesignGrid>
        <TariffsTrendChart
          observations={costsAndTariffsData.netTariffs.yearlyData}
          netTariffs={costsAndTariffsData.netTariffs}
          operatorLabel="Fluxonomy Energy"
          id="228"
          viewBy="progress"
          compareWith={[]}
          mini={false}
        />
      </DesignGrid>
    </DesignStory>
  );
};

// Meta configuration for Storybook
const meta: Meta = {
  title: "charts/ProgressOvertimeChart",
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const NetworkCostTrend: Story = {
  render: NetworkCostTrendChartProgressStory,
  name: "Network Cost Trend Progress",
};

export const PowerStability: Story = {
  render: PowerStabilityChartProgressStory,
  name: "Power Stability Progress",
};

export const TariffsTrend: Story = {
  render: TariffsTrendChartProgressStory,
  name: "Tariffs Trend Progress",
};
