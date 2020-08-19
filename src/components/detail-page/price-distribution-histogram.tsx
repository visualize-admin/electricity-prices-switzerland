import { Trans } from "@lingui/macro";
import { Box } from "@theme-ui/components";
import * as React from "react";
import { Entity, GenericObservation, priceComponents } from "../../domain/data";
import { getLocalizedLabel } from "../../domain/translation";
import { useQueryState } from "../../lib/use-query-state";
import { EMPTY_ARRAY } from "../../pages/[locale]/municipality/[id]";
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
import { useI18n } from "../i18n-context";
import { Loading } from "../loading";
import { RadioTabs } from "../radio-tabs";
import {
  ChartContainer,
  ChartSvg,
} from "./../../components/charts-generic/containers";
import { Card } from "./../../components/detail-page/card";
import { PriceComponent, useObservationsQuery } from "./../../graphql/queries";
import { Download, DownloadImage } from "./download-image";
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
    { period, municipality, provider, canton, priceComponent },
    setQueryState,
  ] = useQueryState();
  const i18n = useI18n();

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
        <Trans id="detail.card.title.prices.distribution">
          Preisverteilung in der Schweiz
        </Trans>
      }
      id={DOWNLOAD_ID}
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
          value={priceComponent[0] as string}
          setValue={(pc) => setQueryState({ priceComponent: [pc] })}
          variant="segmented"
        />
      </Box>
      <Box sx={{ display: ["block", "block", "none"] }}>
        <Combobox
          id="priceComponents"
          label={<Trans id="selector.priceComponents">Preis Komponenten</Trans>}
          items={priceComponents}
          getItemLabel={getItemLabel}
          selectedItem={priceComponent[0]}
          setSelectedItem={(pc) => setQueryState({ priceComponent: [pc] })}
          showLabel={false}
        />
      </Box>
      {period.map((p) => (
        <PriceDistributionHistogram
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
        <WithClassName downloadId={DOWNLOAD_ID}>
          <Histogram
            data={observations as GenericObservation[]}
            fields={{
              x: {
                componentIri: "value",
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
