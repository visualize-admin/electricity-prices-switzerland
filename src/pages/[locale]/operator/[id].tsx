import { Flex } from "@theme-ui/components";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { DetailPageBanner } from "../../../components/detail-page/banner";
import { CantonsComparisonRangePlots } from "../../../components/detail-page/cantons-comparison-range";
import { DetailPageLayout } from "../../../components/detail-page/layout";
import { PriceComponentsBarChart } from "../../../components/detail-page/price-components-bars";
import { PriceDistributionHistograms } from "../../../components/detail-page/price-distribution-histogram";
import { PriceEvolution } from "../../../components/detail-page/price-evolution-line-chart";
import { SelectorMulti } from "../../../components/detail-page/selector-multi";
import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";
import { OperatorDocuments } from "../../../components/operator-documents";
import {
  getDimensionValuesAndLabels,
  getSource,
  getView,
} from "../../../graphql/rdf";
import { useI18n } from "../../../components/i18n-context";
import Head from "next/head";
import { getHelpCalculationPageFromGitLabWiki } from "../../../domain/gitlab-wiki-api";

type Props = {
  id: string;
  name: string;
  municipalities: { id: string; name: string }[];
  calculationHelpText: string;
};
export const getServerSideProps: GetServerSideProps<
  Props,
  { locale: string; id: string }
> = async ({ params }) => {
  const { id, locale } = params!;

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

  const calculationHelpText = await getHelpCalculationPageFromGitLabWiki({
    locale,
  });
  return {
    props: {
      id,
      name: operator.name,
      municipalities: municipalities.map(({ id, name }) => ({ id, name })),
      calculationHelpText,
    },
  };
};

const OperatorPage = ({
  id,
  name,
  municipalities,
  calculationHelpText,
}: Props) => {
  const i18n = useI18n();
  const { query } = useRouter();

  return (
    <>
      <Head>
        <title>{`${i18n._("detail.operator")} ${name} – ${i18n._(
          "site.title"
        )}`}</title>
      </Head>
      <Flex sx={{ minHeight: "100vh", flexDirection: "column" }}>
        {!query.download && <Header></Header>}
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

          {query.download ? (
            <DetailPageLayout
              main={
                <>
                  {query.download === "components" && (
                    <PriceComponentsBarChart id={id} entity="operator" />
                  )}
                  {query.download === "evolution" && (
                    <PriceEvolution id={id} entity="operator" />
                  )}
                  {query.download === "distribution" && (
                    <PriceDistributionHistograms id={id} entity="operator" />
                  )}
                  {query.download === "comparison" && (
                    <CantonsComparisonRangePlots id={id} entity="operator" />
                  )}
                </>
              }
              selector={null}
              aside={null}
            />
          ) : (
            <DetailPageLayout
              main={
                <>
                  <PriceComponentsBarChart id={id} entity="operator" />
                  <PriceEvolution id={id} entity="operator" />
                  <PriceDistributionHistograms id={id} entity="operator" />
                  <CantonsComparisonRangePlots id={id} entity="operator" />
                </>
              }
              selector={<SelectorMulti entity="operator" />}
              aside={<OperatorDocuments id={id} />}
            />
          )}
        </Flex>
        <Footer calculationHelpText={calculationHelpText}></Footer>
      </Flex>
    </>
  );
};

export default OperatorPage;
