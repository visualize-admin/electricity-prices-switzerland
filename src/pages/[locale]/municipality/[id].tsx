import { Flex, Box, Text } from "@theme-ui/components";
import { useRouter } from "next/router";
import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";
import { Trans } from "@lingui/macro";
import { LocalizedLink } from "../../../components/links";
import { Link as UILink } from "theme-ui";
import {
  useObservationsQuery,
  PriceComponent,
  Observation,
} from "../../../graphql/queries";
import * as React from "react";
import { DetailPageBanner } from "../../../components/detail-page/banner";
import { BarChart } from "../../../components/charts-generic/bars/bars-state";
import {
  ChartContainer,
  ChartSvg,
} from "../../../components/charts-generic/containers";
import { Bars } from "../../../components/charts-generic/bars/bars-simple";
import {
  AxisHeightLinear,
  AxisHeightLinearDomain,
} from "../../../components/charts-generic/axis/axis-height-linear";
import { LineChart } from "../../../components/charts-generic/lines/lines-state";
import {
  AxisTime,
  AxisTimeDomain,
} from "../../../components/charts-generic/axis/axis-width-time";
import { Lines } from "../../../components/charts-generic/lines/lines";
import { InteractionHorizontal } from "../../../components/charts-generic/overlay/interaction-horizontal";
import { Ruler } from "../../../components/charts-generic/interaction/ruler";
import { HoverDotMultiple } from "../../../components/charts-generic/interaction/hover-dots-multiple";
import { Tooltip } from "../../../components/charts-generic/interaction/tooltip";
import { LegendColor } from "../../../components/charts-generic/legends/color";
import { Card } from "../../../components/detail-page/card";
import { Histogram } from "../../../components/charts-generic/histogram/histogram-state";
import { standardH12020 } from "../../../docs/data/2020-standard-H1";
import {
  AxisWidthHistogram,
  AxisWidthHistogramDomain,
} from "../../../components/charts-generic/axis/axis-width-histogram";
import { HistogramColumns } from "../../../components/charts-generic/histogram/histogram";
import { Median } from "../../../components/charts-generic/histogram/median";
import { PriceComponents } from "../../../components/detail-page/price-components";

export const EMPTY_ARRAY: never[] = [];

const MunicipalityPage = () => {
  const { query } = useRouter();

  const kantonId = "261";
  const providerIds = ["xxx", "yyy"];

  const municipalityId = query.id;

  const priceComponent = PriceComponent.Total; // TODO: parameterize priceComponent
  const category = (query.category as string) ?? "H4";

  const [observationsQuery] = useObservationsQuery({
    variables: {
      priceComponent,
      filters: {
        category: [
          `https://energy.ld.admin.ch/elcom/energy-pricing/category/${category}`,
        ],
        // municipality: [
        //   `http://classifications.data.admin.ch/municipality/${query.id}`,
        // ],
      },
    },
  });
  const observations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.cubeByIri?.observations ?? EMPTY_ARRAY;

  return (
    <Flex sx={{ minHeight: "100vh", flexDirection: "column" }}>
      <Header></Header>
      <Flex
        sx={{
          pt: 96,
          flexGrow: 1,
          bg: "monochrome200",
          flexDirection: "column",
        }}
      >
        <DetailPageBanner
          entity={municipalityId as string}
          kanton={"kanton"}
          linkedIds={["xxx", "yyy"]}
        />

        <Box sx={{ width: "100%", maxWidth: "67rem", mx: "auto", my: 2 }}>
          <PriceComponents />

          {/* LINE CHART */}
          <Card
            title={
              <Trans id="detail.card.title.prices.evolution">
                Tarifentwicklung
              </Trans>
            }
          >
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
              aspectRatio={0.4}
            >
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
              <LegendColor symbol="line" />
            </LineChart>
          </Card>

          {/* HISTOGRAM */}
          <Card
            title={
              <Trans id="detail.card.title.prices.distribution">
                Preisverteilung in der Schweiz
              </Trans>
            }
          >
            <Histogram
              data={observations}
              fields={{
                x: {
                  componentIri: "value",
                },
                label: {
                  componentIri: "Netzbetreiber",
                },
              }}
              measures={[
                {
                  iri: "value",
                  label: "value",
                  __typename: "Measure",
                },
              ]}
              aspectRatio={0.4}
            >
              <ChartContainer>
                <ChartSvg>
                  <AxisHeightLinear />
                  <AxisHeightLinearDomain />
                  <AxisWidthHistogram />
                  <AxisWidthHistogramDomain />
                  <HistogramColumns />
                  <Median label="CH Median" />
                </ChartSvg>
                <Tooltip type="single" />
              </ChartContainer>
            </Histogram>
          </Card>
        </Box>
      </Flex>
      <Footer></Footer>
    </Flex>
  );
};

export default MunicipalityPage;
