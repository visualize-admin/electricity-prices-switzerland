import { Trans } from "@lingui/macro";
import { group, groups, min, max } from "d3-array";
import * as React from "react";
import { useState } from "react";
import { Box } from "theme-ui";
import { Entity, GenericObservation, priceComponents } from "../../domain/data";
import { pivot_longer, mkNumber } from "../../domain/helpers";
import { getLocalizedLabel } from "../../domain/translation";
import {
  ObservationType,
  useObservationsWithAllPriceComponentsQuery,
} from "../../graphql/queries";
import { PriceComponent } from "../../graphql/resolver-types";
import { EMPTY_ARRAY } from "../../lib/empty-array";
import { useLocale } from "../../lib/use-locale";
import { useQueryState } from "../../lib/use-query-state";
import {
  BarsGrouped,
  BarsGroupedAxis,
  BarsGroupedLabels,
} from "../charts-generic/bars/bars-grouped";
import { GroupedBarsChart } from "../charts-generic/bars/bars-grouped-state";
import { ChartContainer, ChartSvg } from "../charts-generic/containers";
import { Combobox } from "../combobox";
import { Loading, NoDataHint } from "../hint";
import { useI18n } from "../i18n-context";
import { RadioTabs } from "../radio-tabs";
import { Card } from "./card";
import { Download } from "./download-image";
import { FilterSetDescription } from "./filter-set-description";
import { WithClassName } from "./with-classname";

const DOWNLOAD_ID: Download = "components";
export const EXPANDED_TAG = "expanded";

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
  const [view, setView] = useState("collapsed");
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

  const withUniqueEntityId = observations.map((obs) => ({
    uniqueId:
      obs.__typename === "MedianObservation" // canton
        ? `${obs.period}, ${obs.cantonLabel}`
        : `${obs.period}, ${obs.operatorLabel}, ${obs.municipalityLabel}`,
    ...obs,
  }));

  const pivoted: GenericObservation[] = pivot_longer({
    data: withUniqueEntityId as $FixMe[],
    cols: priceComponents,
    name_to: "priceComponent",
  });

  const perPriceComponent = [...group(pivoted, (d) => d.priceComponent)];
  const minValue = Math.min(
    mkNumber(min(pivoted, (d) => d.value as number)),
    0
  );
  const maxValue = max(pivoted, (d) => d.value as number);
  const xDomain = [mkNumber(minValue), mkNumber(maxValue)];
  const colorDomain = [...new Set(pivoted.map((p) => p[entity]))] as string[];
  const opacityDomain = [...new Set(pivoted.map((p) => p.period))] as string[];

  const getItemLabel = (id: string) => getLocalizedLabel({ i18n, id });

  return (
    <Card
      title={
        <Trans id="detail.card.title.price.components">Preiskomponenten</Trans>
      }
      downloadId={DOWNLOAD_ID}
      id={id}
      entity={entity}
    >
      <Box sx={{ display: ["none", "none", "block"], maxWidth: "fit-content" }}>
        <RadioTabs
          name="price-components-bars-view-switch"
          options={[
            {
              value: "collapsed",
              label: getLocalizedLabel({ i18n, id: "collapsed" }),
            },
            {
              value: "expanded",
              label: getLocalizedLabel({ i18n, id: "expanded" }),
            },
          ]}
          value={view}
          setValue={setView}
          variant="segmented"
        />
      </Box>
      <Box sx={{ display: ["block", "block", "none"] }}>
        <Combobox
          id="price-components-bars-view-dropdown"
          label={""}
          items={["collapsed", "expanded"]}
          getItemLabel={getItemLabel}
          selectedItem={view}
          setSelectedItem={setView}
          showLabel={false}
        />
      </Box>
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
          {perPriceComponent.map((pc, i) => {
            const grouped = groups(
              pc[1],
              (d: GenericObservation) => d.period,
              (d: GenericObservation) => d[entity],
              (d: GenericObservation) => d.value
            );

            const observations =
              view === "collapsed"
                ? grouped.flatMap((year) =>
                    year[1].flatMap((ent) =>
                      ent[1].flatMap((value) =>
                        value[1].length === 1
                          ? { ...value[1][0], label: value[1][0].uniqueId }
                          : {
                              priceComponent: pc[0],
                              value: value[0],
                              [entity]: value[1][0][entity],
                              period: value[1][0].period,
                              uniqueId: `${pc[0]}${value[1][0].period}${value[1][0].operatorLabel}${value[1][0].municipalityLabel}${value[1].length}`,
                              label:
                                entity === "canton"
                                  ? `${value[1][0].period}, ${
                                      value[1].length
                                    } ${getLocalizedLabel({
                                      i18n,
                                      id: "cantons",
                                    })}`
                                  : `${value[1][0].period}, ${
                                      value[1][0].operatorLabel
                                    }, ${value[1].length} ${getLocalizedLabel({
                                      i18n,
                                      id:
                                        entity === "operator"
                                          ? "municipalities"
                                          : "operators",
                                    })}`,
                              entities: value[1],
                            }
                      )
                    )
                  )
                : grouped.flatMap((year) =>
                    year[1].flatMap((ent) =>
                      ent[1].flatMap((value) => {
                        if (value[1].length === 1) {
                          return {
                            ...value[1][0],
                            label: value[1][0].uniqueId,
                          };
                        } else {
                          const singleEntities = value[1].flatMap((d) => ({
                            priceComponent: pc[0],
                            value: d.value,
                            [entity]: d[entity],
                            period: d.period,
                            uniqueId: `${pc[0]}${d.period}${d.operatorLabel}${d.municipalityLabel}${value[1].length}${EXPANDED_TAG}`,
                            label:
                              entity === "municipality"
                                ? d.operatorLabel
                                : d.municipalityLabel,
                          }));
                          const groupPlusSingleValues = [
                            {
                              priceComponent: pc[0],
                              value: value[0],
                              [entity]: value[1][0][entity],
                              period: value[1][0].period,
                              uniqueId: `${pc[0]}${value[1][0].period}${value[1][0].operatorLabel}${value[1][0].municipalityLabel}${value[1].length}`,
                              label:
                                entity === "canton"
                                  ? `${value[1][0].period}, ${
                                      value[1].length
                                    } ${getLocalizedLabel({
                                      i18n,
                                      id: "cantons",
                                    })}`
                                  : `${value[1][0].period}, ${
                                      value[1][0].operatorLabel
                                    }, ${value[1].length} ${getLocalizedLabel({
                                      i18n,
                                      id:
                                        entity === "operator"
                                          ? "municipalities"
                                          : "operators",
                                    })}`,
                              entities: value[1],
                            },
                            ...singleEntities,
                          ];

                          return groupPlusSingleValues;
                        }
                      })
                    )
                  );

            return (
              <React.Fragment key={i}>
                <GroupedBarsChart
                  data={observations}
                  fields={{
                    x: {
                      componentIri: "value",
                      domain: xDomain,
                    },
                    // Y is not used in the chart state...
                    y: {
                      componentIri: "priceComponent",
                      sorting: {
                        sortingType: "byMeasure",
                        sortingOrder: "desc",
                      },
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
                      <BarsGroupedAxis
                        title={getLocalizedLabel({ i18n, id: pc[0] as string })}
                      />
                      <BarsGroupedLabels />
                    </ChartSvg>
                  </ChartContainer>
                </GroupedBarsChart>
              </React.Fragment>
            );
          })}
        </WithClassName>
      )}
    </Card>
  );
};
