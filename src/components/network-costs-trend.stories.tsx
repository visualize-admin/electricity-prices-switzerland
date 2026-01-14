import { useState } from "react";

import { useQueryStateNetworkCostsTrendCardFilters } from "src/domain/query-states";
import { CostsAndTariffsData } from "src/domain/sunshine";
import data from "src/mocks/sunshine-costsAndTariffs-426.json";

import { NetworkCostTrendChart } from "./network-cost-trend-chart";
import { NetworkCostsTrendCard } from "./network-costs-trend-card";
import { DesignStory } from "./storybook/base-style";

export const NetworkCostLatestYear = () => {
  const networkCosts =
    data.networkCosts as CostsAndTariffsData["networkCosts"];
  const { yearlyData, ...restNetworkCosts } = networkCosts;
  return (
    <DesignStory
      title="Network Costs Trend Chart"
      reference="ElCom Library (Sunshine Indicators)"
    >
      <NetworkCostTrendChart
        id="11"
        operatorLabel="Fluxwave Energy"
        observations={yearlyData.filter((d) => d.year === 2025)}
        networkCosts={restNetworkCosts}
        viewBy="latest"
        compareWith={["sunshine.select-all"]}
      />
    </DesignStory>
  );
};

export const NetworkCostLatestYearCompact = () => {
  const networkCosts =
    data.networkCosts as CostsAndTariffsData["networkCosts"];
  const { yearlyData, ...restNetworkCosts } = networkCosts;
  return (
    <DesignStory
      title="Network Costs Trend Chart (Compact)"
      reference="ElCom Library (Sunshine Indicators)"
    >
      <NetworkCostTrendChart
        id="11"
        operatorLabel="Fluxwave Energy"
        observations={yearlyData.filter((d) => d.year === 2025)}
        networkCosts={restNetworkCosts}
        viewBy="latest"
        compareWith={["sunshine.select-all"]}
        compact={true}
      />
    </DesignStory>
  );
};

export const NetworkCostLatestYearCard = () => {
  const networkCosts =
    data.networkCosts as CostsAndTariffsData["networkCosts"];
  const [state, setQueryState] = useState<
    ReturnType<typeof useQueryStateNetworkCostsTrendCardFilters>[0]
  >({
    compareWith: ["sunshine.select-all"],
    viewBy: "latest",
  });
  const date = new Date("2025-11-31T00:00:00Z");

  return (
    <DesignStory
      title="Network Costs Trend Card"
      reference="ElCom Library (Sunshine Indicators)"
    >
      <NetworkCostsTrendCard
        peerGroup={{
          id: "0",
          energyDensity: "na",
          settlementDensity: "unknown",
        }}
        operatorLabel="Fluxwave Energy"
        networkCosts={networkCosts}
        latestYear={date.getFullYear()}
        updateDate={date.toISOString()}
        operatorId="11"
        state={state}
        setQueryState={(newState) =>
          setQueryState((prev) => ({ ...prev, ...newState }))
        }
      />
    </DesignStory>
  );
};

const meta = {
  component: [NetworkCostLatestYear, NetworkCostLatestYearCard],
  title: "charts/NetworkCostLatestYear",
};

export default meta;
