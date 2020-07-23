import { Flex, Text, Box } from "@theme-ui/components";
import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";
import { Selector } from "../../../components/selector";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { useQueryState } from "../../../lib/use-query-state";
import { DetailPageBanner } from "../../../components/detail-page/banner";

import { PriceComponentsBarChart } from "../../../components/detail-page/price-components-bars";
import { PriceEvolution } from "../../../components/detail-page/price-evolution-line-chart";
import { PriceDistributionHistograms } from "../../../components/detail-page/price-distribution-histogram";
import { CantonsComparisonRangePlots } from "../../../components/detail-page/cantons-comparison-range";
import { SelectorMulti } from "../../../components/detail-page/selector-multi";

type Props = { id: string };

export const getServerSideProps: GetServerSideProps<Props, Props> = async ({
  params,
}) => {
  const { id } = params!;
  return { props: { id } };
};

const ProviderPage = ({ id }: Props) => {
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
              <PriceComponentsBarChart id={id} entity="provider" />
              <PriceEvolution id={id} entity="provider" />
              <PriceDistributionHistograms id={id} entity="provider" />
              <CantonsComparisonRangePlots id={id} entity="provider" />
            </Box>
            <Box
              sx={{
                order: [1, 1, 2],
                flex: ["1 1 100%", "1 1 100%", `1 1 ${1 / 3}%`],
              }}
            >
              <SelectorMulti entity="provider" />
            </Box>
          </Flex>
        </Box>
      </Flex>
      <Footer></Footer>
    </Flex>
  );
};

export default ProviderPage;
