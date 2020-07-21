import { Trans } from "@lingui/macro";
import { useRouter } from "next/router";
import * as React from "react";
import { EMPTY_ARRAY } from "../../pages/[locale]/municipality/[id]";
import { AxisHeightLinear } from "../charts-generic/axis/axis-height-linear";
import {
  AxisWidthHistogram,
  AxisWidthHistogramDomain,
} from "../charts-generic/axis/axis-width-histogram";
import { HistogramColumns } from "../charts-generic/histogram/histogram";
import { Histogram } from "../charts-generic/histogram/histogram-state";
import { Median } from "../charts-generic/histogram/median";
import { Tooltip } from "../charts-generic/interaction/tooltip";
import { Loading } from "../loading";
import {
  ChartContainer,
  ChartSvg,
} from "./../../components/charts-generic/containers";
import { Card } from "./../../components/detail-page/card";
import { PriceComponent, useObservationsQuery } from "./../../graphql/queries";

export const PriceDistributionHistogram = ({
  period,
}: {
  period: string[];
}) => {
  const { query } = useRouter();

  const priceComponent = PriceComponent.Total; // TODO: parameterize priceComponent
  const category = (query.category as string) ?? "H4";
  const year = (query.year as string) ?? "2019";

  const [observationsQuery] = useObservationsQuery({
    variables: {
      priceComponent,
      filters: {
        period,
        category: [
          `https://energy.ld.admin.ch/elcom/energy-pricing/category/${category}`,
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
        <Trans id="detail.card.title.prices.distribution">
          Preisverteilung in der Schweiz
        </Trans>
      }
    >
      {observations.length === 0 ? (
        <Loading />
      ) : (
        <Histogram
          data={observations}
          fields={{
            x: {
              componentIri: "value",
            },
            label: {
              componentIri: "Netzbetreiber",
            },
          }}
          measures={[
            {
              iri: "value",
              label: "value",
              __typename: "Measure",
            },
          ]}
          aspectRatio={0.3}
        >
          <ChartContainer>
            <ChartSvg>
              <AxisHeightLinear />

              <AxisWidthHistogram />
              <AxisWidthHistogramDomain />
              <HistogramColumns />
              <Median label="CH Median" />
            </ChartSvg>
            <Tooltip type="single" />
          </ChartContainer>
        </Histogram>
      )}
    </Card>
  );
};
