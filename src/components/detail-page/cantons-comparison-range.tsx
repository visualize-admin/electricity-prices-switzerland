import { Trans } from "@lingui/macro";
import { Box, Text } from "@theme-ui/components";
import { useRouter } from "next/router";
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
import { RadioTabs } from "../radio-tabs";
import { Card } from "./card";
import { Download, DownloadImage } from "./download-image";
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
  const { query } = useRouter();

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
      id={DOWNLOAD_ID}
    >
      {!query.download ? (
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
              label={
                <Trans id="selector.priceComponents">Preis Komponenten</Trans>
              }
              items={priceComponents}
              getItemLabel={getItemLabel}
              selectedItem={priceComponent[0]}
              setSelectedItem={(pc) => setQueryState({ priceComponent: [pc] })}
              showLabel={false}
            />
          </Box>
        </>
      ) : (
        <Text>
          <Trans id="detail.card.priceComponent">Preis Komponent:</Trans>{" "}
          {getLocalizedLabel({ i18n, id: priceComponent[0] })}
        </Text>
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
      <DownloadImage
        elementId={DOWNLOAD_ID}
        fileName={DOWNLOAD_ID}
        entity={entity}
        id={id}
        download={DOWNLOAD_ID}
      />
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

    return (
      <>
        <FilterSetDescription
          filters={{
            period: year,
            category: category[0],
            priceComponent: getLocalizedLabel({ i18n, id: priceComponent }),
          }}
        />
        {observationsQuery.fetching ? (
          <Loading />
        ) : observations.length === 0 ? (
          <NoDataHint />
        ) : (
          <WithClassName downloadId={DOWNLOAD_ID}>
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
