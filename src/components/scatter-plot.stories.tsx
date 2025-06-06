import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { Decorator } from "@storybook/react/*";
import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

import { GenericObservation } from "src/domain/data";
import data from "src/graphql/sunshine-data.json";

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
            observations={data as GenericObservation[]}
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
