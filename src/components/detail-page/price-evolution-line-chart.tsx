import { Trans } from "@lingui/macro";
import { Box } from "@theme-ui/components";
import * as React from "react";
import { memo } from "react";
import {
  Entity,
  GenericObservation,
  priceComponents,
  ObservationValue,
} from "../../domain/data";
import { getLocalizedLabel } from "../../domain/translation";
import { EMPTY_ARRAY } from "../../lib/empty-array";
import { useQueryState } from "../../lib/use-query-state";
import { AxisHeightLinear } from "../charts-generic/axis/axis-height-linear";
import { AxisTime } from "../charts-generic/axis/axis-width-time";
import { HoverDotMultiple } from "../charts-generic/interaction/hover-dots-multiple";
import { Ruler } from "../charts-generic/interaction/ruler";
import { Tooltip } from "../charts-generic/interaction/tooltip";
import { LegendColor } from "../charts-generic/legends/color";
import { Lines } from "../charts-generic/lines/lines";
import { LineChart } from "../charts-generic/lines/lines-state";
import { InteractionHorizontal } from "../charts-generic/overlay/interaction-horizontal";
import { Loading, NoDataHint } from "../hint";
import {
  ChartContainer,
  ChartSvg,
} from "./../../components/charts-generic/containers";
import { Card } from "./../../components/detail-page/card";
import {
  ObservationKind,
  PriceComponent,
  useObservationsWithAllPriceComponentsQuery,
} from "./../../graphql/queries";
import { Download } from "./download-image";
import { FilterSetDescription } from "./filter-set-description";
import { WithClassName } from "./with-classname";
import { useLocale } from "../../lib/use-locale";
import { group } from "d3-array";

const DOWNLOAD_ID: Download = "evolution";

export const PriceEvolution = ({
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

  return (
    <Card
      title={
        <Trans id="detail.card.title.prices.evolution">Tarifentwicklung</Trans>
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
        <div className={DOWNLOAD_ID}>
          <WithClassName downloadId={DOWNLOAD_ID}>
            <PriceEvolutionLineCharts
              observations={observations as GenericObservation[]}
              entity={entity}
            />
          </WithClassName>
        </div>
      )}
    </Card>
  );
};

const PriceEvolutionLineCharts = memo(
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
      <>
        {priceComponents.map((pc, i) => {
          return (
            <Box sx={{ my: 4 }} key={i}>
              <Box sx={{ fontSize: 4, fontWeight: "bold" }}>
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
      </>
    );
  }
);
