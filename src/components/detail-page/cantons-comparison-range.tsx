import { t, Trans } from "@lingui/macro";
import { Box } from "@theme-ui/components";
import { extent, median } from "d3";
import { groups } from "d3-array";
import * as React from "react";
import { memo } from "react";
import { Entity, GenericObservation, priceComponents } from "../../domain/data";
import { getLocalizedLabel } from "../../domain/translation";
import {
  ObservationType,
  PriceComponent,
  useObservationsQuery,
} from "../../graphql/queries";
import { EMPTY_ARRAY } from "../../lib/empty-array";
import { useLocale } from "../../lib/use-locale";
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
import { Combobox } from "../combobox";
import { Loading, NoDataHint } from "../hint";
import { useI18n } from "../i18n-context";
import { MapPriceColorLegend } from "../price-color-legend";
import { RadioTabs } from "../radio-tabs";
import { Card } from "./card";
import { Download } from "./download-image";
import { FilterSetDescription } from "./filter-set-description";
import { WithClassName } from "./with-classname";

const DOWNLOAD_ID: Download = "comparison";

export const CantonsComparisonRangePlots = ({
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

  const i18n = useI18n();

  const getItemLabel = (id: string) => getLocalizedLabel({ i18n, id });

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
        <Trans id="detail.card.title.cantons.comparison">
          Kantonsvergleich
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
                  label: getLocalizedLabel({ i18n, id: "total" }),
                },
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
              value={priceComponent[0] as string}
              setValue={(pc) => setQueryState({ priceComponent: [pc] })}
              variant="segmented"
            />
          </Box>
          <Box sx={{ display: ["block", "block", "none"] }}>
            <Combobox
              id="priceComponents"
              label={i18n._(t("selector.priceComponents")`Preiskomponenten`)}
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
        <CantonsComparisonRangePlot
          key={p}
          year={p}
          priceComponent={priceComponent[0] as PriceComponent}
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
    const locale = useLocale();
    const [{ category, product }] = useQueryState();
    const i18n = useI18n();

    const [observationsQuery] = useObservationsQuery({
      variables: {
        locale,
        priceComponent,
        filters: {
          period: [year],
          category,
          product,
        },
        observationType:
          entity === "canton"
            ? ObservationType.MedianObservation
            : ObservationType.OperatorObservation,
      },
    });
    const observations = observationsQuery.fetching
      ? EMPTY_ARRAY
      : observationsQuery.data?.observations ?? EMPTY_ARRAY;

    const annotations =
      annotationIds &&
      observations
        .filter((obs) => annotationIds.includes((obs as $FixMe)[entity]))
        .map((obs) => ({
          muniOperator:
            obs.__typename === "OperatorObservation"
              ? `${obs.municipalityLabel}, ${obs.operatorLabel}`
              : obs.cantonLabel,
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
              cantonLabel: d[1][0].cantonLabel,
              // Made up label with the number of entities
              muniOperator: `${d[1][0][`${entity}Label`]}, ${
                d[1].length
              } ${getLocalizedLabel({
                i18n,
                id: entity === "operator" ? "municipalities" : "operators",
              })}`,
            };
      })
    );

    const d = extent(observations, (d) => d.value);
    const m = median(observations, (d) => d.value);
    return (
      <>
        <FilterSetDescription
          filters={{
            period: year,
            category: category[0],
            product: product[0],
            priceComponent: getLocalizedLabel({ i18n, id: priceComponent }),
          }}
        />
        {observationsQuery.fetching ? (
          <Loading />
        ) : observations.length === 0 ? (
          <NoDataHint />
        ) : (
          <WithClassName downloadId={DOWNLOAD_ID}>
            <MapPriceColorLegend stats={[d[0], m, d[1]]} />

            <RangePlot
              data={observations as GenericObservation[]}
              fields={{
                x: {
                  componentIri: "value",
                },
                y: {
                  componentIri: "cantonLabel",
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
            >
              <ChartContainer>
                <ChartSvg>
                  <Range id={year} />
                  <AxisWidthLinear position="top" />
                  <RangePoints />
                  <AnnotationX />
                  <AnnotationXDataPoint />
                </ChartSvg>
                <AnnotationXLabel />
              </ChartContainer>
            </RangePlot>
          </WithClassName>
        )}
      </>
    );
  }
);
