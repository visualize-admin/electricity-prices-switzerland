import { Flex, Box } from "theme-ui";
import { Footer } from "../../components/footer";
import { Header } from "../../components/header";
import { Selector } from "../../components/selector";
import { useRouter } from "next/router";
import { ChoroplethMap } from "../../components/map";
import { List } from "../../components/list";
import { InferGetStaticPropsType } from "next";
import { createDynamicRouteProps } from "../../components/links";

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
      pathname: `/[locale]/index`,
      query: { ...query, ...queryObject },
    });
    replace(href, as);
  };

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
        {/* <ChoroplethMap
          year={(year as string) ?? "2020"}
          category={(category as string) ?? "H4"}
        /> */}
        <Selector
          year={(query.year as string) ?? initialParams.year}
          priceComponent={
            (query.priceComponent as string) ?? initialParams.priceComponent
          }
          category={(query.category as string) ?? initialParams.category}
          updateQueryParams={updateQueryParams}
        />
        <List />
      </Flex>
      <Footer></Footer>
    </Flex>
  );
};

export default IndexPage;
