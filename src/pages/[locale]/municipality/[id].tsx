import { Flex } from "theme-ui";
import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";
import { Selector } from "../../../components/selector";
import { useRouter } from "next/router";

const MunicipalityPage = () => {
  const { query } = useRouter();
  const { year, priceComponent, category, product, id } = query;
  console.log({ year, priceComponent, category, product, id });
  return (
    <Flex sx={{ minHeight: "100vh", flexDirection: "column" }}>
      <Header></Header>
      <Flex sx={{ pt: 96, flexGrow: 1 }}>
        <Selector />
      </Flex>
      <Footer></Footer>
    </Flex>
  );
};

export default MunicipalityPage;
