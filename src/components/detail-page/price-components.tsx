import { Trans } from "@lingui/macro";
import { useRouter } from "next/router";
import * as React from "react";

import { Bars } from "./../../components/charts-generic/bars/bars-simple";
import { BarChart } from "./../../components/charts-generic/bars/bars-state";
import {
  ChartContainer,
  ChartSvg,
} from "./../../components/charts-generic/containers";
import { Card } from "./../../components/detail-page/card";
import { PriceComponent, useObservationsQuery } from "./../../graphql/queries";
import { EMPTY_ARRAY } from "../../pages/[locale]/municipality/[id]";

export const PriceComponents = () => {
  const { query } = useRouter();

  const priceComponent = PriceComponent.Total; // TODO: parameterize priceComponent
  const category = (query.category as string) ?? "H4";
  const year = (query.year as string) ?? "2019";

  const [observationsQuery] = useObservationsQuery({
    variables: {
      priceComponent,
      filters: {
        period: [year],
        category: [
          `https://energy.ld.admin.ch/elcom/energy-pricing/category/${category}`,
        ],
        municipality: [
          `http://classifications.data.admin.ch/municipality/${query.id}`,
        ],
      },
    },
  });
  const observations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.cubeByIri?.observations ?? EMPTY_ARRAY;

  return (
    <Card
      title={
        <Trans id="detail.card.title.price.components">Preiskomponenten</Trans>
      }
    >
      <BarChart
        data={observations.map((obs: $FixMe) => ({
          priceComponent: "Total (exkl. MwSt.)",
          ...obs,
        }))}
        fields={{
          x: {
            componentIri: "value",
          },
          y: {
            componentIri: "priceComponent",
            sorting: { sortingType: "byMeasure", sortingOrder: "desc" },
          },
        }}
        measures={[
          {
            iri: "value",
            label: "value",
            __typename: "Measure",
          },
        ]}
      >
        <ChartContainer>
          <ChartSvg>
            <Bars />
          </ChartSvg>
        </ChartContainer>
      </BarChart>
    </Card>
  );
};
