import { Trans } from "@lingui/macro";
import * as React from "react";
import { memo, useState } from "react";
import {
  GenericObservation,
  getPriceComponentOptions,
} from "../../domain/data";
import { getLocalizedLabel } from "../../domain/translation";
import { PriceComponent, useObservationsQuery } from "../../graphql/queries";
import { useQueryState } from "../../lib/use-query-state";
import { EMPTY_ARRAY } from "../../pages/[locale]/municipality/[id]";
import {
  AnnotationX,
  AnnotationXLabel,
} from "../charts-generic/annotation/annotation-x";
import { AxisWidthLinear } from "../charts-generic/axis/axis-width-linear";
import { ChartContainer, ChartSvg } from "../charts-generic/containers";
import { Range, RangePoints } from "../charts-generic/rangeplot/rangeplot";
import { RangePlot } from "../charts-generic/rangeplot/rangeplot-state";
import { useI18n } from "../i18n-context";
import { Loading } from "../loading";
import { RadioTabs } from "../radio-tabs";
import { Card } from "./card";
import { FilterSetDescription } from "./filter-set-description";

export const CantonsComparisonRangePlots = ({ id }: { id: string }) => {
  const [{ period, municipality }] = useQueryState();

  const i18n = useI18n();
  const [priceComponent, setPriceComponent] = useState<PriceComponent>(
    PriceComponent.Total
  );

  const annotationIds =
    municipality && municipality?.some((m) => m !== "")
      ? [...municipality, id]
      : [id];

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
        options={getPriceComponentOptions()}
        value={priceComponent as string}
        setValue={(c) => setPriceComponent(c as PriceComponent)}
        variant="segmented"
      />
      {period.map((p) => (
        <CantonsComparisonRangePlot
          key={p}
          year={p}
          priceComponent={priceComponent}
          annotationIds={annotationIds}
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
          category:
            // FIXME: category should be a string?
            category
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

    const annotations =
      annotationIds &&
      observations.filter((obs) => annotationIds.includes(obs.municipality));

    console.log(category, year, priceComponent, { annotations });

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
                <AnnotationX />
              </ChartSvg>
              <AnnotationXLabel />
            </ChartContainer>
          </RangePlot>
        )}
      </>
    );
  }
);
