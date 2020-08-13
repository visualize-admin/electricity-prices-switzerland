import { GetServerSideProps } from "next";
import { Box, Flex } from "theme-ui";
import { DetailPageBanner } from "../../../components/detail-page/banner";
import { CantonsComparisonRangePlots } from "../../../components/detail-page/cantons-comparison-range";
import { PriceComponentsBarChart } from "../../../components/detail-page/price-components-bars";
import { PriceDistributionHistograms } from "../../../components/detail-page/price-distribution-histogram";
import { PriceEvolution } from "../../../components/detail-page/price-evolution-line-chart";
import { SelectorMulti } from "../../../components/detail-page/selector-multi";
import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";
import { getSource, search } from "../../../graphql/rdf";

type Props = {
  id: string;
  name: string;
  // providers: { id: string; name: string }[];
};

export const getServerSideProps: GetServerSideProps<
  Props,
  { locale: string; id: string }
> = async ({ params, res }) => {
  const { id } = params!;

  const canton = (
    await search({
      source: getSource(),
      query: "",
      types: ["canton"],
      ids: [id],
    })
  )[0];

  if (!canton) {
    res.statusCode = 404;
  }

  return { props: { id, name: canton.name } };
};

const CantonPage = ({ id, name }: Props) => {
  return (
    <Flex sx={{ minHeight: "100vh", flexDirection: "column" }}>
      <Header></Header>
      <Flex
        sx={{
          pt: 96,
          flexGrow: 1,
          bg: "monochrome200",
          flexDirection: "column",
        }}
      >
        <DetailPageBanner id={id} name={name} />

        <Box sx={{ width: "100%", maxWidth: "67rem", mx: "auto", my: 2 }}>
          <Flex
            sx={{ width: "100%", flexDirection: ["column", "column", "row"] }}
          >
            <Box
              sx={{
                order: [2, 2, 1],
                flex: ["1 1 100%", "1 1 100%", `2 2 ${2 / 3}%`],
              }}
            >
              <PriceComponentsBarChart id={id} entity="canton" />
              {/* <PriceEvolution id={id} entity="canton" />
              <PriceDistributionHistograms id={id} entity="canton" />
              <CantonsComparisonRangePlots id={id} entity="canton" /> */}
            </Box>
            <Box
              sx={{
                order: [1, 1, 2],
                flex: ["1 1 100%", "1 1 100%", `1 1 ${1 / 3}%`],
              }}
            >
              <SelectorMulti entity="canton" />
            </Box>
          </Flex>
        </Box>
      </Flex>
      <Footer></Footer>
    </Flex>
  );
};

export default CantonPage;
