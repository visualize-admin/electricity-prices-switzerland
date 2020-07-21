import { Trans } from "@lingui/macro";
import { useRouter } from "next/router";
import * as React from "react";
import { EMPTY_ARRAY } from "../../pages/[locale]/municipality/[id]";
import { AxisWidthLinear } from "../charts-generic/axis/axis-width-linear";
import { Range, RangePoints } from "../charts-generic/rangeplot/rangeplot";
import { RangePlot } from "../charts-generic/rangeplot/rangeplot-state";
import { Loading } from "../loading";
import { ChartContainer, ChartSvg } from "../charts-generic/containers";
import { Card } from "./card";
import { PriceComponent, useObservationsQuery } from "../../graphql/queries";
import { useQueryState } from "../../lib/use-query-state";

export const CantonsComparisonRangePlot = () => {
  const [queryState, setQueryState] = useQueryState();

  const [observationsQuery] = useObservationsQuery({
    variables: {
      priceComponent: (queryState.priceComponent as unknown) as PriceComponent,
      filters: {
        period: queryState.period,
        category: queryState.category
          ? queryState.category.map(
              (category) =>
                `https://energy.ld.admin.ch/elcom/energy-pricing/category/${category}`
            )
          : [`https://energy.ld.admin.ch/elcom/energy-pricing/category/H1`],
      },
    },
  });
  const observations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.cubeByIri?.observations ?? EMPTY_ARRAY;

  return (
    <Card
      title={
        <Trans id="detail.card.title.cantons.comparison">
          Kantonsvergleich
        </Trans>
      }
    >
      {observations.length === 0 ? (
        <Loading />
      ) : (
        <RangePlot
          data={observations}
          fields={{
            x: {
              componentIri: "value",
            },
            y: {
              componentIri: "period",
            },
            label: {
              componentIri: "municipality",
            },
            annotation: undefined,
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
              <Range />
              <AxisWidthLinear position="top" />
              <RangePoints />
            </ChartSvg>
          </ChartContainer>
        </RangePlot>
      )}
    </Card>
  );
};
