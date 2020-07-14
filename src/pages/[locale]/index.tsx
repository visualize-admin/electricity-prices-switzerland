import { Flex, Box, Grid, Text } from "theme-ui";
import { Footer } from "../../components/footer";
import { Header } from "../../components/header";
import { Selector } from "../../components/selector";
import { useRouter } from "next/router";
import { ChoroplethMap } from "../../components/map";
import { List } from "../../components/list";
import { InferGetStaticPropsType } from "next";
import { createDynamicRouteProps } from "../../components/links";
import { useObservationsQuery, PriceComponent } from "../../graphql/queries";
import { scaleSequential, scaleQuantile, interpolateRdYlGn } from "d3";
import { getColorScale, getColorDomain } from "../../domain/data";
import { PriceColorLegend } from "../../components/price-color-legend";

const EMPTY_ARRAY: never[] = [];

type Props = {
  year: string;
  priceComponent: string;
  category: string;
  // product: string;
};
export const getServerSideProps = async () => {
  // FIXME: Add "product" when it is data-ready
  const initialParams = {
    year: "2019",
    priceComponent: "total",
    category: "H1",
    // product: "standard"
  };

  return {
    props: {
      initialParams,
    },
  };
};

const HEADER_HEIGHT_S = "107px";
const HEADER_HEIGHT_M_UP = "96px";

const IndexPage = ({
  initialParams,
}: InferGetStaticPropsType<typeof getServerSideProps>) => {
  const { replace, query } = useRouter();

  const updateQueryParams = (queryObject: { [x: string]: string }) => {
    const { href, as } = createDynamicRouteProps({
      pathname: `/[locale]`,
      query: { ...query, ...queryObject },
    });
    replace(href, as);
  };

  const year = (query.year as string) ?? initialParams.year;
  const priceComponent =
    (query.priceComponent as PriceComponent) ?? PriceComponent.Total; // TODO: parameterize priceComponent
  const category = (query.category as string) ?? initialParams.category;

  const [observationsQuery] = useObservationsQuery({
    variables: {
      priceComponent,
      filters: {
        period: [year],
        category: [
          `https://energy.ld.admin.ch/elcom/energy-pricing/category/${category}`,
        ],
      },
    },
  });

  const observations = observationsQuery.fetching
    ? EMPTY_ARRAY
    : observationsQuery.data?.cubeByIri?.observations ?? EMPTY_ARRAY;

  const colorScale = getColorScale({
    observations,
    accessor: (d) => d.value,
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
              py: 6,
              flexDirection: "column",
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomStyle: "solid",
              borderBottomColor: "monochrome500",
            }}
          >
            <Text as="h1" variant="giga" sx={{ textAlign: "center" }}>
              Titel
            </Text>
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
                year={year}
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
                sx={{
                  position: ["relative", "sticky"],
                  top: [0, HEADER_HEIGHT_M_UP],
                }}
              >
                <Selector
                  year={year}
                  priceComponent={priceComponent}
                  category={category}
                  updateQueryParams={updateQueryParams}
                />
              </Box>
              <Box sx={{ height: "200vh", background: "teal" }}>THe list</Box>
              {/* <List
              year={year}
              priceComponent={priceComponent}
              category={category}
            /> */}
            </Box>
          </Grid>

          <Box sx={{ height: "50vh", bg: "hotpink" }}>Other content</Box>
        </Box>
        <Footer></Footer>
      </Grid>
    </>
  );
};

export default IndexPage;
