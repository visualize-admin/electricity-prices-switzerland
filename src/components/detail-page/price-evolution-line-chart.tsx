import { t, Trans } from "@lingui/macro";
import { Box } from "@mui/material";
import { memo } from "react";

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
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import {
  ObservationKind,
  useObservationsWithAllPriceComponentsQuery,
} from "src/graphql/queries";
import { EMPTY_ARRAY } from "src/lib/empty-array";
import { useLocale } from "src/lib/use-locale";
import { useQueryState } from "src/lib/use-query-state";

const DOWNLOAD_ID: Download = "evolution";

export const PriceEvolution = ({
  id,
  entity,
}: {
  id: string;
  entity: Entity;
}) => {
  const locale = useLocale();
  const [{ category, municipality, operator, canton, product, period }] =
    useQueryState();

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
  const observations = [...operatorObservations, ...cantonObservations];

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
            Tarifentwicklung
          </Trans>
        </CardTitle>
        <CardDescription>
          <FilterSetDescription filters={filters} />
        </CardDescription>
      </CardHeader>

      {observationsQuery.fetching ? (
        <Loading />
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
            />
          </WithClassName>
        </div>
      )}
      {/*FIXME: placeholder values */}
      <CardFooter date="March 7, 2024, 1:28 PM" source="Lindas" />
    </Card>
  );
};

export const PriceEvolutionLineCharts = memo(
  ({
    observations,
    entity,
  }: {
    observations: GenericObservation[];
    entity: Entity;
  }) => {
    // Add a unique ID for the combinations municipality+operator
    const withUniqueEntityId: GenericObservation[] = observations.map(
      (obs) => ({
        uniqueId:
          obs.__typename === "OperatorObservation"
            ? `${obs.municipalityLabel}, ${obs.operatorLabel}`
            : obs.cantonLabel,
        ...obs,
      })
    );

    const hasMultipleLines =
      new Set(withUniqueEntityId.map((obs) => obs.uniqueId)).size > 1;

    const colorDomain = [
      ...new Set(withUniqueEntityId.map((p) => p[`${entity}Label`])),
    ] as string[];

    return (
      <Box
        display={"flex"}
        sx={{
          flexDirection: "column",
          gap: 6.5,
        }}
      >
        {priceComponents.map((pc, i) => {
          return (
            <Box key={i}>
              <Box sx={{ fontSize: "1rem", fontWeight: "bold" }}>
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
                  },
                  segment: hasMultipleLines
                    ? {
                        componentIri: "uniqueId",
                        palette: "elcom",
                        // colorMapping. sadly, we can't use colorMapping here because colors should not match segment values
                      }
                    : undefined,
                  // This field doesn't respect the same chart system and context as Prisma
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
                  <Box sx={{ mb: 6 }}>
                    <LegendColor symbol="line" />
                  </Box>
                )}
                <ChartContainer>
                  <ChartSvg>
                    <AxisHeightLinear format="currency" /> <AxisTime />
                    <Lines />
                    <InteractionHorizontal />
                  </ChartSvg>

                  {hasMultipleLines && <Ruler />}

                  <HoverDotMultiple />

                  <Tooltip type={hasMultipleLines ? "multiple" : "single"} />
                </ChartContainer>
              </LineChart>
            </Box>
          );
        })}
      </Box>
    );
  }
);
