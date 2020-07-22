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
import { useState } from "react";
import { FilterSetDescription } from "./filter-set-description";
import { RadioTabs } from "../radio-tabs";
import { getLocalizedLabel } from "../../domain/translation";

export const CantonsComparisonRangePlots = () => {
  const [{ period }] = useQueryState();
  const [priceComponent, setPriceComponent] = useState<PriceComponent>(
    PriceComponent.Total
  );
  return (
    <Card
      title={
        <Trans id="detail.card.title.cantons.comparison">
          Kantonsvergleich
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
        <CantonsComparisonRangePlot year={p} priceComponent={priceComponent} />
      ))}
    </Card>
  );
};

export const CantonsComparisonRangePlot = ({
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
        category: category
          ? category.map(
              (cat) =>
                `https://energy.ld.admin.ch/elcom/energy-pricing/category/${cat}`
            )
          : [`https://energy.ld.admin.ch/elcom/energy-pricing/category/H1`],
      },
    },
  });
  const observations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.cubeByIri?.observations ?? EMPTY_ARRAY;

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
    </>
  );
};
