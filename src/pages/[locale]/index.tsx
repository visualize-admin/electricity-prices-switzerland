import { Flex, Box } from "theme-ui";
import { Footer } from "../../components/footer";
import { Header } from "../../components/header";
import { Selector } from "../../components/selector";
import { useRouter } from "next/router";
import { ChoroplethMap } from "../../components/map";
import { List } from "../../components/list";

const IndexPage = () => {
  const { query } = useRouter();
  const { year, priceComponent, category, product } = query;

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
          year={(year as string) ?? "2020"}
          category={(category as string) ?? "H4"}
        />
        <Selector />
        <List />
      </Flex>
      <Footer></Footer>
    </Flex>
  );
};

export default IndexPage;
