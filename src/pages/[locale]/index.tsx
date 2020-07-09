import { Flex, Box } from "theme-ui";
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
    year: "2020",
    priceComponent: "total",
    category: "H4",
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
  console.log({ year, priceComponent, category });
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

  const _colorScale = scaleQuantile()
    .domain(observations.map((d) => d.value))
    .range([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]);

  // TODO: Replace with proper color interpolator
  const colorScale = scaleSequential((t) =>
    interpolateRdYlGn(1 - _colorScale(t))
  );
  return (
    <Flex sx={{ minHeight: "100vh", flexDirection: "column" }}>
      <Header></Header>
      <Flex
        sx={{
          pt: 96,
          flexGrow: 1,
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-end",
        }}
      >
        <ChoroplethMap
          year={year}
          observations={observations}
          colorScale={colorScale}
        />
        <Selector
          year={year}
          priceComponent={priceComponent}
          category={category}
          updateQueryParams={updateQueryParams}
        />
        <List year={year} priceComponent={priceComponent} category={category} />
      </Flex>
      <Footer></Footer>
    </Flex>
  );
};

export default IndexPage;
