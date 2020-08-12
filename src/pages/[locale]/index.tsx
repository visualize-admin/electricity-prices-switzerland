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
import { PriceComponent, useObservationsQuery } from "../../graphql/queries";
import { useCallback } from "react";
import { useQueryStateSingle } from "../../lib/use-query-state";
import { List } from "../../components/list";
import { Trans } from "@lingui/macro";
import { Search } from "../../components/search";

const EMPTY_ARRAY: never[] = [];

export const getServerSideProps = async () => {
  return {
    props: {},
  };
};

const HEADER_HEIGHT_S = "107px";
const HEADER_HEIGHT_M_UP = "96px";

const IndexPage = () => {
  const [{ period, priceComponent, category }] = useQueryStateSingle();

  const [observationsQuery] = useObservationsQuery({
    variables: {
      priceComponent: priceComponent as PriceComponent,
      filters: {
        period: [period],
        category: [
          `https://energy.ld.admin.ch/elcom/energy-pricing/category/${category}`,
        ],
      },
    },
  });

  const observations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.cubeByIri?.observations ?? EMPTY_ARRAY;

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
              mx: 4,
            }}
          >
            <Text as="h1" variant="giga" sx={{ textAlign: "center" }}>
              <Trans id="site.title">Strompreise Schweiz</Trans>
            </Text>
            <Search showLabel />
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
                observations={observations}
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
              <List observations={observations} colorScale={colorScale} />
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
