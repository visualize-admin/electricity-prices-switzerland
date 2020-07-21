import { Trans } from "@lingui/macro";
import { useRouter } from "next/router";
import * as React from "react";
import { EMPTY_ARRAY } from "../../pages/[locale]/municipality/[id]";
import { AxisWidthLinear } from "../charts-generic/axis/axis-width-linear";
import { Range, RangePoints } from "../charts-generic/rangeplot/rangeplot";
import { RangePlot } from "../charts-generic/rangeplot/rangeplot-state";
import { Loading } from "../loading";
import {
  ChartContainer,
  ChartSvg,
} from "./../../components/charts-generic/containers";
import { Card } from "./../../components/detail-page/card";
import { PriceComponent, useObservationsQuery } from "./../../graphql/queries";
import { Histogram } from "../charts-generic/histogram/histogram-state";
import { AxisHeightLinear } from "../charts-generic/axis/axis-height-linear";
import {
  AxisWidthHistogram,
  AxisWidthHistogramDomain,
} from "../charts-generic/axis/axis-width-histogram";
import { HistogramColumns } from "../charts-generic/histogram/histogram";
import { Median } from "../charts-generic/histogram/median";
import { Tooltip } from "../charts-generic/interaction/tooltip";

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
