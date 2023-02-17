import { useTranslation } from "next-i18next";
import { Flex } from "@theme-ui/components";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";
import Head from "next/head";
import { useRouter } from "next/router";
import basicAuthMiddleware from "nextjs-basic-auth-middleware";
import { DetailPageBanner } from "../../components/detail-page/banner";
import { CantonsComparisonRangePlots } from "../../components/detail-page/cantons-comparison-range";
import { DetailPageLayout } from "../../components/detail-page/layout";
import { PriceComponentsBarChart } from "../../components/detail-page/price-components-bars";
import { PriceDistributionHistograms } from "../../components/detail-page/price-distribution-histogram";
import { PriceEvolution } from "../../components/detail-page/price-evolution-line-chart";
import { SelectorMulti } from "../../components/detail-page/selector-multi";
import { Footer } from "../../components/footer";
import { Header } from "../../components/header";
import { OperatorDocuments } from "../../components/operator-documents";
import {
  getDimensionValuesAndLabels,
  getObservationsCube,
  getOperator,
} from "../../rdf/queries";

type Props =
  | {
      status: "found";
      id: string;
      name: string;
      municipalities: { id: string; name: string }[];
    }
  | { status: "notfound" };
export const getServerSideProps: GetServerSideProps<Props, { id: string }> =
  async ({ params, req, res, locale }) => {
    await basicAuthMiddleware(req, res);

    const { id } = params!;

    const operator = await getOperator({ id });

    if (!operator) {
      res.statusCode = 404;
      return { props: { status: "notfound" } };
    }

    const cube = await getObservationsCube();

    const municipalities = await getDimensionValuesAndLabels({
      cube,
      dimensionKey: "municipality",
      filters: { operator: [id] },
    });

    return {
      props: {
        status: "found",
        id,
        name: operator.name,
        municipalities: municipalities
          .sort((a, b) => a.name.localeCompare(b.name, locale))
          .map(({ id, name }) => ({ id, name })),
      },
    };
  };

const OperatorPage = (props: Props) => {
  const { t } = useTranslation();
  const { query } = useRouter();
  if (props.status === "notfound") {
    return <ErrorPage statusCode={404} />;
  }

  const { id, name, municipalities } = props;
  return (
    <>
      <Head>
        <title>{`${t("detail.operator")} ${name} – ${t("site.title")}`}</title>
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
        <Footer />
      </Flex>
    </>
  );
};

export default OperatorPage;
