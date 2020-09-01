import { Box, Flex } from "@theme-ui/components";
import { GetServerSideProps } from "next";
import { DetailPageBanner } from "../../../components/detail-page/banner";
import { CantonsComparisonRangePlots } from "../../../components/detail-page/cantons-comparison-range";
import { PriceComponentsBarChart } from "../../../components/detail-page/price-components-bars";
import { PriceDistributionHistograms } from "../../../components/detail-page/price-distribution-histogram";
import { PriceEvolution } from "../../../components/detail-page/price-evolution-line-chart";
import { SelectorMulti } from "../../../components/detail-page/selector-multi";
import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";
import {
  getDimensionValuesAndLabels,
  getSource,
  getView,
} from "../../../graphql/rdf";
import { useRouter } from "next/router";
import { OperatorDocuments } from "../../../components/operator-documents";

type Props = {
  id: string;
  name: string;
  municipalities: { id: string; name: string }[];
};
export const getServerSideProps: GetServerSideProps<
  Props,
  { locale: string; id: string }
> = async ({ params }) => {
  const { id } = params!;

  const source = getSource();
  const cube = await source.cube(
    "https://energy.ld.admin.ch/elcom/electricity-price/cube"
  );

  if (!cube) {
    throw Error(
      `No cube ${"https://energy.ld.admin.ch/elcom/electricity-price/cube"}`
    );
  }

  const view = getView(cube);

  const operator = (
    await getDimensionValuesAndLabels({
      view,
      source,
      dimensionKey: "operator",
      filters: { operator: [id] },
    })
  )[0];

  const municipalities = await getDimensionValuesAndLabels({
    view,
    source,
    dimensionKey: "municipality",
    filters: { operator: [id] },
  });

  return {
    props: {
      id,
      name: operator.name,
      municipalities: municipalities.map(({ id, name }) => ({ id, name })),
    },
  };
};

const OperatorPage = ({ id, name, municipalities }: Props) => {
  const { query } = useRouter();

  return (
    <Flex sx={{ minHeight: "100vh", flexDirection: "column" }}>
      <Header></Header>
      <Flex
        sx={{
          pt: [107, 96],
          flexGrow: 1,
          bg: "monochrome200",
          flexDirection: "column",
        }}
      >
        <DetailPageBanner
          id={id}
          name={name}
          municipalities={municipalities}
          entity="operator"
        />

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
              {(!query.download || query.download === "components") && (
                <PriceComponentsBarChart id={id} entity="operator" />
              )}
              {(!query.download || query.download === "evolution") && (
                <PriceEvolution id={id} entity="operator" />
              )}
              {(!query.download || query.download === "distribution") && (
                <PriceDistributionHistograms id={id} entity="operator" />
              )}
              {(!query.download || query.download === "comparison") && (
                <CantonsComparisonRangePlots id={id} entity="operator" />
              )}
            </Box>
            {!query.download && (
              <Box
                sx={{
                  order: [1, 1, 2],
                  flex: ["1 1 100%", "1 1 100%", `1 1 ${1 / 3}%`],
                }}
              >
                <SelectorMulti entity="operator" />
                <OperatorDocuments id={id} />
              </Box>
            )}
          </Flex>
        </Box>
      </Flex>
      <Footer></Footer>
    </Flex>
  );
};

export default OperatorPage;
