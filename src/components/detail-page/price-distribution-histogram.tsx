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
import { useQueryState } from "../../lib/use-query-state";
import { useState } from "react";
import { getLocalizedLabel } from "../../domain/translation";
import { RadioTabs } from "../radio-tabs";
import { FilterSetDescription } from "./filter-set-description";

export const PriceDistributionHistograms = () => {
  const [{ period }] = useQueryState();
  const [priceComponent, setPriceComponent] = useState<PriceComponent>(
    PriceComponent.Total
  );
  return (
    <Card
      title={
        <Trans id="detail.card.title.prices.distribution">
          Preisverteilung in der Schweiz
        </Trans>
      }
    >
      <RadioTabs
        name="priceComponents"
        options={[
          { value: "gridusage", label: getLocalizedLabel("gridusage") },
          { value: "energy", label: getLocalizedLabel("energy") },
          { value: "total", label: getLocalizedLabel("total") },
        ]}
        value={priceComponent}
        setValue={setPriceComponent}
        variant="segmented"
      />
      {period.map((p) => (
        <PriceDistributionHistogram year={p} priceComponent={priceComponent} />
      ))}
    </Card>
  );
};

export const PriceDistributionHistogram = ({
  year,
  priceComponent,
}: {
  year: string;
  priceComponent: PriceComponent;
}) => {
  const [{ category }] = useQueryState();

  const [observationsQuery] = useObservationsQuery({
    variables: {
      priceComponent,
      filters: {
        period: [year],
        category: [
          `https://energy.ld.admin.ch/elcom/energy-pricing/category/${category}`,
        ],
      },
    },
  });
  const observations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.cubeByIri?.observations ?? EMPTY_ARRAY;
  console.log({ observations });
  return (
    <>
      <FilterSetDescription
        filters={{
          period: year,
          category: category[0],
          priceComponent: getLocalizedLabel(priceComponent),
        }}
      />
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
    </>
  );
};
