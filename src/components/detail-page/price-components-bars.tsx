import { t, Trans } from "@lingui/macro";
import { Box } from "@mui/material";
import { extent, groups } from "d3";
import { uniq } from "lodash";
import * as React from "react";

import { ButtonGroup } from "src/components/button-group";
import {
  BarsGrouped,
  BarsGroupedAxis,
  BarsGroupedLabels,
} from "src/components/charts-generic/bars/bars-grouped";
import { GroupedBarsChart } from "src/components/charts-generic/bars/bars-grouped-state";
import {
  ChartContainer,
  ChartSvg,
} from "src/components/charts-generic/containers";
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
import { prepareObservations } from "src/components/detail-page/price-components-bars-utils";
import { WithClassName } from "src/components/detail-page/with-classname";
import { HintBlue, LoadingSkeleton, NoDataHint } from "src/components/hint";
import { InfoDialogButton } from "src/components/info-dialog";
import { GenericObservation, detailsPriceComponents } from "src/domain/data";
import { pivot_longer } from "src/domain/helpers";
import { RP_PER_KWH } from "src/domain/metrics";
import { useQueryStateEnergyPricesDetails } from "src/domain/query-states";
import { getLocalizedLabel } from "src/domain/translation";
import {
  ObservationKind,
  PriceComponent,
  useObservationsWithAllPriceComponentsQuery,
} from "src/graphql/queries";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { useLocale } from "src/lib/use-locale";
import { useFlag } from "src/utils/flags";

import { FilterSetDescription } from "./filter-set-description";

const DOWNLOAD_ID: Download = "components";

type CollapsedState = "collapsed" | "expanded";

export const PriceComponentsBarChart = ({ id, entity }: SectionProps) => {
  const locale = useLocale();
  const [
    {
      period,
      category,
      municipality,
      operator,
      canton,
      product,
      download,
      view,
    },
    setQueryState,
  ] = useQueryStateEnergyPricesDetails();
  const comparisonIds =
    entity === "municipality"
      ? municipality
      : entity === "operator"
      ? operator
      : canton;

  const entityIds = comparisonIds?.some((m) => m !== "")
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

  const dynamicTariffsFlag = useFlag("dynamicElectricityTariffs");

  const { perPriceComponent, colorDomain, xDomain, opacityDomain } =
    React.useMemo(() => {
      const observations = [...operatorObservations, ...cantonObservations];
      const withUniqueEntityId = observations.map((obs) => ({
        uniqueId:
          obs.__typename === "CantonMedianObservation" // canton
            ? `${obs.period}, ${obs.cantonLabel}`
            : `${obs.period}, ${obs.operatorLabel}, ${obs.municipalityLabel}`,
        ...obs,
      }));

      const cols = detailsPriceComponents as Exclude<
        (typeof detailsPriceComponents)[number],
        "meteringrate"
      >[];
      const pivoted = pivot_longer({
        data: withUniqueEntityId,
        cols: cols,
        name_to: "priceComponent" as const,
      });

      const xDomain = extent(pivoted.map((d) => d.value as number)) as [
        number,
        number
      ];
      const colorDomain = uniq(
        observations.map((p) => (p as GenericObservation)[entity])
      ) as string[];
      const opacityDomain = uniq(pivoted.map((p) => p.period)) as string[];

      const grouped = groups(pivoted, (d) => d.priceComponent);
      const perPriceComponent = grouped.map(
        ([priceComponent, observations]) => {
          const groupedObservations = groups(
            observations as GenericObservation[],
            (d: GenericObservation) => d.period,
            (d: GenericObservation) => d[entity],
            (d: GenericObservation) => d.value
          );

          const prepared = prepareObservations({
            groupedObservations,
            view: view[0],
            priceComponent: priceComponent as PriceComponent,
            entity,
            dynamicTariffsFlag,
          });

          return [priceComponent, prepared] as const;
        }
      );

      return {
        perPriceComponent,
        xDomain,
        colorDomain,
        opacityDomain,
      };
    }, [
      operatorObservations,
      cantonObservations,
      view,
      entity,
      dynamicTariffsFlag,
    ]);

  const getItemLabel = (id: CollapsedState) => {
    if (entity === "canton") {
      return "";
    }
    return getLocalizedLabel({
      id: `${id}-${entity}` as `${typeof id}-${typeof entity}`,
    });
  };

  const filters = {
    period: period[0],
    category: category[0],
    product: product[0],
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
                id: "selector.priceComponent",
                message: "Price component",
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
          <Trans id="detail.card.title.price.components">
            Price components
          </Trans>
        </CardTitle>
        <CardDescription>
          <FilterSetDescription filters={filters} />
        </CardDescription>
      </CardHeader>
      {!download && entity !== "canton" && (
        <>
          <Box
            sx={{
              display: ["none", "none", "block"],
              maxWidth: "fit-content",
            }}
          >
            <ButtonGroup
              id="price-components-bars-view-switch"
              sx={{
                button: {
                  maxWidth: "auto",
                },
              }}
              options={[
                {
                  value: "collapsed",
                  label: getLocalizedLabel({
                    id: `collapsed-${entity}`,
                  }),
                  content: getLocalizedLabel({
                    id: "price-components.collapsed-content",
                  }),
                },
                {
                  value: "expanded",
                  label: getLocalizedLabel({
                    id: `expanded-${entity}`,
                  }),
                  content: getLocalizedLabel({
                    id: "price-components.expanded-content",
                  }),
                },
              ]}
              value={view[0]}
              setValue={(view) => setQueryState({ view: [view] })}
            />
          </Box>
          <Box sx={{ display: ["block", "block", "none"] }}>
            <Combobox<CollapsedState>
              id="price-components-bars-view-dropdown"
              label={""}
              items={["collapsed", "expanded"]}
              getItemLabel={getItemLabel}
              selectedItem={view[0]}
              setSelectedItem={(view) => setQueryState({ view: [view] })}
              showLabel={false}
            />
          </Box>
        </>
      )}
      {dynamicTariffsFlag && (
        <HintBlue iconName="infocircle">
          <Trans id="dynamic-tariffs.hint">
            Prices shown with values in brackets are dynamic. You can find more
            information about how dynamic pricing works [here].
          </Trans>
        </HintBlue>
      )}
      {observationsQuery.fetching ? (
        <LoadingSkeleton height={650} />
      ) : perPriceComponent.length === 0 ? (
        <NoDataHint />
      ) : (
        <WithClassName
          downloadId={DOWNLOAD_ID}
          isFetching={observationsQuery.fetching}
        >
          {perPriceComponent.map(([priceComponent, observations], i) => {
            return (
              <React.Fragment key={i}>
                <GroupedBarsChart
                  data={observations}
                  fields={{
                    x: {
                      componentIri: "value",
                      axisLabel: RP_PER_KWH,
                    },
                    domain: xDomain,
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
                        title={getLocalizedLabel({
                          id: priceComponent,
                        })}
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
      {/*FIXME: placeholder values */}
      {/* <CardFooter date="March 7, 2024, 1:28 PM" source="Lindas" /> */}
    </Card>
  );
};
