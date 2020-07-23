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
import {
  getSource,
  getView,
  getDimensionValuesAndLabels,
  getMunicipalities,
} from "../../../graphql/rdf";

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
    "https://energy.ld.admin.ch/elcom/energy-pricing/cube"
  );

  if (!cube) {
    throw Error(
      `No cube ${"https://energy.ld.admin.ch/elcom/energy-pricing/cube"}`
    );
  }

  const view = getView(cube);

  const provider = (
    await getDimensionValuesAndLabels({
      view,
      source,
      dimensionKey: "provider",
      filters: { provider: [id] },
    })
  )[0];

  const municipalities = await getMunicipalities({
    view,
    source,
    filters: { provider: [id] },
  });

  return {
    props: {
      id,
      name: provider.name,
      municipalities: municipalities.map(({ id, name }) => ({ id, name })),
    },
  };
};

const ProviderPage = ({ id, name, municipalities }: Props) => {
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
        <DetailPageBanner id={id} name={name} municipalities={municipalities} />

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
