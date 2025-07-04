import data from "mocks/sunshine-costsAndTariffs-426.json";

import { SunshineCostsAndTariffsData } from "src/domain/data";

import { NetworkCostTrendChart } from "./network-cost-trend-chart";
import { DesignGrid, DesignStory } from "./storybook/base-style";

export const ScatterpotChart = () => {
  const networkCosts =
    data.networkCosts as SunshineCostsAndTariffsData["networkCosts"];
  const { yearlyData, ...restNetworkCosts } = networkCosts;
  return (
    <DesignStory
      title="Scatterplot Chart"
      reference="ElCom Library (Sunshine Indicators)"
    >
      <DesignGrid>
        <NetworkCostTrendChart
          id="11"
          operatorLabel="Elektrizitätswerk des Kantons Schaffhausen AG"
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

const meta = {
  component: ScatterpotChart,
  title: "charts/ScatterpotChart",
};

export default meta;
