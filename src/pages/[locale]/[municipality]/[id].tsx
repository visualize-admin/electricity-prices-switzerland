import { Flex, Text } from "@theme-ui/components";
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
      <Flex
        sx={{
          pt: 96,
          flexGrow: 1,
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-end",
        }}
      >
        <Selector />
        <Text variant="heading2" sx={{ mr: 4 }}>
          Zürich Detail Page
        </Text>
      </Flex>
      <Footer></Footer>
    </Flex>
  );
};

export default MunicipalityPage;
