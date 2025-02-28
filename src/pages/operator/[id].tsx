import { t } from "@lingui/macro";
import { Box } from "@mui/material";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";
import Head from "next/head";
import { useRouter } from "next/router";
import basicAuthMiddleware from "nextjs-basic-auth-middleware";

import { DetailPageBanner } from "src/components/detail-page/banner";
import { CantonsComparisonRangePlots } from "src/components/detail-page/cantons-comparison-range";
import { DetailPageLayout } from "src/components/detail-page/layout";
import { PriceComponentsBarChart } from "src/components/detail-page/price-components-bars";
import { PriceDistributionHistograms } from "src/components/detail-page/price-distribution-histogram";
import { PriceEvolution } from "src/components/detail-page/price-evolution-line-chart";
import { SelectorMulti } from "src/components/detail-page/selector-multi";
import { Footer } from "src/components/footer";
import { Header } from "src/components/header";
import { OperatorDocuments } from "src/components/operator-documents";
import {
  getDimensionValuesAndLabels,
  getObservationsCube,
  getOperator,
} from "src/rdf/queries";

type Props =
  | {
      status: "found";
      id: string;
      name: string;
      municipalities: { id: string; name: string }[];
    }
  | { status: "notfound" };
export const getServerSideProps: GetServerSideProps<
  Props,
  { id: string }
> = async ({ params, req, res, locale }) => {
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
  const { query } = useRouter();
  if (props.status === "notfound") {
    return <ErrorPage statusCode={404} />;
  }

  const { id, name, municipalities } = props;
  return (
    <>
      <Head>
        <title>{`${t({ id: "detail.operator" })} ${name} – ${t({
          id: "site.title",
        })}`}</title>
      </Head>
      <Box sx={{ minHeight: "100vh", flexDirection: "column" }} display="flex">
        {!query.download && <Header></Header>}
        <Box
          sx={{
            pt: ["107px", "96px"],
            flexGrow: 1,
            bgcolor: "grey.200",
            flexDirection: "column",
          }}
          display="flex"
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
        </Box>
        <Footer />
      </Box>
    </>
  );
};

export default OperatorPage;
