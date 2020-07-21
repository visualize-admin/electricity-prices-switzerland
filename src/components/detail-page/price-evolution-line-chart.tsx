import { Trans } from "@lingui/macro";
import { useRouter } from "next/router";
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
import { PriceComponent, useObservationsQuery } from "./../../graphql/queries";

export const PriceEvolutionLineChart = () => {
  const { query } = useRouter();

  const priceComponent = PriceComponent.Total; // TODO: parameterize priceComponent
  const category = (query.category as string) ?? "H4";
  const year = (query.year as string) ?? "2019";

  const [observationsQuery] = useObservationsQuery({
    variables: {
      priceComponent,
      filters: {
        category: [
          `https://energy.ld.admin.ch/elcom/energy-pricing/category/${category}`,
        ],
      },
    },
  });
  const observations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.cubeByIri?.observations ?? EMPTY_ARRAY;

  return (
    <Card
      title={
        <Trans id="detail.card.title.prices.evolution">Tarifentwicklung</Trans>
      }
    >
      {observations.length === 0 ? (
        <Loading />
      ) : (
        <LineChart
          data={observations
            .filter(
              (obs) =>
                obs.municipality ===
                `http://classifications.data.admin.ch/municipality/${query.id}`
            )
            .map((obs) => ({
              priceComponent: "Total (exkl. MwSt.)",
              ...obs,
            }))}
          fields={{
            x: {
              componentIri: "period",
            },
            y: {
              componentIri: "value",
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

            <Ruler />

            <HoverDotMultiple />

            <Tooltip type={"single"} />
          </ChartContainer>
        </LineChart>
      )}
    </Card>
  );
};
