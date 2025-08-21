import { PriceEvolutionLineCharts as PriceEvolutionLineChartsComponent } from "src/components/detail-page/price-evolution-line-chart";
import { detailsPriceComponents } from "src/domain/data";

import { data } from "./price-evolution-line-chart.mock";

export const PriceEvolutionLineCharts = () => {
  return (
    <PriceEvolutionLineChartsComponent
      observations={data.observations}
      entity={data.entity}
      priceComponents={detailsPriceComponents}
    />
  );
};

const meta = {
  component: PriceEvolutionLineChartsComponent,
  title: "charts/PriceEvolutionLineCharts",
};

export default meta;
