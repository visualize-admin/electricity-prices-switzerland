import { Trans } from "@lingui/macro";
import * as React from "react";
import { Entity, priceComponents } from "../../domain/data";
import { pivot_longer } from "../../domain/helpers";
import {
  ObservationType,
  useObservationsWithAllPriceComponentsQuery,
} from "../../graphql/queries";
import { EMPTY_ARRAY } from "../../lib/empty-array";
import { useQueryState } from "../../lib/use-query-state";
import {
  BarsGrouped,
  BarsGroupedLabels,
} from "../charts-generic/bars/bars-grouped";
import { GroupedBarsChart } from "../charts-generic/bars/bars-grouped-state";
import { ChartContainer, ChartSvg } from "../charts-generic/containers";
import { Loading, NoDataHint } from "../hint";
import { Card } from "./card";
import { FilterSetDescription } from "./filter-set-description";
import { DownloadImage, Download } from "./download-image";
import { WithClassName } from "./with-classname";
import { useRouter } from "next/router";
import { useLocale } from "../../lib/use-locale";
import { group, groups } from "d3-array";

const DOWNLOAD_ID: Download = "components";

export const PriceComponentsBarChart = ({
  id,
  entity,
}: {
  id: string;
  entity: Entity;
}) => {
  const locale = useLocale();
  const [
    { period, category, municipality, operator, canton, product },
  ] = useQueryState();

  const comparisonIds =
    entity === "municipality"
      ? municipality
      : entity === "operator"
      ? operator
      : canton;

  const entityIds =
    comparisonIds && comparisonIds?.some((m) => m !== "")
      ? [...comparisonIds, id]
      : [id];
  const [observationsQuery] = useObservationsWithAllPriceComponentsQuery({
    variables: {
      locale,
      filters: {
        period: period,
        [entity]: entityIds,
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

  // const uniqueIds = muni+operator+year
  const withUniqueEntityId = observations.map((obs) => ({
    uniqueId:
      obs.__typename === "MedianObservation"
        ? `${obs.period}, ${obs.cantonLabel}`
        : `${obs.period}, ${obs.municipalityLabel}, ${obs.operatorLabel}`,
    ...obs,
  }));
  console.log({ withUniqueEntityId });

  const pivoted: {
    value: number;
    priceComponent: string;
  }[] = pivot_longer({
    data: withUniqueEntityId as $FixMe[],
    cols: priceComponents,
    name_to: "priceComponent",
  });

  console.log({ pivoted });
  const grouped_pivoted = groups(
    pivoted,
    (d) => d.priceComponent,
    (d) => d.value
  );
  const grouped_observations = grouped_pivoted.flatMap((pc) =>
    pc[1].flatMap((v) =>
      v[1].length === 1
        ? { ...v[1][0], label: v[1][0].uniqueId }
        : {
            priceComponent: pc[0],
            value: v[0],
            number: v[1].length,
            uniqueId: `${pc[0]}${v[1][0].period}${v[0]}: ${v[1].length} entities with this value`,
            label: `${pc[0]}${v[1][0].period}${v[0]}: ${v[1].length} entities with this value`,
            entities: v[1],
          }
    )
  );
  console.log({ grouped_pivoted });
  console.log({ grouped_observations });
  const grouped_groups = [
    ...group(grouped_observations, (d) => d.priceComponent),
  ];
  console.log({ grouped_groups });
  return (
    <Card
      title={
        <Trans id="detail.card.title.price.components">Preiskomponenten</Trans>
      }
      downloadId={DOWNLOAD_ID}
      id={id}
      entity={entity}
    >
      <FilterSetDescription
        filters={{
          category: category[0],
          product: product[0],
        }}
      />
      {observationsQuery.fetching ? (
        <Loading />
      ) : observations.length === 0 ? (
        <NoDataHint />
      ) : (
        <WithClassName downloadId={DOWNLOAD_ID}>
          {grouped_groups.map((g) => {
            return (
              <GroupedBarsChart
                data={g[1]}
                fields={{
                  x: {
                    componentIri: "value",
                  },
                  y: {
                    componentIri: "priceComponent",
                    sorting: { sortingType: "byMeasure", sortingOrder: "desc" },
                  },
                  segment: {
                    componentIri: "uniqueId",
                    type: "grouped",
                    palette: "elcom",
                  },
                  label: {
                    componentIri: "label",
                  },
                }}
                measures={[
                  {
                    iri: "value",
                    label: "value",
                    __typename: "Measure",
                  },
                ]}
                dimensions={[
                  {
                    iri: "priceComponent",
                    label: "priceComponent",
                    __typename: "NominalDimension",
                  },
                ]}
              >
                <ChartContainer>
                  <ChartSvg>
                    <BarsGrouped />
                    <BarsGroupedLabels />
                  </ChartSvg>
                </ChartContainer>
              </GroupedBarsChart>
            );
          })}
        </WithClassName>
      )}
    </Card>
  );
};
