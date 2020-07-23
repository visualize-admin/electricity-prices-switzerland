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
import { PriceEvolution } from "../../../components/detail-page/price-evolution-line-chart";
import { PriceComponentsBarChart } from "../../../components/detail-page/price-components-bars";
import { useQueryState } from "../../../lib/use-query-state";
import { GetServerSideProps } from "next";

export const EMPTY_ARRAY: never[] = [];

type Props = { id: string };

// FIXME: Should we get the is from the query instead?
export const getServerSideProps: GetServerSideProps<Props, Props> = async ({
  params,
}) => {
  const { id } = params!;
  return { props: { id } };
};

const MunicipalityPage = ({ id }: Props) => {
  const [{ category }] = useQueryState();
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
              <PriceComponentsBarChart id={id} entity="municipality" />
              {/* <PriceComponentsBarChart id={"10219012345"} entity="provider" /> */}
              {/* <PriceEvolution id={id} entity="municipality" />
              <PriceDistributionHistograms id={id} entity="municipality" />
              <CantonsComparisonRangePlots id={id} entity="municipality" /> */}
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
