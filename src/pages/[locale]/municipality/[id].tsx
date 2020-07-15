import { Flex, Box, Text } from "@theme-ui/components";
import { useRouter } from "next/router";
import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";
import { Trans } from "@lingui/macro";
import { LocalizedLink } from "../../../components/links";
import { Link as UILink } from "theme-ui";
import { useObservationsQuery, PriceComponent } from "../../../graphql/queries";
import * as React from "react";
import { DetailPageBanner } from "../../../components/detail-page/detail-page-banner";
import { BarChart } from "../../../components/charts-generic/bars/bars-state";
import {
  ChartContainer,
  ChartSvg,
} from "../../../components/charts-generic/containers";
import { Bars } from "../../../components/charts-generic/bars/bars-simple";
import { AxisHeightLinear } from "../../../components/charts-generic/axis/axis-height-linear";
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

const EMPTY_ARRAY: never[] = [];

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
        municipality: [
          `http://classifications.data.admin.ch/municipality/${query.id}`,
        ],
      },
    },
  });
  const observations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.cubeByIri?.observations ?? EMPTY_ARRAY;

  console.log({ municipalityId });
  console.table(observations);

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

        <Box sx={{ width: "100%", maxWidth: "65rem", mx: "auto", my: 2 }}>
          {/* BAR CHART */}
          <Box sx={{ bg: "monochrome100", p: 5, m: 4 }}>
            <Text as="h2" variant="heading2" sx={{ pt: 1 }}>
              <Trans id="detail.card.price.components">Preiskomponenten</Trans>
            </Text>
            <BarChart
              data={observations
                .filter((obs) => obs.period === "2018")
                .map((obs) => ({
                  priceComponent: "Total (exkl. MwSt.)",
                  ...obs,
                }))}
              fields={{
                x: {
                  componentIri: "value",
                },
                y: {
                  componentIri: "priceComponent",
                  sorting: { sortingType: "byMeasure", sortingOrder: "desc" },
                },
              }}
              measures={[
                {
                  iri: "value",
                  label: "value",
                  __typename: "Measure",
                },
              ]}
            >
              <ChartContainer>
                <ChartSvg>
                  <Bars />
                </ChartSvg>
              </ChartContainer>
            </BarChart>
          </Box>

          {/* LINE CHART */}
          <Box sx={{ bg: "monochrome100", p: 5, m: 4 }}>
            <Text as="h2" variant="heading2" sx={{ pt: 1 }}>
              <Trans id="detail.card.price.components">Preiskomponenten</Trans>
            </Text>
            <LineChart
              data={observations.map((obs) => ({
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

                <Tooltip type={"multiple"} />
              </ChartContainer>
              <LegendColor symbol="line" />
            </LineChart>
          </Box>
        </Box>
      </Flex>
      <Footer></Footer>
    </Flex>
  );
};

export default MunicipalityPage;
