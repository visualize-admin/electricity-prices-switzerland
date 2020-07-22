import { Box, Flex } from "@theme-ui/components";
import { useRouter } from "next/router";
import * as React from "react";
import { DetailPageBanner } from "../../../components/detail-page/banner";
import {
  CantonsComparisonRangePlot,
  CantonsComparisonRangePlots,
} from "../../../components/detail-page/cantons-comparison-range";
import { SelectorMulti } from "../../../components/detail-page/selector-multi";
import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";
import { createDynamicRouteProps } from "../../../components/links";
import {
  PriceComponent,
  useMunicipalitiesQuery,
} from "../../../graphql/queries";
import { useLocale } from "../../../lib/use-locale";
import { PriceDistributionHistogram } from "../../../components/detail-page/price-distribution-histogram";
import { PriceEvolutionLineChart } from "../../../components/detail-page/price-evolution-line-chart";
import { PriceComponents } from "../../../components/detail-page/price-components";

export const EMPTY_ARRAY: never[] = [];

// Prevent router.query from being undefined on first render!
export const getServerSideProps = async () => ({ props: {} });

const MunicipalityPage = () => {
  const locale = useLocale();
  const { query, replace } = useRouter();

  // FIXME: use query
  const kantonId = "261";
  const providerIds = ["xxx", "yyy"];

  const municipalityId = query.id;

  const updateQueryParams = (queryObject: { [x: string]: string }) => {
    const { href, as } = createDynamicRouteProps({
      pathname: `/[locale]/municipality/${municipalityId}`,
      query: { ...query, ...queryObject },
    });
    replace(href, as);
  };

  const year = query.year ? (query.year as string).split(",") : ["2019"];
  const priceComponent =
    (query.priceComponent as PriceComponent) ?? PriceComponent.Total; // TODO: parameterize priceComponent
  const category = query.category as string;

  const [municipality] = useMunicipalitiesQuery({
    variables: {
      locale,
      query: "",
    },
  });
  if (!municipality.fetching) {
    console.log(municipality);
  }
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
          entity={municipalityId as string}
          kanton={"kanton"}
          linkedIds={["xxx", "yyy"]}
        />

        <Box sx={{ width: "100%", maxWidth: "67rem", mx: "auto", my: 2 }}>
          <Flex sx={{ width: "100%" }}>
            <Box sx={{ flex: `2 2 ${2 / 3}%` }}>
              {/* <PriceComponents /> */}
              {/* <PriceEvolutionLineChart /> */}
              {/* <PriceDistributionHistogram period={year as string[]} /> */}
              <CantonsComparisonRangePlots />
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
