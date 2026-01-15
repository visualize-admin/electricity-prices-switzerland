import { useState } from "react";

import { useQueryStatePowerStabilityCardFilters } from "src/domain/query-states";
import {
  peerGroupOperatorId,
  peerGroupOperatorName,
} from "src/domain/sunshine";
import data from "src/mocks/sunshine-powerStability-426.json";

import { PowerStabilityCard } from "./power-stability-card";
import { PowerStabilityChart } from "./power-stability-chart";
import { DesignStory } from "./storybook/base-style";

const yearData = data.saidi.yearlyData.filter((x) => x.year === 2024);
const totals = yearData.map((d) => d.total);
const sortedTotals = [...totals].sort((a, b) => a - b);
const mid = Math.floor(sortedTotals.length / 2);
const medianTotal =
  sortedTotals.length % 2 !== 0
    ? sortedTotals[mid]
    : (sortedTotals[mid - 1] + sortedTotals[mid]) / 2;

const unplannedValues = yearData.map((d) => d.unplanned);
const sortedUnplanned = [...unplannedValues].sort((a, b) => a - b);
const medianUnplanned =
  sortedUnplanned.length % 2 !== 0
    ? sortedUnplanned[mid]
    : (sortedUnplanned[mid - 1] + sortedUnplanned[mid]) / 2;

const observationsWithMedian = [
  ...yearData,
  {
    year: 2024,
    total: medianTotal,
    operator_id: peerGroupOperatorId,
    operator_name: peerGroupOperatorName,
    unplanned: medianUnplanned,
  },
];

export const HorizontalBarChart = () => {
  return (
    <DesignStory
      title="Horizontal Bar Chart"
      reference="ElCom Library (Sunshine Indicators)"
    >
      <PowerStabilityChart
        observations={observationsWithMedian}
        id="11"
        operatorLabel="Fluxwave Energy"
        viewBy="latest"
        overallOrRatio="overall"
        saidiSaifiType={"total"}
        compareWith={[]}
      />
    </DesignStory>
  );
};

export const HorizontalBarChartCompact = () => {
  return (
    <DesignStory
      title="Horizontal Bar Chart (Compact)"
      reference="ElCom Library (Sunshine Indicators)"
    >
      <PowerStabilityChart
        observations={observationsWithMedian}
        id="11"
        operatorLabel="Fluxwave Energy"
        viewBy="latest"
        overallOrRatio="overall"
        saidiSaifiType={"total"}
        compareWith={[]}
        compact={true}
      />
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
