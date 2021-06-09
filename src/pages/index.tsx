import { t, Trans } from "@lingui/macro";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useCallback } from "react";
import { Box, Flex, Grid, Text } from "theme-ui";
import { DownloadImage } from "../components/detail-page/download-image";
import { Footer } from "../components/footer";
import { Header } from "../components/header";
import { InfoBanner } from "../components/info-banner";
import { List } from "../components/list";
import { ChoroplethMap } from "../components/map";
import { Search } from "../components/search";
import { Selector } from "../components/selector";
import { useColorScale } from "../domain/data";
import {
  PriceComponent,
  useAllMunicipalitiesQuery,
  useObservationsQuery,
} from "../graphql/queries";
import { EMPTY_ARRAY } from "../lib/empty-array";
import { useQueryStateSingle } from "../lib/use-query-state";

const DOWNLOAD_ID = "map";

type Props = {
  locale: string;
};

export const getServerSideProps: GetServerSideProps<Props, { locale: string }> =
  async ({ locale }) => {
    return {
      props: {
        locale: locale!,
      },
    };
  };

const HEADER_HEIGHT_S = "107px";
const HEADER_HEIGHT_M_UP = "96px";

const IndexPage = ({ locale }: Props) => {
  const [{ period, priceComponent, category, product, download }] =
    useQueryStateSingle();

  const [observationsQuery] = useObservationsQuery({
    variables: {
      locale,
      priceComponent: priceComponent as PriceComponent,
      filters: {
        period: [period],
        category: [category],
        product: [product],
      },
    },
  });

  const [municipalitiesQuery] = useAllMunicipalitiesQuery({
    variables: {
      locale,
    },
  });

  const observations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.observations ?? EMPTY_ARRAY;
  const cantonMedianObservations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.cantonMedianObservations ?? EMPTY_ARRAY;
  const swissMedianObservations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.swissMedianObservations ?? EMPTY_ARRAY;

  const municipalities =
    municipalitiesQuery.data?.municipalities ?? EMPTY_ARRAY;

  const medianValue = swissMedianObservations[0]?.value;

  const colorAccessor = useCallback((d) => d.value, []);
  const colorScale = useColorScale({
    observations,
    medianValue,
    accessor: colorAccessor,
  });

  return (
    <>
      <Head>
        <title>{t({ id: "site.title" })}</title>
      </Head>
      <Grid
        sx={{
          minHeight: "100vh",
          gap: 0,
          gridTemplateRows: [
            `${HEADER_HEIGHT_S} 1fr auto`,
            `${HEADER_HEIGHT_M_UP} 1fr auto`,
          ],
        }}
      >
        <Box>
          <Header></Header>
        </Box>
        <Box
          sx={{
            position: "relative",
          }}
        >
          <InfoBanner />
          <Flex
            sx={{
              py: 8,
              flexDirection: "column",
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomStyle: "solid",
              borderBottomColor: "monochrome500",
              px: 4,
            }}
          >
            <Text
              as="h1"
              variant="giga"
              sx={{ textAlign: ["left", "left", "center"] }}
            >
              <Trans id="site.title">Strompreise Schweiz</Trans>
            </Text>

            <Text
              variant="paragraph1"
              sx={{
                width: "100%",
                textAlign: ["left", "left", "center"],
                color: "monochrome800",
                mt: 2,
                mb: 2,
                height: [0, 0, "unset"],
                visibility: ["hidden", "hidden", "visible"],
              }}
            >
              <Trans id="search.global">
                Detaillierte Preisanalysen von Kantonen, Gemeinden und
                Netzbetreibern.
              </Trans>
            </Text>

            <Search />
          </Flex>
          <Grid
            sx={{
              width: "100%",
              gridTemplateColumns: ["1fr", "1fr 20rem"],
              gridTemplateAreas: [`"map" "controls"`, `"map controls"`],
              gap: 0,
              position: "relative",
            }}
          >
            <Box
              // id used by the screenshot service
              id={DOWNLOAD_ID}
              sx={{
                bg: "monochrome200",
                top: [0, HEADER_HEIGHT_M_UP],
                width: "100%",
                gridArea: "map",
                height: ["70vw", `calc(100vh - ${HEADER_HEIGHT_M_UP})`],
                maxHeight: ["50vh", "100vh"],
                position: ["relative", "sticky"],
                borderRightWidth: "1px",
                borderRightStyle: "solid",
                borderRightColor: "monochrome500",
              }}
            >
              <ChoroplethMap
                year={period}
                observations={observations}
                municipalities={municipalities}
                observationsQueryFetching={
                  observationsQuery.fetching || municipalitiesQuery.fetching
                }
                medianValue={medianValue}
                colorScale={colorScale}
              />

              {!download && (
                <Box
                  sx={{
                    zIndex: 13,
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    mb: 3,
                    ml: 3,
                  }}
                >
                  <DownloadImage
                    elementId={DOWNLOAD_ID}
                    fileName={DOWNLOAD_ID}
                    downloadType={DOWNLOAD_ID}
                  />
                </Box>
              )}
            </Box>
            <Box sx={{ gridArea: "controls" }}>
              <Box
                sx={
                  {
                    // position: ["relative", "sticky"],
                    // top: [0, HEADER_HEIGHT_M_UP],
                    // zIndex: 1,
                  }
                }
              >
                <Selector />
              </Box>
              <List
                observations={observations}
                cantonObservations={cantonMedianObservations}
                colorScale={colorScale}
                observationsQueryFetching={observationsQuery.fetching}
              />
            </Box>
          </Grid>
        </Box>
        <Footer />
      </Grid>
    </>
  );
};

export default IndexPage;
