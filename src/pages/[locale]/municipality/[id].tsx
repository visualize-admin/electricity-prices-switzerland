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

export const EMPTY_ARRAY: never[] = [];

type Props = { id: string };

export const getServerSideProps: GetServerSideProps<Props, Props> = async ({
  params,
}) => {
  const { id } = params!;
  return { props: { id } };
};

const MunicipalityPage = ({ id }: Props) => {
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
        <DetailPageBanner
          entity={id}
          kanton={"kanton"}
          linkedIds={["xxx", "yyy"]}
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
              <PriceComponentsBarChart id={id} entity="municipality" />
              <PriceEvolution id={id} entity="municipality" />
              <PriceDistributionHistograms id={id} entity="municipality" />
              <CantonsComparisonRangePlots id={id} entity="municipality" />
            </Box>
            <Box
              sx={{
                order: [1, 1, 2],
                flex: ["1 1 100%", "1 1 100%", `1 1 ${1 / 3}%`],
              }}
            >
              <SelectorMulti />
            </Box>
          </Flex>
        </Box>
      </Flex>
      <Footer></Footer>
    </Flex>
  );
};

export default MunicipalityPage;
