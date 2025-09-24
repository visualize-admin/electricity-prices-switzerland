import { useState } from "react";

import { useQueryStateNetworkCostsTrendCardFilters } from "src/domain/query-states";
import { SunshineCostsAndTariffsData } from "src/domain/sunshine";
import data from "src/mocks/sunshine-costsAndTariffs-426.json";

import { NetworkCostTrendChart } from "./network-cost-trend-chart";
import { NetworkCostsTrendCard } from "./network-costs-trend-card";
import { DesignGrid, DesignStory } from "./storybook/base-style";

export const NetworkCostLatestYear = () => {
  const networkCosts =
    data.networkCosts as SunshineCostsAndTariffsData["networkCosts"];
  const { yearlyData, ...restNetworkCosts } = networkCosts;
  return (
    <DesignStory
      title="Dot Plot Chart"
      reference="ElCom Library (Sunshine Indicators)"
    >
      <DesignGrid>
        <NetworkCostTrendChart
          id="11"
          operatorLabel="Fluxwave Energy"
          observations={yearlyData.filter(
            (d) => d.year === new Date().getFullYear()
          )}
          networkCosts={restNetworkCosts}
          viewBy="latest"
          compareWith={["sunshine.select-all"]}
        />
      </DesignGrid>
    </DesignStory>
  );
};

export const NetworkCostLatestYearCard = () => {
  const networkCosts =
    data.networkCosts as SunshineCostsAndTariffsData["networkCosts"];
  const [state, setQueryState] = useState<
    ReturnType<typeof useQueryStateNetworkCostsTrendCardFilters>[0]
  >({
    compareWith: ["sunshine.select-all"],
    viewBy: "latest",
  });
  return (
    <DesignStory
      title="Dot Plot Chart"
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
        latestYear={new Date().getFullYear()}
        updateDate={new Date().toISOString()}
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
