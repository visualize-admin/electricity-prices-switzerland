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
import {
  GenericObservation,
  Entity,
  getEntityLabelField,
} from "../../domain/data";
import { useI18n } from "../i18n-context";
import {
  AnnotationXLabel,
  AnnotationX,
} from "../charts-generic/annotation/annotation-x";

export const PriceDistributionHistograms = ({ entity }: { entity: Entity }) => {
  const [{ id, period, municipality, provider, canton }] = useQueryState();
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
        <Trans id="detail.card.title.prices.distribution">
          Preisverteilung in der Schweiz
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
        <PriceDistributionHistogram
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

export const PriceDistributionHistogram = ({
  annotationIds,
  year,
  priceComponent,
  entity,
}: {
  year: string;
  priceComponent: PriceComponent;
  annotationIds: string[];
  entity: Entity;
}) => {
  const [{ category }] = useQueryState();
  const i18n = useI18n();

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
        <Histogram
          data={observations as GenericObservation[]}
          fields={{
            x: {
              componentIri: "value",
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
          aspectRatio={0.3}
        >
          <ChartContainer>
            <ChartSvg>
              <AxisHeightLinear />

              <AxisWidthHistogram />
              <AxisWidthHistogramDomain />
              <AnnotationX />
              <HistogramColumns />
              <Median label="CH Median" />
            </ChartSvg>
            <AnnotationXLabel />
          </ChartContainer>
        </Histogram>
      )}
    </>
  );
};
