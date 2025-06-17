import data from "mocks/fetchOperatorCostsAndTariffsData-426.json";

import { SunshineCostsAndTariffsData } from "src/domain/data";

import { NetworkCostTrendChart } from "./network-cost-trend-chart";
import { DesignGrid, DesignStory } from "./storybook/base-style";

export const ScatterpotChart = () => {
  return (
    <DesignStory
      title="Scatterplot Chart"
      reference="ElCom Library (Sunshine Indicators)"
    >
      <DesignGrid>
        <NetworkCostTrendChart
          id="11"
          operatorLabel="Elektrizitätswerk des Kantons Schaffhausen AG"
          observations={
            data.networkCosts as SunshineCostsAndTariffsData["networkCosts"]
          }
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
