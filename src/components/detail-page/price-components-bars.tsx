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
import { getLocalizedLabel } from "../../domain/translation";
import { useI18n } from "../i18n-context";

const DOWNLOAD_ID: Download = "components";

export const PriceComponentsBarChart = ({
  id,
  entity,
}: {
  id: string;
  entity: Entity;
}) => {
  const i18n = useI18n();

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
  const perPriceComponent = [...group(pivoted, (d) => d.priceComponent)];
  console.log({ perPriceComponent });
  const colorDomain = [...new Set(pivoted.map((p) => p[entity]))];
  const opacityDomain = [...new Set(pivoted.map((p) => p.period))];
  console.log({ colorDomain });
  console.log({ opacityDomain });
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
          {perPriceComponent.map((pc: $FixMe) => {
            const grouped = groups(
              pc[1],
              (d) => d.period,
              (d) => d.value
            );
            console.log({ grouped });

            const observations = grouped.flatMap((year) =>
              year[1].flatMap((value) =>
                value[1].length === 1
                  ? { ...value[1][0], label: value[1][0].uniqueId }
                  : {
                      priceComponent: pc[0],
                      value: value[0],
                      number: value[1].length,
                      [entity]: value[1][0][entity],
                      period: value[1][0].period,
                      uniqueId: `${value[1][0].period}, ${value[0]}: ${value[1].length} entities with this value`,
                      label: `${value[1][0].period}, ${
                        value[1].length
                      } ${getLocalizedLabel({
                        i18n,
                        id: entity === "operator" ? "municipality" : "operator",
                      })}`,
                      entities: value[1],
                    }
              )
            );

            return (
              <GroupedBarsChart
                data={observations}
                fields={{
                  x: {
                    componentIri: "value",
                  },
                  y: {
                    componentIri: "priceComponent",
                    sorting: { sortingType: "byMeasure", sortingOrder: "desc" },
                  },
                  segment: {
                    componentIri: "uniqueId", // year+muni+operator
                    type: "grouped",
                    palette: "elcom",
                  },
                  label: {
                    componentIri: "label",
                  },
                  style: {
                    colorDomain,
                    opacityDomain,
                    colorAcc: entity as string,
                    opacityAcc: "period",
                    otherEntity:
                      entity === "operator" ? "municipality" : "operator",
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
