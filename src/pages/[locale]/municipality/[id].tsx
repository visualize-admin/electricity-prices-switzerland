import { Box, Flex } from "@theme-ui/components";
import { GetServerSideProps } from "next";
import * as React from "react";
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

type Props = {
  id: string;
  name: string;
  operators: { id: string; name: string }[];
};

export const getServerSideProps: GetServerSideProps<
  Props,
  { locale: string; id: string }
> = async ({ params }) => {
  const { id } = params!;

  console.time("Muni");

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

  const municipality = (
    await getDimensionValuesAndLabels({
      view,
      source,
      dimensionKey: "municipality",
      filters: { municipality: [id] },
    })
  )[0];

  const operators = await getDimensionValuesAndLabels({
    view,
    source,
    dimensionKey: "operator",
    filters: { municipality: [id] },
  });

  console.timeEnd("Muni");

  return {
    props: {
      id,
      name: municipality.name,
      operators: operators.map(({ id, name }) => ({ id, name })),
    },
  };
};

const MunicipalityPage = ({ id, name, operators }: Props) => {
  const { query } = useRouter();
  return (
    <Flex sx={{ minHeight: "100vh", flexDirection: "column" }}>
      {!query.download && <Header></Header>}
      <Flex
        sx={{
          pt: 96,
          flexGrow: 1,
          bg: "monochrome200",
          flexDirection: "column",
        }}
      >
        <DetailPageBanner id={id} name={name} operators={operators} />

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
                <PriceComponentsBarChart id={id} entity="municipality" />
              )}
              {(!query.download || query.download === "evolution") && (
                <PriceEvolution id={id} entity="municipality" />
              )}
              {(!query.download || query.download === "distribution") && (
                <PriceDistributionHistograms id={id} entity="municipality" />
              )}
              {(!query.download || query.download === "comparison") && (
                <CantonsComparisonRangePlots id={id} entity="municipality" />
              )}
            </Box>
            {!query.download && (
              <Box
                sx={{
                  order: [1, 1, 2],
                  flex: ["1 1 100%", "1 1 100%", `1 1 ${1 / 3}%`],
                }}
              >
                <SelectorMulti entity="municipality" />
              </Box>
            )}
          </Flex>
        </Box>
      </Flex>
      <Footer></Footer>
    </Flex>
  );
};

export default MunicipalityPage;
