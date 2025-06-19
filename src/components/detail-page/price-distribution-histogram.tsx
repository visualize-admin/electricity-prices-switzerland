import { t, Trans } from "@lingui/macro";
import { Box } from "@mui/material";
import { groups } from "d3";

import {
  ChartContainer,
  ChartSvg,
} from "src//components/charts-generic/containers";
import {
  ObservationKind,
  PriceComponent,
  useObservationsQuery,
} from "src//graphql/queries";
import { ButtonGroup } from "src/components/button-group";
import {
  AnnotationX,
  AnnotationXLabel,
} from "src/components/charts-generic/annotation/annotation-x";
import { AxisHeightLinear } from "src/components/charts-generic/axis/axis-height-linear";
import { AxisWidthHistogramDomain } from "src/components/charts-generic/axis/axis-width-histogram";
import { HistogramColumns } from "src/components/charts-generic/histogram/histogram";
import { HistogramMinMaxValues } from "src/components/charts-generic/histogram/histogram-min-max-values";
import { Histogram } from "src/components/charts-generic/histogram/histogram-state";
import { HistogramMedian } from "src/components/charts-generic/histogram/median";
import { Tooltip } from "src/components/charts-generic/interaction/tooltip";
import { ColorLegend } from "src/components/color-legend";
import { Combobox } from "src/components/combobox";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  SectionProps,
} from "src/components/detail-page/card";
import {
  Download,
  DownloadImage,
} from "src/components/detail-page/download-image";
import { FilterSetDescription } from "src/components/detail-page/filter-set-description";
import { WithClassName } from "src/components/detail-page/with-classname";
import { Loading, NoDataHint } from "src/components/hint";
import { InfoDialogButton } from "src/components/info-dialog";
import { Entity, GenericObservation, priceComponents } from "src/domain/data";
import { getLocalizedLabel } from "src/domain/translation";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { useLocale } from "src/lib/use-locale";
import { useQueryStateElectricity } from "src/lib/use-query-state";

import { InteractionHistogram } from "../charts-generic/overlay/interaction-histogram";

const DOWNLOAD_ID: Download = "distribution";

export const PriceDistributionHistograms = ({ id, entity }: SectionProps) => {
  const [
    {
      period,
      municipality,
      operator,
      canton,
      priceComponent,
      download,
      category,
      product,
    },
    setQueryState,
  ] = useQueryStateElectricity();

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

  const filters = {
    period: period[0],
    category: category[0],
    product: product[0],
    priceComponent: getLocalizedLabel({ id: priceComponent[0] }),
  };

  return (
    <Card downloadId={DOWNLOAD_ID}>
      <CardHeader
        trailingContent={
          <>
            <InfoDialogButton
              iconOnly
              iconSize={24}
              type="outline"
              slug="help-price-components"
              label={t({
                id: "detail.card.title.prices.distribution",
              })}
            />
            <DownloadImage
              iconOnly
              iconSize={24}
              elementId={DOWNLOAD_ID}
              fileName={DOWNLOAD_ID}
              downloadType={DOWNLOAD_ID}
            />
          </>
        }
      >
        <CardTitle>
          <Trans id="detail.card.title.prices.distribution">
            Prize distribution in Switzerland
          </Trans>
        </CardTitle>
        <CardDescription>
          <FilterSetDescription filters={filters} />
        </CardDescription>
      </CardHeader>
      {!download && (
        <>
          <Box sx={{ display: ["none", "none", "block"] }}>
            <ButtonGroup
              id="priceComponents"
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
            />
          </Box>
          <Box sx={{ display: ["block", "block", "none"] }}>
            <Combobox
              id="priceComponents-histogram"
              label={t({
                id: "selector.priceComponents",
                message: "Price components",
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
          category={category}
          product={product}
          annotationIds={annotationIds}
          entity={entity}
        />
      ))}
      {/*FIXME: placeholder values */}
      {/* <CardFooter date="March 7, 2024, 1:28 PM" source="Lindas" /> */}
    </Card>
  );
};

const getEntityLabelId = (entity: Entity): string => {
  switch (entity) {
    case "canton":
      return t({
        id: "histogram.canton-count",
        message: "Number of cantons",
      });

    // We use the same translation whether we are looking at operator or municipality
    // To be completely true, the label should be "Number of operator-municipality" since a municipality
    // can be served by multiple operators, but for the sake of simplicity and comprehension, municipality
    // is used here.
    case "operator":
    case "municipality":
      return t({
        id: "histogram.municipality-count",
        message: "Number of municipalities",
      });
  }
};

const PriceDistributionHistogram = ({
  annotationIds,
  year,
  priceComponent,
  entity,
  category,
  product,
}: {
  year: string;
  priceComponent: PriceComponent;
  annotationIds: string[];
  entity: Entity;
  category: string[];
  product: string[];
}) => {
  const locale = useLocale();

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
    <Box sx={{ position: "relative" }}>
      {observationsQuery.fetching ? (
        <Loading />
      ) : observations.length === 0 ? (
        <NoDataHint />
      ) : (
        <WithClassName
          downloadId={DOWNLOAD_ID}
          isFetching={observationsQuery.fetching}
        >
          <Box
            sx={{
              position: "absolute",
              right: { md: "2.5rem" },
              left: { xxs: 0, md: "auto" },
              top: {
                xxs: 0,
                md: -20,
              },
            }}
          >
            <ColorLegend />
          </Box>
          <Histogram
            data={observations as GenericObservation[]}
            medianValue={medianValue}
            yAxisLabel={getEntityLabelId(entity)}
            xAxisUnit={t({ id: "chart.axis.unit.Rp/kWh", message: "Rp./kWh" })}
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
                <HistogramMinMaxValues />
                <AxisWidthHistogramDomain />
                <AnnotationX />
                <HistogramColumns />
                <HistogramMedian label="CH Median" />
                <InteractionHistogram />
              </ChartSvg>
              <AnnotationXLabel />
            </ChartContainer>
            <Tooltip type="single" />
          </Histogram>
        </WithClassName>
      )}
    </Box>
  );
};
