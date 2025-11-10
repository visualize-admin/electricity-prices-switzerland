import { useState } from "react";

import { useQueryStatePowerStabilityCardFilters } from "src/domain/query-states";
import data from "src/mocks/sunshine-powerStability-426.json";

import { PowerStabilityCard } from "./power-stability-card";
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
          saidiSaifiType={"total"}
          compareWith={[]}
        />
      </DesignGrid>
    </DesignStory>
  );
};

export const HorizontalBarChartCard = () => {
  const [state, setQueryState] = useState<
    ReturnType<typeof useQueryStatePowerStabilityCardFilters>[0]
  >({
    compareWith: [],
    viewBy: "latest",
    saidiSaifiType: "total",
    overallOrRatio: "overall",
  });

  return (
    <DesignStory
      title="Power Stability Card"
      reference="ElCom Library (Sunshine Indicators)"
    >
      <PowerStabilityCard
        state={state}
        setQueryState={(newState) =>
          newState && setQueryState((prev) => ({ ...prev, ...newState }))
        }
        peerGroup={{
          id: "0",
          energyDensity: "na",
          settlementDensity: "unknown",
        }}
        updateDate={data.saidi.yearlyData[0].year.toString()}
        latestYear={2024}
        operatorId="11"
        operatorLabel="Elektrizitätswerk des Kantons Schaffhausen AG"
        observations={data.saidi.yearlyData.filter((x) => x.year === 2024)}
        cardTitle="Average Power Outage Frequency (SAIFI)"
      />
    </DesignStory>
  );
};

const meta = {
  component: HorizontalBarChart,
  title: "charts/HorizontalBarChart",
};

export default meta;
