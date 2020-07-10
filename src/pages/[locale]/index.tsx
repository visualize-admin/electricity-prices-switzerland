import { Flex, Box, Grid } from "theme-ui";
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
  const priceComponent = PriceComponent.Total; // TODO: parameterize priceComponent
  const category = (query.category as string) ?? initialParams.category;

  const [observationsQuery] = useObservationsQuery({
    variables: {
      priceComponent: PriceComponent.Total,
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
    <Flex sx={{ minHeight: "100vh", flexDirection: "column" }}>
      <Header></Header>
      <Flex
        sx={{
          pt: 96,
          flexGrow: 1,
          position: "relative",
        }}
      >
        <Box
          sx={{ position: "absolute", top: 0, left: 0, width: "100%", p: 6 }}
        >
          {colorScale && (
            <ChoroplethMap
              year={year}
              observations={observations}
              colorScale={colorScale}
            />
          )}
        </Box>
        <Grid
          sx={{
            width: "100%",
            gridTemplateColumns: " 1fr 1fr",
            columnGap: 0,
            mx: 5,
            my: 4,
          }}
        >
          <PriceColorLegend />

          <Flex
            sx={{
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-end",
            }}
          >
            <Selector
              year={year}
              priceComponent={priceComponent}
              category={category}
              updateQueryParams={updateQueryParams}
            />
            <List
              year={year}
              priceComponent={priceComponent}
              category={category}
            />
          </Flex>
        </Grid>
      </Flex>
      <Footer></Footer>
    </Flex>
  );
};

export default IndexPage;
