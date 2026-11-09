import { t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
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
import { LegendItem } from "src/components/charts-generic/legends/color";
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
import { Hint, Loading, NoDataHint } from "src/components/hint";
import { InfoDialogButton } from "src/components/info-dialog";
import { GenericObservation, detailsPriceComponents } from "src/domain/data";
import { getPalette, pivot_longer } from "src/domain/helpers";
import { RP_PER_KWH } from "src/domain/metrics";
import { useQueryStateEnergyPricesDetails } from "src/domain/query-states";
import { getLocalizedLabel } from "src/domain/translation";
import {
  ObservationKind,
  ObservationsWithAllPriceComponentsQuery,
  PriceComponent,
  useObservationsWithAllPriceComponentsQuery,
} from "src/graphql/queries";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { useLocale } from "src/lib/use-locale";
import { useFlag } from "src/utils/flags";

import { FilterSetDescription } from "./filter-set-description";

const DOWNLOAD_ID: Download = "components";

type CollapsedState = "collapsed" | "expanded";

type QueryState = ReturnType<typeof useQueryStateEnergyPricesDetails>[0];

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
      operatorIds: entity === "operator" ? entityIds : [],
    },
  });

  return (
    <PriceComponentsCard
      id={id}
      entity={entity}
      data={observationsQuery.data}
      fetching={observationsQuery.fetching}
      period={period}
      category={category}
      product={product}
      operator={operator}
      view={view}
      download={download}
      setView={(view) => setQueryState({ view: [view] })}
    />
  );
};

/**
 * Renders the price components of an entity. Takes the fetched data as
 * props, so it can be rendered without urql or the router.
 */
export const PriceComponentsCard = ({
  id,
  entity,
  data,
  fetching,
  period,
  category,
  product,
  operator,
  view,
  download,
  setView,
}: SectionProps &
  Pick<
    QueryState,
    "period" | "category" | "product" | "operator" | "view" | "download"
  > & {
    data: ObservationsWithAllPriceComponentsQuery | undefined;
    fetching: boolean;
    setView: (view: CollapsedState) => void;
  }) => {
  const operatorObservations = fetching
    ? EMPTY_ARRAY
    : data?.observations ?? EMPTY_ARRAY;
  const cantonObservations = fetching
    ? EMPTY_ARRAY
    : data?.cantonMedianObservations ?? EMPTY_ARRAY;
  const operatorNames = new Map(data?.operators.map((o) => [o.id, o.name]));

  const {
    perPriceComponent,
    colorDomain,
    xDomain,
    opacityDomain,
    mirrorEntities,
    hasDynamicTariffs,
  } = React.useMemo(() => {
    const observations = [...operatorObservations, ...cantonObservations];
    const withUniqueEntityId = observations.map((obs) => ({
      uniqueId:
        obs.__typename === "CantonMedianObservation" // canton
          ? `${obs.period}, ${obs.cantonLabel}`
          : `${obs.period}, ${obs.operatorLabel}, ${obs.municipalityLabel}`,
      ...obs,
      // The total range only differs from the total by the grid usage. It is
      // computed before pivoting, which drops the grid usage from total rows
      ...("lowestrate" in obs &&
      obs.lowestrate != null &&
      obs.highestrate != null &&
      obs.total != null &&
      obs.gridusage != null
        ? {
            totalLowestrate: obs.total - obs.gridusage + obs.lowestrate,
            totalHighestrate: obs.total - obs.gridusage + obs.highestrate,
          }
        : {}),
    }));

    const cols = detailsPriceComponents as Exclude<
      (typeof detailsPriceComponents)[number],
      "meteringrate"
    >[];
    // Drop missing values (e.g. no metering rate in canton medians), so
    // price components without any value are not shown
    const pivoted = pivot_longer({
      data: withUniqueEntityId,
      cols: cols,
      name_to: "priceComponent" as const,
    }).filter((d) => d.value != null);

    const xDomain = extent(pivoted.map((d) => d.value as number)) as [
      number,
      number
    ];
    const colorDomain = (
      entity === "operator"
        ? [id, ...(operator ?? [])]
        : uniq(observations.map((p) => (p as GenericObservation)[entity]))
    ) as string[];
    const opacityDomain = uniq(pivoted.map((p) => p.period)) as string[];

    const grouped = groups(pivoted, (d) => d.priceComponent);
    const mirrorEntity =
      entity === "municipality" ? "operator" : "municipality";
    const mirrorEntities = uniq(
      observations.map((p) => (p as GenericObservation)[mirrorEntity])
    ) as string[];

    const perPriceComponent = grouped.map(([priceComponent, observations]) => {
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
      });

      return [priceComponent, prepared] as const;
    });

    return {
      perPriceComponent,
      xDomain,
      colorDomain,
      opacityDomain,
      mirrorEntities,
      hasDynamicTariffs: perPriceComponent.some(([, prepared]) =>
        prepared.some((d) => "min" in d)
      ),
    };
  }, [operatorObservations, cantonObservations, view, entity, id, operator]);

  const operatorsWithoutObservations =
    entity === "operator" && !fetching
      ? colorDomain.filter(
          (operatorId) =>
            !operatorObservations.some((o) => o.operator === operatorId)
        )
      : [];

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

  const { i18n } = useLingui();
  const dynamicTariffs = useFlag("dynamicElectricityTariffs");

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
          <FilterSetDescription
            filters={filters}
            hideYear={period.length > 1}
          />
        </CardDescription>
      </CardHeader>
      {!download && entity !== "canton" && mirrorEntities.length > 1 && (
        <>
          <Box display={["none", "none", "block"]} maxWidth="fit-content">
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
              setValue={(view) => setView(view)}
            />
          </Box>
          <Box display={["block", "block", "none"]}>
            <Combobox<CollapsedState>
              id="price-components-bars-view-dropdown"
              label={""}
              items={["collapsed", "expanded"]}
              getItemLabel={getItemLabel}
              selectedItem={view[0]}
              setSelectedItem={(view) => setView(view)}
              showLabel={false}
            />
          </Box>
        </>
      )}
      {((dynamicTariffs && hasDynamicTariffs) ||
        operatorsWithoutObservations.length > 0) && (
        <Box display="flex" flexDirection="column" gap={4}>
          {dynamicTariffs && hasDynamicTariffs && (
            <Hint severity="info">
              <Trans id="dynamic-tariffs.hint">
                Prices shown with values in brackets are dynamic.
              </Trans>
            </Hint>
          )}
          {operatorsWithoutObservations.length > 0 && (
            <Hint severity="warning">
              <Trans id="price-components.operators-without-prices">
                We have no prices for the following operators:
              </Trans>
              <Box component="ul" m={0} pl={5}>
                {operatorsWithoutObservations.map((operatorId) => (
                  <li key={operatorId}>
                    {operatorNames.get(operatorId) ?? operatorId}
                  </li>
                ))}
              </Box>
            </Hint>
          )}
        </Box>
      )}
      {fetching ? (
        <Box minHeight={650} display="flex">
          <Loading delayMs={0} />
        </Box>
      ) : perPriceComponent.length === 0 ? (
        <NoDataHint />
      ) : (
        <WithClassName downloadId={DOWNLOAD_ID} isFetching={fetching}>
          {entity === "operator" && (
            <Box display="flex" flexWrap="wrap" gap={1} mb={4}>
              {/* Index in colorDomain keeps the legend colors in sync with the bars */}
              {colorDomain.map((operatorId, i) =>
                operatorsWithoutObservations.includes(operatorId) ? null : (
                  <LegendItem
                    key={operatorId}
                    item={operatorNames.get(operatorId) ?? operatorId}
                    color={getPalette("elcom")[i]}
                    symbol="square"
                  />
                )
              )}
            </Box>
          )}
          {perPriceComponent.map(([priceComponent, observations], i) => {
            return (
              <React.Fragment key={i}>
                <GroupedBarsChart
                  data={observations}
                  fields={{
                    x: {
                      componentIri: "value",
                      axisLabel: i18n._(RP_PER_KWH),
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
                      highlightValue: entity === "operator" ? id : undefined,
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
                    <ChartSvg style={{ overflow: "visible" }}>
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
