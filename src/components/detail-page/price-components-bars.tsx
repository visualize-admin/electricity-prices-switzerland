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

const DOWNLOAD_ID: Download = "components";

export const PriceComponentsBarChart = ({
  id,
  entity,
}: {
  id: string;
  entity: Entity;
}) => {
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
  const pivoted = pivot_longer({
    data: withUniqueEntityId as $FixMe[],
    cols: priceComponents,
    name_to: "priceComponent",
  });
  return (
    <Card
      title={
        <Trans id="detail.card.title.price.components">Preiskomponenten</Trans>
      }
      id={DOWNLOAD_ID}
    >
      <FilterSetDescription
        filters={{
          category: category[0],
        }}
      />
      {observationsQuery.fetching ? (
        <Loading />
      ) : observations.length === 0 ? (
        <NoDataHint />
      ) : (
        <WithClassName downloadId={DOWNLOAD_ID}>
          <GroupedBarsChart
            data={pivoted}
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
        </WithClassName>
      )}
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
