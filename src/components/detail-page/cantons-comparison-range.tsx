import { Trans } from "@lingui/macro";
import * as React from "react";
import { memo, useState } from "react";
import {
  GenericObservation,
  Entity,
  getEntityLabelField,
} from "../../domain/data";
import { getLocalizedLabel } from "../../domain/translation";
import { PriceComponent, useObservationsQuery } from "../../graphql/queries";
import { useQueryState } from "../../lib/use-query-state";
import { EMPTY_ARRAY } from "../../pages/[locale]/municipality/[id]";
import {
  AnnotationX,
  AnnotationXLabel,
  AnnotationXDataPoint,
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

export const CantonsComparisonRangePlots = ({
  id,
  entity,
}: {
  id: string;
  entity: Entity;
}) => {
  const [{ period, municipality, provider, canton }] = useQueryState();

  const i18n = useI18n();
  const [priceComponent, setPriceComponent] = useState<PriceComponent>(
    PriceComponent.Total
  );

  const comparisonIds =
    entity === "municipality"
      ? municipality
      : entity === "provider"
      ? provider
      : canton;

  const annotationIds =
    comparisonIds && comparisonIds?.some((m) => m !== "")
      ? [...comparisonIds, id]
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
        options={[
          { value: "total", label: getLocalizedLabel({ i18n, id: "total" }) },
          {
            value: "gridusage",
            label: getLocalizedLabel({ i18n, id: "gridusage" }),
          },
          { value: "energy", label: getLocalizedLabel({ i18n, id: "energy" }) },
          { value: "charge", label: getLocalizedLabel({ i18n, id: "charge" }) },
          { value: "aidfee", label: getLocalizedLabel({ i18n, id: "aidfee" }) },
        ]}
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
          entity={entity}
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
    entity,
  }: {
    annotationIds: string[];
    year: string;
    priceComponent: PriceComponent;
    entity: Entity;
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
                componentIri: getEntityLabelField(entity),
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
                <AnnotationXDataPoint />
              </ChartSvg>
              <AnnotationXLabel />
            </ChartContainer>
          </RangePlot>
        )}
      </>
    );
  }
);