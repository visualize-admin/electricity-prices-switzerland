import data from "mocks/sunshine-powerStability-426.json";

import { PowerStabilityChart } from "./power-stability-chart";
import { DesignGrid, DesignStory } from "./storybook/base-style";

export const HorizontalBarChart = () => {
  return (
    <DesignStory
      title="Horizontal Bar Chart"
      reference="ElCom Library (Sunshine Indicators)"
    >
      <DesignGrid>
        <PowerStabilityChart
          observations={data.saidi.yearlyData.filter((x) => x.year === 2024)}
          id="11"
          operatorLabel="Elektrizitätswerk des Kantons Schaffhausen AG"
          viewBy="latest"
          overallOrRatio="overall"
          duration={"total"}
        />
      </DesignGrid>
    </DesignStory>
  );
};

const meta = {
  component: HorizontalBarChart,
  title: "charts/HorizontalBarChart",
};

export default meta;
