import { InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import { Box, Flex, Grid, Text } from "theme-ui";
import { Footer } from "../../components/footer";
import { Header } from "../../components/header";
import { createDynamicRouteProps } from "../../components/links";
import { ChoroplethMap } from "../../components/map";
import { PriceColorLegend } from "../../components/price-color-legend";
import { Selector } from "../../components/selector";
import { useColorScale } from "../../domain/data";
import {
  PriceComponent,
  useObservationsQuery,
  OperatorObservationFieldsFragment,
} from "../../graphql/queries";
import { useCallback, useMemo } from "react";
import { useQueryStateSingle } from "../../lib/use-query-state";
import { List } from "../../components/list";
import { Trans } from "@lingui/macro";
import { EMPTY_ARRAY } from "../../lib/empty-array";
import { Search } from "../../components/search";
import { DownloadImage } from "../../components/detail-page/download-image";

const DOWNLOAD_ID = "map";

export const getServerSideProps = async () => {
  return {
    props: {},
  };
};

const HEADER_HEIGHT_S = "107px";
const HEADER_HEIGHT_M_UP = "96px";

const IndexPage = () => {
  const [
    { period, priceComponent, category, product, download },
  ] = useQueryStateSingle();

  const [observationsQuery] = useObservationsQuery({
    variables: {
      priceComponent: priceComponent as PriceComponent,
      filters: {
        period: [period],
        category: [
          `https://energy.ld.admin.ch/elcom/electricity-price/category/${category}`,
        ],
        product: [product],
      },
    },
  });

  const observations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.observations ?? EMPTY_ARRAY;

  const operatorObservations = useMemo<
    OperatorObservationFieldsFragment[]
  >(() => {
    return observations.filter(
      (d): d is OperatorObservationFieldsFragment =>
        d.__typename === "OperatorObservation"
    );
  }, [observations]);

  const colorAccessor = useCallback((d) => d.value, []);
  const colorScale = useColorScale({
    observations,
    accessor: colorAccessor,
  });

  return (
    <>
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
                Siehe die detaillierte Preisanalyse von Kantone, Gemeinde,
                Netzbetreiber.
              </Trans>
            </Text>

            <Search />
          </Flex>

          <Grid
            sx={{
              width: "100%",
              gridTemplateColumns: ["1fr", "1fr 20rem"],
              gridTemplateAreas: [`"controls" "map"`, `"map controls"`],
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
              }}
            >
              <ChoroplethMap
                year={period}
                observations={operatorObservations}
                observationsQueryFetching={observationsQuery.fetching}
                colorScale={colorScale}
              />
              <Box
                sx={{
                  zIndex: 13,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  mt: 3,
                  ml: 3,
                }}
              >
                <PriceColorLegend />
              </Box>

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
                    download={DOWNLOAD_ID}
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
                colorScale={colorScale}
                observationsQueryFetching={observationsQuery.fetching}
              />
            </Box>
          </Grid>

          {/* <Box sx={{ height: "50vh", bg: "secondaryLight" }}></Box> */}
        </Box>
        <Footer></Footer>
      </Grid>
    </>
  );
};

export default IndexPage;
