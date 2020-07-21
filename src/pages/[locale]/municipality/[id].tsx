import { Box, Flex } from "@theme-ui/components";
import { useRouter } from "next/router";
import * as React from "react";
import { DetailPageBanner } from "../../../components/detail-page/banner";
import { CantonsComparison } from "../../../components/detail-page/cantons-comparison";
import { SelectorMulti } from "../../../components/detail-page/selector-multi";
import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";
import { createDynamicRouteProps } from "../../../components/links";
import {
  PriceComponent,
  useMunicipalitiesQuery,
} from "../../../graphql/queries";
import { useLocale } from "../../../lib/use-locale";

export const EMPTY_ARRAY: never[] = [];

const MunicipalityPage = () => {
  const locale = useLocale();
  const { query, replace } = useRouter();

  // FIXME: use query
  const kantonId = "261";
  const providerIds = ["xxx", "yyy"];
  const municipalityId = query.id;

  const updateQueryParams = (queryObject: { [x: string]: string }) => {
    const { href, as } = createDynamicRouteProps({
      pathname: `/[locale]/municipality/${municipalityId}`,
      query: { ...query, ...queryObject },
    });
    replace(href, as);
  };

  const year = query.year ? (query.year as string).split(",") : ["2019"];
  const priceComponent =
    (query.priceComponent as PriceComponent) ?? PriceComponent.Total; // TODO: parameterize priceComponent
  const category = query.category as string;

  console.log(year);

  const [municipality] = useMunicipalitiesQuery({
    variables: {
      locale,
      query: "",
    },
  });
  // const observations = observationsQuery.fetching
  //   ? EMPTY_ARRAY
  //   : observationsQuery.data?.cubeByIri?.observations ?? EMPTY_ARRAY;
  if (!municipality.fetching) {
    console.log(municipality);
  }
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
          <Flex sx={{ width: "100%" }}>
            <Box sx={{ flex: `2 2 ${2 / 3}%` }}>
              <CantonsComparison period={year as string[]} />
            </Box>
            <Box sx={{ flex: `1 1 ${1 / 3}%`, my: 2 }}>
              <SelectorMulti
                year={"2019"}
                priceComponent={priceComponent}
                category={category}
                updateQueryParams={updateQueryParams}
              />
            </Box>
          </Flex>
          {/* <PriceComponents />


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
          </Card> */}

          {/* HISTOGRAM */}
          {/* <Card
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
              aspectRatio={0.3}
            >
              <ChartContainer>
                <ChartSvg>
                  <AxisHeightLinear />

                  <AxisWidthHistogram />
                  <AxisWidthHistogramDomain />
                  <HistogramColumns />
                  <Median label="CH Median" />
                </ChartSvg>
                <Tooltip type="single" />
              </ChartContainer>
            </Histogram>
          </Card> */}
        </Box>
      </Flex>
      <Footer></Footer>
    </Flex>
  );
};

export default MunicipalityPage;
