import { Trans } from "@lingui/macro";
import { useRouter } from "next/router";
import * as React from "react";

import { Bars } from "../charts-generic/bars/bars-simple";
import { BarChart } from "../charts-generic/bars/bars-state";
import { ChartContainer, ChartSvg } from "../charts-generic/containers";
import { Card } from "./card";
import {
  PriceComponent,
  useObservationsQuery,
  useObservationsWithAllPriceComponentsQuery,
} from "../../graphql/queries";
import { EMPTY_ARRAY } from "../../pages/[locale]/municipality/[id]";
import { Entity, priceComponents, GenericObservation } from "../../domain/data";
import { useQueryState } from "../../lib/use-query-state";
import { Loading } from "../loading";
import { GroupedBarsChart } from "../charts-generic/bars/bars-grouped-state";
import { pivot_longer } from "../../domain/helpers";
import {
  BarsGrouped,
  BarsGroupedLabels,
} from "../charts-generic/bars/bars-grouped";

export const PriceComponentsBarChart = ({
  id,
  entity,
}: {
  id: string;
  entity: Entity;
}) => {
  const [
    { period, category, municipality, provider, canton },
  ] = useQueryState();

  const comparisonIds =
    entity === "municipality"
      ? municipality
      : entity === "provider"
      ? provider
      : canton;

  const entityIds =
    comparisonIds && comparisonIds?.some((m) => m !== "")
      ? [...comparisonIds, id]
      : [id];
  console.log({ id });
  console.log({ entityIds });

  const [observationsQuery] = useObservationsWithAllPriceComponentsQuery({
    variables: {
      filters: {
        period: period,
        [entity]: entityIds,
        category: [
          `https://energy.ld.admin.ch/elcom/energy-pricing/category/${category[0]}`,
        ],
        // product: [product]
      },
    },
  });
  const observations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.cubeByIri?.observations ?? EMPTY_ARRAY;

  // const uniqueIds = muni+provider+year
  const withUniqueEntityId = observations.map((obs) => ({
    uniqueId: `${obs.period}-${obs.municipality}-${obs.providerLabel}`,
    ...obs,
  }));
  const pivoted = pivot_longer({
    data: withUniqueEntityId as $FixMe[],
    cols: priceComponents,
    name_to: "priceComponent",
  });
  return (
    <Card
      title={
        <Trans id="detail.card.title.price.components">Preiskomponenten</Trans>
      }
    >
      {observations.length === 0 ? (
        <Loading />
      ) : (
        <GroupedBarsChart
          data={pivoted}
          fields={{
            x: {
              componentIri: "value",
            },
            y: {
              componentIri: "priceComponent",
              sorting: { sortingType: "byMeasure", sortingOrder: "desc" },
            },
            segment: {
              componentIri: "uniqueId",
              type: "grouped",
              palette: "elcom",
            },
          }}
          measures={[
            {
              iri: "value",
              label: "value",
              __typename: "Measure",
            },
          ]}
          dimensions={[
            {
              iri: "priceComponent",
              label: "priceComponent",
              __typename: "NominalDimension",
            },
          ]}
        >
          <ChartContainer>
            <ChartSvg>
              <BarsGrouped />
              <BarsGroupedLabels />
            </ChartSvg>
          </ChartContainer>
        </GroupedBarsChart>
      )}
    </Card>
  );
};
