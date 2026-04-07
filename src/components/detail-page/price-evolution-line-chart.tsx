import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { Box } from "@mui/material";
import { memo } from "react";

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
import { LoadingSkeleton, NoDataHint } from "src/components/hint";
import { InfoDialogButton } from "src/components/info-dialog";
import {
  DetailPriceComponent,
  detailsPriceComponents,
  Entity,
  GenericObservation,
} from "src/domain/data";
import { useFormatCurrency } from "src/domain/helpers";
import { RP_PER_KWH } from "src/domain/metrics";
import { useQueryStateEnergyPricesDetails } from "src/domain/query-states";
import { getLocalizedLabel, TranslationKey } from "src/domain/translation";
import {
  ObservationKind,
  useObservationsWithAllPriceComponentsQuery,
} from "src/graphql/queries";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { useLocale } from "src/lib/use-locale";

import { LatestIndicator } from "../charts-generic/interaction/latest-indicator";

const DOWNLOAD_ID: Download = "evolution";

// Meteringrate excluded — only 1 value. To revisit later.
const evolutionPriceComponents = detailsPriceComponents.filter(
  (x) => x !== "meteringrate"
);

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
          <FilterSetDescription filters={filters} />
        </CardDescription>
      </CardHeader>
      <Box display={["none", "none", "block"]}>
        <ButtonGroup<DetailPriceComponent>
          id="evolutionPriceComponent"
          options={evolutionPriceComponents.map((value) => ({
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
          items={evolutionPriceComponents}
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
}: SectionProps & {
  priceComponents: DetailPriceComponent[];
  mini?: boolean;
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

  const [observationsQuery] = useObservationsWithAllPriceComponentsQuery({
    variables: {
      locale,
      filters: {
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
    : (observationsQuery.data?.observations ?? EMPTY_ARRAY);
  const cantonObservations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : (observationsQuery.data?.cantonMedianObservations ?? EMPTY_ARRAY);
  const observations = [...operatorObservations, ...cantonObservations];

  return observationsQuery.fetching || false ? (
    <LoadingSkeleton height={166} />
  ) : observations.length === 0 ? (
    <NoDataHint />
  ) : (
    <div className={DOWNLOAD_ID}>
      <WithClassName
        downloadId={DOWNLOAD_ID}
        isFetching={observationsQuery.fetching}
      >
        <PriceEvolutionLineCharts
          observations={observations as GenericObservation[]}
          entity={entity}
          priceComponents={priceComponents}
          mini={mini}
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
  }: Pick<SectionProps, "entity"> & {
    priceComponents: DetailPriceComponent[];
    observations: GenericObservation[];
    mini?: boolean;
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
            />
          );
        })}
      </Box>
    );
  },
);

const PriceEvolutionLineChart = (props: {
  pc: DetailPriceComponent;
  i: number;
  observations: GenericObservation[];
  entity: Entity;
  mini?: boolean;
}) => {
  const { pc, entity, i, observations, mini } = props;
  const formatCurrency = useFormatCurrency();
  const withUniqueEntityId: GenericObservation[] = observations.map((obs) => ({
    uniqueId:
      obs.__typename === "OperatorObservation"
        ? `${obs.municipalityLabel}, ${obs.operatorLabel}`
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
        fields={{
          x: {
            componentIri: "period",
          },
          y: {
            componentIri: pc,
            axisLabel: i18n._(RP_PER_KWH),
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
            <AxisHeightLinear format={formatCurrency} /> <AxisTime />
            <Lines />
            <InteractionHorizontal />
          </ChartSvg>

          {hasMultipleLines && <Ruler />}
          {mini && <LatestIndicator />}
          <HoverDotMultiple />

          <Tooltip type={hasMultipleLines ? "multiple" : "single"} />
        </ChartContainer>
      </LineChart>
    </Box>
  );
};
