import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { Box } from "@mui/material";
import { sortBy } from "lodash";
import { memo, useMemo } from "react";

import { ButtonGroup } from "src/components/button-group";
import { AxisHeightLinear } from "src/components/charts-generic/axis/axis-height-linear";
import { AxisTime } from "src/components/charts-generic/axis/axis-width-time";
import {
  ChartContainer,
  ChartSvg,
} from "src/components/charts-generic/containers";
import { HoverDotMultiple } from "src/components/charts-generic/interaction/hover-dots-multiple";
import { Ruler } from "src/components/charts-generic/interaction/ruler";
import { Tooltip } from "src/components/charts-generic/interaction/tooltip";
import { LegendColor } from "src/components/charts-generic/legends/color";
import { Lines } from "src/components/charts-generic/lines/lines";
import { LineChart } from "src/components/charts-generic/lines/lines-state";
import { InteractionHorizontal } from "src/components/charts-generic/overlay/interaction-horizontal";
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
import { Loading, LoadingSkeleton, NoDataHint } from "src/components/hint";
import { InfoDialogButton } from "src/components/info-dialog";
import {
  DetailPriceComponent,
  detailsPriceComponents,
  Entity,
  GenericObservation,
  PriceComponent,
} from "src/domain/data";
import { useFormatAxisNumber } from "src/domain/helpers";
import { getPriceComponentUnit } from "src/domain/metrics";
import { useQueryStateEnergyPricesDetails } from "src/domain/query-states";
import { getLocalizedLabel, TranslationKey } from "src/domain/translation";
import {
  ObservationKind,
  PriceComponent as PriceComponentEnum,
  useObservationsWithAllPriceComponentsQuery,
  usePriceEvolutionObservationsQuery,
  usePriceEvolutionOperatorMeanObservationsQuery,
} from "src/graphql/queries";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { useLocale } from "src/lib/use-locale";

import { HighlightIndicator } from "../charts-generic/interaction/highlight-indicator";

const DOWNLOAD_ID: Download = "evolution";

export const PriceEvolutionCard = ({ id, entity }: SectionProps) => {
  const [{ category, product, period, priceComponent }, setQueryState] =
    useQueryStateEnergyPricesDetails();

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
                id: "detail.card.title.prices.evolution",
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
          <Trans id="detail.card.title.prices.evolution">
            Tariff development
          </Trans>
        </CardTitle>
        <CardDescription>
          <FilterSetDescription filters={filters} hideYear />
        </CardDescription>
      </CardHeader>
      <Box display={["none", "none", "block"]}>
        <ButtonGroup<DetailPriceComponent>
          id="evolutionPriceComponent"
          options={detailsPriceComponents.map((value) => ({
            value,
            label: getLocalizedLabel({ id: value }),
            content: getLocalizedLabel({
              id: `price-components.${value}-content` as TranslationKey,
            }),
          }))}
          value={priceComponent[0]}
          setValue={(pc) => setQueryState({ priceComponent: [pc] })}
          fitLabelToContent
        />
      </Box>
      <Box display={["block", "block", "none"]}>
        <Combobox
          id="evolutionPriceComponent-select"
          label={t({
            id: "selector.priceComponents",
            message: "Price components",
          })}
          items={detailsPriceComponents}
          getItemLabel={(id) => getLocalizedLabel({ id })}
          selectedItem={priceComponent[0]}
          setSelectedItem={(pc) => setQueryState({ priceComponent: [pc] })}
          showLabel={false}
        />
      </Box>
      <PriceEvolution
        entity={entity}
        priceComponents={[priceComponent[0]]}
        id={id}
      />
      {/*FIXME: placeholder values */}
      {/* <CardFooter date="March 7, 2024, 1:28 PM" source="Lindas" /> */}
    </Card>
  );
};

export const PriceEvolution = ({
  id,
  entity,
  priceComponents,
  mini,
  highlightYear,
}: SectionProps & {
  priceComponents: PriceComponent[];
  mini?: boolean;
  highlightYear?: number;
}) => {
  const locale = useLocale();
  const [{ category, municipality, operator, canton, product }] =
    useQueryStateEnergyPricesDetails();

  const comparisonIds =
    entity === "municipality"
      ? municipality
      : entity === "operator"
      ? operator
      : canton;

  const entityIds = comparisonIds?.some((m) => m !== "")
    ? [...comparisonIds, id]
    : [id];

  const observationKind =
    entity === "canton" ? ObservationKind.Canton : ObservationKind.Municipality;
  const priceComponent = priceComponents[0] ?? "total";
  const filters = {
    [entity]: entityIds,
    category,
    product,
  };

  const [allQuery] = useObservationsWithAllPriceComponentsQuery({
    variables: {
      locale,
      filters,
      observationKind,
    },
    pause: mini,
  });
  const [slimQuery] = usePriceEvolutionObservationsQuery({
    variables: {
      locale,
      priceComponent: priceComponent as PriceComponentEnum,
      filters,
      observationKind,
    },
    pause: !mini || entity === "operator",
  });
  // One line per operator instead of one per municipality it serves
  const [operatorMeanQuery] = usePriceEvolutionOperatorMeanObservationsQuery({
    variables: {
      locale,
      priceComponent: priceComponent as PriceComponentEnum,
      filters,
    },
    pause: !mini || entity !== "operator",
  });

  // The only query not paused above
  const relevantQuery = !mini
    ? allQuery
    : entity === "operator"
    ? operatorMeanQuery
    : slimQuery;
  const { fetching, data: relevantData } = relevantQuery;
  const observations = useMemo(() => {
    if (fetching || !relevantData) {
      return EMPTY_ARRAY;
    }
    const relevantObservations: GenericObservation[] = [
      ...(relevantData.observations ?? EMPTY_ARRAY),
      ...(("cantonMedianObservations" in relevantData &&
        relevantData.cantonMedianObservations) ||
        EMPTY_ARRAY),
    ];
    // Mini queries fetch a single price component as `value`
    if (mini) {
      return relevantObservations.map((obs) => ({
        ...obs,
        [priceComponent]: obs.value,
      }));
    }
    if (entity !== "operator") {
      return relevantObservations;
    }
    const colorOrder = [id, ...(comparisonIds ?? [])];
    const operatorIndex = Object.fromEntries(
      colorOrder.map((operatorId, i) => [operatorId, i])
    );
    return sortBy(
      relevantObservations,
      (obs) => operatorIndex[String(obs.operator)] ?? colorOrder.length
    );
  }, [fetching, relevantData, mini, priceComponent, entity, id, comparisonIds]);

  return fetching ? (
    mini ? (
      <Box minHeight={166}>
        <Loading delayMs={0} />
      </Box>
    ) : (
      <LoadingSkeleton height={166} />
    )
  ) : observations.length === 0 ? (
    <NoDataHint />
  ) : (
    <div className={DOWNLOAD_ID}>
      <WithClassName downloadId={DOWNLOAD_ID} isFetching={fetching}>
        <PriceEvolutionLineCharts
          observations={observations}
          entity={entity}
          priceComponents={priceComponents}
          mini={mini}
          highlightYear={highlightYear}
        />
      </WithClassName>
    </div>
  );
};

export const PriceEvolutionLineCharts = memo(
  ({
    observations,
    entity,
    priceComponents,
    mini,
    highlightYear,
  }: Pick<SectionProps, "entity"> & {
    priceComponents: PriceComponent[];
    observations: GenericObservation[];
    mini?: boolean;
    highlightYear?: number;
  }) => {
    return (
      <Box display={"flex"} flexDirection="column" gap={6.5}>
        {priceComponents.map((pc, i) => {
          return (
            <PriceEvolutionLineChart
              key={i}
              i={i}
              pc={pc}
              entity={entity}
              observations={observations}
              mini={mini}
              highlightYear={highlightYear}
            />
          );
        })}
      </Box>
    );
  }
);

const PriceEvolutionLineChart = (props: {
  pc: PriceComponent;
  i: number;
  observations: GenericObservation[];
  entity: Entity;
  mini?: boolean;
  highlightYear?: number;
}) => {
  const { pc, entity, i, observations, mini, highlightYear } = props;
  const formatAxis = useFormatAxisNumber();
  const withUniqueEntityId: GenericObservation[] = observations.map((obs) => ({
    uniqueId:
      obs.__typename === "OperatorObservation" ||
      obs.__typename === "OperatorMeanObservation"
        ? obs.municipalityLabel
          ? `${obs.municipalityLabel}, ${obs.operatorLabel}`
          : obs.operatorLabel
        : obs.cantonLabel,
    ...obs,
  }));

  const colorDomain = [
    ...new Set(withUniqueEntityId.map((p) => p[`${entity}Label`])),
  ] as string[];

  const hasMultipleLines =
    new Set(withUniqueEntityId.map((obs) => obs.uniqueId)).size > 1;

  const { i18n } = useLingui();

  return (
    <Box>
      <Box fontSize="1rem" fontWeight="bold">
        {getLocalizedLabel({ id: pc })}
      </Box>
      <LineChart
        data={withUniqueEntityId}
        mini={mini}
        fields={{
          x: {
            componentIri: "period",
          },
          y: {
            componentIri: pc,
            axisLabel: i18n._(getPriceComponentUnit(pc)),
          },
          segment: hasMultipleLines
            ? {
                componentIri: "uniqueId",
                palette: "elcom",
              }
            : undefined,
          style: {
            entity,
            colorDomain,
            colorAcc: `${entity}Label`,
          },
        }}
        measures={[
          {
            iri: pc,
            label: getLocalizedLabel({ id: pc }),
            __typename: "Measure",
          },
        ]}
        dimensions={[
          {
            iri: "period",
            label: "period",
            __typename: "TemporalDimension",
          },
        ]}
        aspectRatio={0.2}
      >
        {i === 0 && hasMultipleLines && (
          <Box mb={6}>
            <LegendColor symbol="line" />
          </Box>
        )}
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear format={formatAxis} /> <AxisTime />
            <Lines />
            {mini && <HighlightIndicator highlightYear={highlightYear} />}
            <InteractionHorizontal />
          </ChartSvg>

          {hasMultipleLines && <Ruler />}
          <HoverDotMultiple />

          <Tooltip type={hasMultipleLines ? "multiple" : "single"} />
        </ChartContainer>
      </LineChart>
    </Box>
  );
};
