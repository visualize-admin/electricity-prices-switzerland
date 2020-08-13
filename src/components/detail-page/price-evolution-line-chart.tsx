import { Trans } from "@lingui/macro";

import * as React from "react";
import { AxisHeightLinear } from "../charts-generic/axis/axis-height-linear";
import {
  AxisTime,
  AxisTimeDomain,
} from "../charts-generic/axis/axis-width-time";
import { HoverDotMultiple } from "../charts-generic/interaction/hover-dots-multiple";
import { Ruler } from "../charts-generic/interaction/ruler";
import { Tooltip } from "../charts-generic/interaction/tooltip";
import { LegendColor } from "../charts-generic/legends/color";
import { Lines } from "../charts-generic/lines/lines";
import { LineChart } from "../charts-generic/lines/lines-state";
import { InteractionHorizontal } from "../charts-generic/overlay/interaction-horizontal";
import { Loading } from "../loading";
import {
  ChartContainer,
  ChartSvg,
} from "./../../components/charts-generic/containers";
import { Card } from "./../../components/detail-page/card";
import {
  PriceComponent,
  useObservationsWithAllPriceComponentsQuery,
} from "./../../graphql/queries";
import {
  GenericObservation,
  Entity,
  getEntityLabelField,
  priceComponents,
} from "../../domain/data";
import { useQueryState } from "../../lib/use-query-state";
import { Box } from "@theme-ui/components";
import { memo } from "react";
import { FilterSetDescription } from "./filter-set-description";
import { getLocalizedLabel } from "../../domain/translation";
import { useI18n } from "../i18n-context";
import { EMPTY_ARRAY } from "../../lib/empty-array";

export const PriceEvolution = ({
  id,
  entity,
}: {
  id: string;
  entity: Entity;
}) => {
  const [
    { period, category, municipality, provider, canton, product },
  ] = useQueryState();

  const comparisonIds =
    entity === "municipality"
      ? municipality
      : entity === "provider"
      ? provider
      : canton;

  const entityIds =
    comparisonIds && comparisonIds?.some((m) => m !== "")
      ? [...comparisonIds, id]
      : [id];

  const [observationsQuery] = useObservationsWithAllPriceComponentsQuery({
    variables: {
      filters: {
        [entity]: entityIds,
        category,
        product,
      },
    },
  });
  const observations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.observations ?? EMPTY_ARRAY;

  // Add a unique ID for the combinations municipality+provider
  const withUniqueEntityId = observations.map((obs) => ({
    uniqueId: `${obs.municipalityLabel}, ${obs.providerLabel}`,
    ...obs,
  }));

  const hasMultipleLines =
    new Set(withUniqueEntityId.map((obs) => obs.uniqueId)).size > 1;

  return (
    <Card
      title={
        <Trans id="detail.card.title.prices.evolution">Tarifentwicklung</Trans>
      }
    >
      <FilterSetDescription
        filters={{
          category: category[0],
        }}
      />
      {observations.length === 0 ? (
        <Loading />
      ) : (
        <>
          {priceComponents.map((pc, i) => (
            <PriceEvolutionLineChart
              key={pc}
              hasMultipleLines={hasMultipleLines}
              observations={withUniqueEntityId as GenericObservation[]}
              entity={entity}
              priceComponent={pc as PriceComponent}
              withLegend={i === 0 && hasMultipleLines}
            />
          ))}
        </>
      )}
    </Card>
  );
};

const PriceEvolutionLineChart = memo(
  ({
    hasMultipleLines,
    observations,
    entity,
    priceComponent,
    withLegend,
  }: {
    hasMultipleLines: boolean;
    observations: GenericObservation[];
    entity: Entity;
    priceComponent: PriceComponent;
    withLegend: boolean;
  }) => {
    const i18n = useI18n();

    return (
      <>
        <Box sx={{ my: 4 }}>
          <LineChart
            data={observations}
            fields={{
              x: {
                componentIri: "period",
              },
              y: {
                componentIri: priceComponent,
              },
              segment: hasMultipleLines
                ? {
                    componentIri: "uniqueId",

                    palette: "elcom",
                  }
                : undefined,
            }}
            measures={[
              {
                iri: priceComponent,
                label: getLocalizedLabel({ i18n, id: priceComponent }),
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
            {withLegend && (
              <Box sx={{ mb: 6 }}>
                <LegendColor symbol="line" />
              </Box>
            )}
            <ChartContainer>
              <ChartSvg>
                <AxisHeightLinear /> <AxisTime />
                <Lines />
                <InteractionHorizontal />
              </ChartSvg>

              {hasMultipleLines && <Ruler />}

              <HoverDotMultiple />

              <Tooltip type={hasMultipleLines ? "multiple" : "single"} />
            </ChartContainer>
          </LineChart>
        </Box>
      </>
    );
  }
);
