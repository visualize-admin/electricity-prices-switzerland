import { t, Trans } from "@lingui/macro";
import { Box } from "@mui/material";
import { groups } from "d3";
import { memo, useEffect, useState } from "react";

import {
  AnnotationX,
  AnnotationXDataPoint,
  AnnotationXLabel,
} from "src/components/charts-generic/annotation/annotation-x";
import { AxisWidthLinear } from "src/components/charts-generic/axis/axis-width-linear";
import {
  ChartContainer,
  ChartSvg,
} from "src/components/charts-generic/containers";
import { Tooltip } from "src/components/charts-generic/interaction/tooltip";
import { InteractionRows } from "src/components/charts-generic/overlay/interaction-rows";
import {
  Range,
  RangePoints,
} from "src/components/charts-generic/rangeplot/rangeplot";
import { RangeplotMedian } from "src/components/charts-generic/rangeplot/rangeplot-median";
import { RangePlot } from "src/components/charts-generic/rangeplot/rangeplot-state";
import { Combobox } from "src/components/combobox";
import { Card } from "src/components/detail-page/card";
import { Download } from "src/components/detail-page/download-image";
import { FilterSetDescription } from "src/components/detail-page/filter-set-description";
import { WithClassName } from "src/components/detail-page/with-classname";
import { Loading, NoDataHint } from "src/components/hint";
import { InfoDialogButton } from "src/components/info-dialog";
import { PriceColorLegend } from "src/components/price-color-legend";
import { RadioTabs } from "src/components/radio-tabs";
import { Stack } from "src/components/stack";
import { SortingOrder, SortingType } from "src/domain/config-types";
import { Entity, GenericObservation, priceComponents } from "src/domain/data";
import { getLocalizedLabel } from "src/domain/translation";
import {
  ObservationKind,
  PriceComponent,
  useObservationsQuery,
} from "src/graphql/queries";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { useLocale } from "src/lib/use-locale";
import { useQueryState } from "src/lib/use-query-state";

const DOWNLOAD_ID: Download = "comparison";

type SortingValue = "median-asc" | "median-desc" | "alpha-asc" | "alpha-desc";

const SORTING_VALUES: SortingValue[] = [
  "median-asc",
  "median-desc",
  "alpha-asc",
  "alpha-desc",
];

export const CantonsComparisonRangePlots = ({
  id,
  entity,
}: {
  id: string;
  entity: Entity;
}) => {
  const [
    {
      period,
      municipality,
      operator,
      canton,
      priceComponent,
      download,
      cantonsOrder,
    },
    setQueryState,
  ] = useQueryState();

  const [sortingType, setSortingType] = useState<SortingType>("byMeasure");
  const [sortingOrder, setSortingOrder] = useState<SortingOrder>("asc");
  useEffect(() => {
    if (cantonsOrder[0] === "median-asc") {
      setSortingType("byMeasure");
      setSortingOrder("asc");
    } else if (cantonsOrder[0] === "median-desc") {
      setSortingType("byMeasure");
      setSortingOrder("desc");
    } else if (cantonsOrder[0] === "alpha-asc") {
      setSortingType("byDimensionLabel");
      setSortingOrder("asc");
    } else if (cantonsOrder[0] === "alpha-desc") {
      setSortingType("byDimensionLabel");
      setSortingOrder("desc");
    } else {
      setSortingType("byMeasure");
      setSortingOrder("asc");
    }
  }, [cantonsOrder]);

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
        <Stack spacing={2} direction="row">
          <span>
            <Trans id="detail.card.title.cantons.comparison">
              Kantonsvergleich
            </Trans>
          </span>
          <InfoDialogButton
            iconOnly
            slug="help-canton-comparison"
            label={t({
              id: "detail.card.title.cantons.comparison",
            })}
            smaller
          />
        </Stack>
      }
      downloadId={DOWNLOAD_ID}
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
              id="priceComponents-cantons-comparison"
              label={t({
                id: "selector.priceComponents",
                message: "Preiskomponenten",
              })}
              items={priceComponents}
              getItemLabel={getItemLabel}
              selectedItem={priceComponent[0]}
              setSelectedItem={(pc) => setQueryState({ priceComponent: [pc] })}
              showLabel={false}
            />
          </Box>
          <Box
            sx={{
              flexDirection: ["column", "row", "row"],
              justifyContent: "space-between",
              mt: 4,
            }}
            display="flex"
          >
            <Combobox
              label={t({
                id: "rangeplot.select.order.hint",
                message: "Sortieren nach",
              })}
              id={"rangeplot-sorting-select"}
              items={SORTING_VALUES}
              getItemLabel={getItemLabel}
              selectedItem={cantonsOrder[0]}
              setSelectedItem={(co) => setQueryState({ cantonsOrder: [co] })}
              showLabel={true}
            />
            <PriceColorLegend />
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
          sortingType={sortingType}
          sortingOrder={sortingOrder}
        />
      ))}
    </Card>
  );
};

const CantonsComparisonRangePlot = memo(
  ({
    annotationIds,
    year,
    priceComponent,
    entity,
    sortingType,
    sortingOrder,
  }: {
    annotationIds: string[];
    year: string;
    priceComponent: PriceComponent;
    entity: Entity;
    sortingType: SortingType;
    sortingOrder: SortingOrder;
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
            <RangePlot
              data={observations as GenericObservation[]}
              medianValue={medianValue}
              fields={{
                x: {
                  componentIri: "value",
                },
                y: {
                  componentIri: "cantonLabel",
                  sorting: {
                    sortingType,
                    sortingOrder,
                  },
                },
                label: {
                  componentIri:
                    entity === "canton" ? "cantonLabel" : "municipalityLabel",
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
                  <RangeplotMedian label="CH Median" />
                  <Range id={year} />
                  <AxisWidthLinear position="top" />
                  <RangePoints />
                  <AnnotationX />
                  <AnnotationXDataPoint />
                  <InteractionRows />
                </ChartSvg>
                <Tooltip type={entity === "canton" ? "single" : "multiple"} />
                <AnnotationXLabel />
              </ChartContainer>
            </RangePlot>
          </WithClassName>
        )}
      </>
    );
  }
);
