import { useMemo } from "react";

import { PriceComponentsChartV2 } from "src/components/detail-page/price-components-chart-v2";
import { toPriceComponentsRows } from "src/components/detail-page/price-components-chart-v2-layout";
import { ObservationsWithAllPriceComponentsQuery } from "src/graphql/queries";
import { data as operator31Standard } from "src/mocks/graphql/operator-31-standard/ObservationsWithAllPriceComponents";
import { data as operator31Vs36H5 } from "src/mocks/graphql/operator-31-vs-36-h5/ObservationsWithAllPriceComponents";

import type { Meta } from "@storybook/react";

// Recorded with `pnpm mocks:graphql`, the same mocks as the bars chart
const Chart = ({
  colorDomain,
  data,
}: {
  /** The page operator first, then the compared ones */
  colorDomain: string[];
  data: ObservationsWithAllPriceComponentsQuery;
}) => {
  const rows = useMemo(
    () => toPriceComponentsRows(data.observations ?? [], "operator"),
    [data]
  );
  return (
    <PriceComponentsChartV2
      rows={rows}
      colorDomain={colorDomain}
      colorLabels={new Map(data.operators.map((o) => [o.id, o.name]))}
    />
  );
};

const TWO_OPERATORS = ["31", "36"];
const SINGLE_OPERATOR = ["31"];

export const TwoOperatorsH5 = () => (
  <Chart colorDomain={TWO_OPERATORS} data={operator31Vs36H5} />
);

export const SingleOperator = () => (
  <Chart colorDomain={SINGLE_OPERATOR} data={operator31Standard} />
);

const meta: Meta = {
  component: PriceComponentsChartV2,
  title: "components/PriceComponentsChartV2",
};

export default meta;
