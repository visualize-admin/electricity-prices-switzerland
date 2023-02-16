import { useTranslation } from "react-i18next";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";
import Head from "next/head";
import { useRouter } from "next/router";
import basicAuthMiddleware from "nextjs-basic-auth-middleware";
import { Box, Flex } from "theme-ui";
import { DetailPageBanner } from "../../components/detail-page/banner";
import { CantonsComparisonRangePlots } from "../../components/detail-page/cantons-comparison-range";
import { DetailPageLayout } from "../../components/detail-page/layout";
import { PriceComponentsBarChart } from "../../components/detail-page/price-components-bars";
import { PriceDistributionHistograms } from "../../components/detail-page/price-distribution-histogram";
import { PriceEvolution } from "../../components/detail-page/price-evolution-line-chart";
import { SelectorMulti } from "../../components/detail-page/selector-multi";
import { Footer } from "../../components/footer";
import { Header } from "../../components/header";
import { getCanton } from "../../rdf/queries";

type Props =
  | {
      status: "found";
      id: string;
      name: string;
      // operators: { id: string; name: string }[];
    }
  | { status: "notfound" };
export const getServerSideProps: GetServerSideProps<
  Props,
  { locale: string; id: string }
> = async ({ params, req, res, locale }) => {
  await basicAuthMiddleware(req, res);

  const { id } = params!;

  const canton = await getCanton({ id, locale: locale! });

  if (!canton) {
    res.statusCode = 404;
    return { props: { status: "notfound" } };
  }

  return { props: { status: "found", id, name: canton.name } };
};

const CantonPage = (props: Props) => {
  const { t } = useTranslation();
  const { query } = useRouter();

  if (props.status === "notfound") {
    return <ErrorPage statusCode={404} />;
  }

  const { id, name } = props;
  return (
    <>
      <Head>
        <title>{`${t("detail.canton")} ${name} – ${t("site.title")}`}</title>
      </Head>
      <Flex sx={{ minHeight: "100vh", flexDirection: "column" }}>
        {!query.download && <Header></Header>}
        <Box
          sx={{
            pt: [107, 96],
            flexGrow: 1,
            bg: "monochrome200",
          }}
        >
          <DetailPageBanner id={id} name={name} entity="canton" />

          {query.download ? (
            <DetailPageLayout
              main={
                <>
                  {query.download === "components" && (
                    <PriceComponentsBarChart id={id} entity="canton" />
                  )}
                  {query.download === "evolution" && (
                    <PriceEvolution id={id} entity="canton" />
                  )}
                  {query.download === "distribution" && (
                    <PriceDistributionHistograms id={id} entity="canton" />
                  )}
                  {query.download === "comparison" && (
                    <CantonsComparisonRangePlots id={id} entity="canton" />
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
                  <PriceComponentsBarChart id={id} entity="canton" />
                  <PriceEvolution id={id} entity="canton" />
                  <PriceDistributionHistograms id={id} entity="canton" />
                  <CantonsComparisonRangePlots id={id} entity="canton" />
                </>
              }
              selector={<SelectorMulti entity="canton" />}
              aside={null}
            />
          )}
        </Box>
        <Footer />
      </Flex>
    </>
  );
};

export default CantonPage;
