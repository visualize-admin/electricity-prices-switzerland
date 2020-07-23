import { Trans } from "@lingui/macro";

import * as React from "react";
import { EMPTY_ARRAY } from "../../pages/[locale]/municipality/[id]";
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

export const PriceEvolution = ({
  id,
  entity,
}: {
  id: string;
  entity: Entity;
}) => {
  const [
    { period, category, municipality, provider, canton },
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
        municipality: entityIds,
        category: [
          `https://energy.ld.admin.ch/elcom/energy-pricing/category/${category[0]}`,
        ],
        // product: [product]
      },
    },
  });
  const observations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.cubeByIri?.observations ?? EMPTY_ARRAY;

  console.log("observations in line chart", observations);
  console.log("entityIds in line chart", entityIds);

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
          {priceComponents.map((pc) => (
            <PriceEvolutionLineChart
              key={pc}
              hasMultipleLines={entityIds.length > 1}
              observations={observations as GenericObservation[]}
              entity={entity}
              priceComponent={pc as PriceComponent}
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
  }: {
    hasMultipleLines: boolean;
    observations: GenericObservation[];
    entity: Entity;
    priceComponent: PriceComponent;
  }) => {
    return (
      <Box sx={{ my: 6 }}>
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
                  componentIri: getEntityLabelField(entity),
                  palette: "accent",
                }
              : undefined,
          }}
          measures={[
            {
              iri: priceComponent,
              label: priceComponent,
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
          <LegendColor symbol="line" />
          <ChartContainer>
            <ChartSvg>
              <AxisHeightLinear /> <AxisTime /> <AxisTimeDomain />
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
  }
);
