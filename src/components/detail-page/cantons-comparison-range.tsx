import { Trans } from "@lingui/macro";
import * as React from "react";
import { memo, useState } from "react";
import { GenericObservation } from "../../domain/data";
import { getLocalizedLabel } from "../../domain/translation";
import { PriceComponent, useObservationsQuery } from "../../graphql/queries";
import { useQueryState } from "../../lib/use-query-state";
import { EMPTY_ARRAY } from "../../pages/[locale]/municipality/[id]";
import { AxisWidthLinear } from "../charts-generic/axis/axis-width-linear";
import { ChartContainer, ChartSvg } from "../charts-generic/containers";
import { Range, RangePoints } from "../charts-generic/rangeplot/rangeplot";
import { RangePlot } from "../charts-generic/rangeplot/rangeplot-state";
import { Loading } from "../loading";
import { RadioTabs } from "../radio-tabs";
import { Card } from "./card";
import { FilterSetDescription } from "./filter-set-description";
import { useI18n } from "../i18n-context";

export const CantonsComparisonRangePlots = () => {
  const [{ id, period }] = useQueryState();
  const i18n = useI18n();
  const [priceComponent, setPriceComponent] = useState<PriceComponent>(
    PriceComponent.Total
  );

  const updatePriceComponent = (c: string) =>
    setPriceComponent(c as PriceComponent);
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
          {
            value: "gridusage",
            label: getLocalizedLabel({ i18n, id: "gridusage" }),
          },
          { value: "energy", label: getLocalizedLabel({ i18n, id: "energy" }) },
          { value: "total", label: getLocalizedLabel({ i18n, id: "total" }) },
        ]}
        value={priceComponent as string}
        setValue={updatePriceComponent}
        variant="segmented"
      />
      {period.map((p) => (
        <CantonsComparisonRangePlot
          key={p}
          year={p}
          priceComponent={priceComponent}
          annotationIds={[id]}
        />
      ))}
    </Card>
  );
};

export const CantonsComparisonRangePlot = memo(
  ({
    annotationIds,
    year,
    priceComponent,
  }: {
    annotationIds: string[];
    year: string;
    priceComponent: PriceComponent;
  }) => {
    const [{ category }] = useQueryState();
    const i18n = useI18n();

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

    const annotations = observations.filter((obs) =>
      annotationIds.includes(obs.municipality)
    );

    return (
      <>
        <FilterSetDescription
          filters={{
            period: year,
            category: category[0],
            priceComponent: getLocalizedLabel({ i18n, id: priceComponent }),
          }}
        />
        {observations.length === 0 ? (
          <Loading />
        ) : (
          <RangePlot
            data={observations as GenericObservation[]}
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
              annotation: annotations as {
                [x: string]: string | number | boolean;
              }[],
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
  }
);
