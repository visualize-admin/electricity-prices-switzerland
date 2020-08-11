import { Trans } from "@lingui/macro";
import { Box } from "@theme-ui/components";
import * as React from "react";
import { useState, memo } from "react";
import {
  Entity,
  GenericObservation,
  getEntityLabelField,
  priceComponents,
} from "../../domain/data";
import { getLocalizedLabel } from "../../domain/translation";
import { PriceComponent, useObservationsQuery } from "../../graphql/queries";
import { useQueryState } from "../../lib/use-query-state";
import {
  AnnotationX,
  AnnotationXDataPoint,
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
import { Combobox } from "../combobox";
import { EMPTY_ARRAY } from "../../pages/[locale]/municipality/[id]";

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
  const getItemLabel = (id: string) => getLocalizedLabel({ i18n, id });

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
      <Box sx={{ display: ["none", "none", "block"] }}>
        <RadioTabs
          name="priceComponents"
          options={[
            { value: "total", label: getLocalizedLabel({ i18n, id: "total" }) },
            {
              value: "gridusage",
              label: getLocalizedLabel({ i18n, id: "gridusage" }),
            },
            {
              value: "energy",
              label: getLocalizedLabel({ i18n, id: "energy" }),
            },
            {
              value: "charge",
              label: getLocalizedLabel({ i18n, id: "charge" }),
            },
            {
              value: "aidfee",
              label: getLocalizedLabel({ i18n, id: "aidfee" }),
            },
          ]}
          value={priceComponent as string}
          setValue={(c) => setPriceComponent(c as PriceComponent)}
          variant="segmented"
        />
      </Box>
      <Box sx={{ display: ["block", "block", "none"] }}>
        <Combobox
          id="priceComponents"
          label={<Trans id="selector.priceComponents">Preis Komponenten</Trans>}
          items={priceComponents}
          getItemLabel={getItemLabel}
          selectedItem={priceComponent}
          setSelectedItem={(c) => setPriceComponent(c as PriceComponent)}
          showLabel={false}
        />
      </Box>

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
    const [{ category, product }] = useQueryState();
    const i18n = useI18n();

    const [observationsQuery] = useObservationsQuery({
      variables: {
        priceComponent,
        filters: {
          period: [year],
          category,
          product,
        },
      },
    });
    const observations = observationsQuery.fetching
      ? EMPTY_ARRAY
      : observationsQuery.data?.observations ?? EMPTY_ARRAY;

    const annotations =
      annotationIds &&
      observations
        .filter((obs) => annotationIds.includes(obs[entity]))
        .map((obs) => ({
          muniProvider: `${obs.municipalityLabel}, ${obs.providerLabel}`,
          ...obs,
        }));

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
                componentIri: "muniProvider", // getEntityLabelField(entity),
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
