import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { Decorator } from "@storybook/react/*";
import data from "mocks/fetchOperatorCostsAndTariffsData-426.json";
import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

import { SunshineCostsAndTariffsData } from "src/domain/data";

import { NetworkCostTrendChart } from "./network-cost-trend-chart";
import { DesignGrid, DesignStory } from "./storybook/base-style";

export const ScatterpotChart = () => {
  return (
    <I18nProvider i18n={i18n}>
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
    </I18nProvider>
  );
};

const withQueryClient: Decorator = (Story) => {
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  );
};

const meta = {
  component: ScatterpotChart,
  title: "charts/ScatterpotChart",
  decorators: [withQueryClient],
};

export default meta;
