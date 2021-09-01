import { t, Trans } from "@lingui/macro";
import { Box } from "@theme-ui/components";
import { groups } from "d3-array";
import * as React from "react";
import { useState } from "react";
import { Entity, GenericObservation, priceComponents } from "../../domain/data";
import { getLocalizedLabel } from "../../domain/translation";
import { EMPTY_ARRAY } from "../../lib/empty-array";
import { useLocale } from "../../lib/use-locale";
import { useQueryState } from "../../lib/use-query-state";
import {
  AnnotationX,
  AnnotationXLabel,
} from "../charts-generic/annotation/annotation-x";
import { AxisHeightLinear } from "../charts-generic/axis/axis-height-linear";
import { AxisWidthHistogramDomain } from "../charts-generic/axis/axis-width-histogram";
import { HistogramColumns } from "../charts-generic/histogram/histogram";
import { HistogramMinMaxValues } from "../charts-generic/histogram/histogram-min-max-values";
import { Histogram } from "../charts-generic/histogram/histogram-state";
import { HistogramMedian } from "../charts-generic/histogram/median";
import { Combobox } from "../combobox";
import { Loading, NoDataHint } from "../hint";
import { RadioTabs } from "../radio-tabs";
import {
  ChartContainer,
  ChartSvg,
} from "./../../components/charts-generic/containers";
import { Card } from "./../../components/detail-page/card";
import {
  ObservationKind,
  PriceComponent,
  useObservationsQuery,
} from "./../../graphql/queries";
import { Download } from "./download-image";
import { FilterSetDescription } from "./filter-set-description";
import { WithClassName } from "./with-classname";

const DOWNLOAD_ID: Download = "distribution";

export const PriceDistributionHistograms = ({
  id,
  entity,
}: {
  id: string;
  entity: Entity;
}) => {
  const [
    { period, municipality, operator, canton, priceComponent, download },
    setQueryState,
  ] = useQueryState();

  const getItemLabel = (id: string) => getLocalizedLabel({ id });

  const comparisonIds =
    entity === "municipality"
      ? municipality
      : entity === "operator"
      ? operator
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
      downloadId={DOWNLOAD_ID}
      id={id}
      entity={entity}
    >
      {!download && (
        <>
          <Box sx={{ display: ["none", "none", "block"] }}>
            <RadioTabs
              name="priceComponents"
              options={[
                {
                  value: "total",
                  label: getLocalizedLabel({ id: "total" }),
                },
                {
                  value: "gridusage",
                  label: getLocalizedLabel({ id: "gridusage" }),
                },
                {
                  value: "energy",
                  label: getLocalizedLabel({ id: "energy" }),
                },
                {
                  value: "charge",
                  label: getLocalizedLabel({ id: "charge" }),
                },
                {
                  value: "aidfee",
                  label: getLocalizedLabel({ id: "aidfee" }),
                },
              ]}
              value={priceComponent[0] as string}
              setValue={(pc) => setQueryState({ priceComponent: [pc] })}
              variant="segmented"
            />
          </Box>
          <Box sx={{ display: ["block", "block", "none"] }}>
            <Combobox
              id="priceComponents-histogram"
              label={t({
                id: "selector.priceComponents",
                message: `Preiskomponenten`,
              })}
              items={priceComponents}
              getItemLabel={getItemLabel}
              selectedItem={priceComponent[0]}
              setSelectedItem={(pc) => setQueryState({ priceComponent: [pc] })}
              showLabel={false}
            />
          </Box>
        </>
      )}
      {period.map((p) => (
        <PriceDistributionHistogram
          key={p}
          year={p}
          priceComponent={priceComponent[0] as PriceComponent}
          annotationIds={annotationIds}
          entity={entity}
        />
      ))}
      {/* <Box sx={{ color: "monochrome700", fontSize: 2 }}>
        <Trans id="chart.unit.cent.kWh">Preise in Rp./kWh</Trans>
      </Box> */}
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
  const locale = useLocale();
  const [{ category, product }] = useQueryState();

  const [observationsQuery] = useObservationsQuery({
    variables: {
      locale,
      priceComponent,
      filters: {
        period: [year],
        category,
        product,
      },
      observationKind:
        entity === "canton"
          ? ObservationKind.Canton
          : ObservationKind.Municipality,
    },
  });

  const operatorObservations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.observations ?? EMPTY_ARRAY;
  const cantonObservations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.cantonMedianObservations ?? EMPTY_ARRAY;
  const swissObservations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.swissMedianObservations ?? EMPTY_ARRAY;

  const medianValue = swissObservations[0]?.value;

  const observations = [...operatorObservations, ...cantonObservations];

  const annotations =
    annotationIds &&
    observations
      .filter((obs) => annotationIds.includes((obs as $FixMe)[entity]))
      .map((obs) => ({
        muniOperator:
          obs.__typename === "OperatorObservation"
            ? `${obs.municipalityLabel}, ${obs.operatorLabel}`
            : `${obs.cantonLabel}`,
        ...obs,
      }));

  // To avoid too many annotations, we group entities by value
  // when more than one entity has the same value.
  const groupedAnnotations = groups(
    annotations,
    (d) => (d as GenericObservation)[entity],
    (d) => d.value
  ).flatMap((ent: $FixMe) =>
    ent[1].flatMap((d: $FixMe) => {
      return d[1].length === 1
        ? // If only one entity has this value, we show the full name
          { ...d[1][0] }
        : {
            value: d[0],
            // Made up label with the number of entities
            muniOperator: `${d[1][0][`${entity}Label`]}, ${
              d[1].length
            } ${getLocalizedLabel({
              id: entity === "operator" ? "municipalities" : "operators",
            })}`,
          };
    })
  );
  return (
    <>
      <FilterSetDescription
        filters={{
          period: year,
          category: category[0],
          product: product[0],
          priceComponent: getLocalizedLabel({ id: priceComponent }),
        }}
      />
      {observationsQuery.fetching ? (
        <Loading />
      ) : observations.length === 0 ? (
        <NoDataHint />
      ) : (
        <WithClassName
          downloadId={DOWNLOAD_ID}
          isFetching={observationsQuery.fetching}
        >
          <Histogram
            data={observations as GenericObservation[]}
            medianValue={medianValue}
            fields={{
              x: {
                componentIri: "value",
              },
              label: {
                componentIri: "muniOperator",
              },
              annotation: groupedAnnotations as {
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

                {/* <AxisWidthHistogram /> */}
                <HistogramMinMaxValues />
                <AxisWidthHistogramDomain />

                <AnnotationX />
                <HistogramColumns />
                <HistogramMedian label="CH Median" />
              </ChartSvg>
              <AnnotationXLabel />
            </ChartContainer>
          </Histogram>
        </WithClassName>
      )}
    </>
  );
};
