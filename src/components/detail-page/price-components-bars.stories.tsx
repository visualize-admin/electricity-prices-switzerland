import { ComponentProps, useState } from "react";

import { PriceComponentsCard } from "src/components/detail-page/price-components-bars";
import { ObservationsWithAllPriceComponentsQuery } from "src/graphql/queries";
import { data as canton2 } from "src/mocks/graphql/canton-2/ObservationsWithAllPriceComponents";
import { data as operator31Standard } from "src/mocks/graphql/operator-31-standard/ObservationsWithAllPriceComponents";
import { data as operator31Vs814Dynamic } from "src/mocks/graphql/operator-31-vs-814-dynamic/ObservationsWithAllPriceComponents";

import { withUrqlClient } from "../../../.storybook/decorators";

import type { Meta } from "@storybook/react";

type CardProps = ComponentProps<typeof PriceComponentsCard>;

// Recorded with `pnpm mocks:graphql`, the same mocks as the unit tests
const Card = ({
  entity,
  id,
  data,
  operator,
  category,
  product,
}: {
  entity: "operator" | "canton";
  id: string;
  data: ObservationsWithAllPriceComponentsQuery;
  operator?: string[];
  category: CardProps["category"][number];
  product: CardProps["product"][number];
}) => {
  const [view, setView] = useState<"collapsed" | "expanded">("collapsed");
  return (
    <PriceComponentsCard
      id={id}
      entity={entity}
      data={data}
      fetching={false}
      period={["2027"]}
      category={[category]}
      product={[product]}
      operator={operator}
      view={[view]}
      download={undefined}
      setView={setView}
    />
  );
};

export const DynamicAndMissingOperator = () => (
  <Card
    entity="operator"
    id="31"
    operator={["814"]}
    data={operator31Vs814Dynamic}
    category="H3"
    product="cheapest"
  />
);

export const Operator = () => (
  <Card
    entity="operator"
    id="31"
    data={operator31Standard}
    category="H4"
    product="standard"
  />
);

export const CantonWithoutMeteringRate = () => (
  <Card
    entity="canton"
    id="2"
    data={canton2}
    category="H3"
    product="cheapest"
  />
);

const meta: Meta = {
  component: PriceComponentsCard,
  title: "components/PriceComponentsCard",
  decorators: [withUrqlClient],
};

export default meta;
