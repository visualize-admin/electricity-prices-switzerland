import { Box, Flex } from "@theme-ui/components";
import { useRouter } from "next/router";
import * as React from "react";
import { DetailPageBanner } from "../../../components/detail-page/banner";
import { CantonsComparisonRangePlots } from "../../../components/detail-page/cantons-comparison-range";
import { SelectorMulti } from "../../../components/detail-page/selector-multi";
import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";
import { createDynamicRouteProps } from "../../../components/links";
import {
  PriceComponent,
  useMunicipalitiesQuery,
} from "../../../graphql/queries";
import { useLocale } from "../../../lib/use-locale";
import { PriceDistributionHistograms } from "../../../components/detail-page/price-distribution-histogram";
import { PriceEvolutionLineChart } from "../../../components/detail-page/price-evolution-line-chart";
import { PriceComponents } from "../../../components/detail-page/price-components";
import { useQueryState } from "../../../lib/use-query-state";

export const EMPTY_ARRAY: never[] = [];

// Prevent router.query from being undefined on first render!
export const getServerSideProps = async () => ({ props: {} });

const MunicipalityPage = () => {
  const [{ id, category }] = useQueryState();
  console.log({ id });
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
          <Flex sx={{ width: "100%" }}>
            <Box sx={{ flex: `2 2 ${2 / 3}%` }}>
              {/* <PriceComponents /> */}
              {/* <PriceEvolutionLineChart /> */}
              {/* <PriceDistributionHistograms /> */}
              <CantonsComparisonRangePlots id={id} />
            </Box>
            <Box sx={{ flex: `1 1 ${1 / 3}%` }}>
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
