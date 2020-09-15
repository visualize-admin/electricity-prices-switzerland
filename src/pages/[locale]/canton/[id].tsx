import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Box, Flex } from "theme-ui";
import { DetailPageBanner } from "../../../components/detail-page/banner";
import { CantonsComparisonRangePlots } from "../../../components/detail-page/cantons-comparison-range";
import { DetailPageLayout } from "../../../components/detail-page/layout";
import { PriceComponentsBarChart } from "../../../components/detail-page/price-components-bars";
import { PriceDistributionHistograms } from "../../../components/detail-page/price-distribution-histogram";
import { PriceEvolution } from "../../../components/detail-page/price-evolution-line-chart";
import { SelectorMulti } from "../../../components/detail-page/selector-multi";
import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";
import { getSource, search } from "../../../graphql/rdf";
import { useI18n } from "../../../components/i18n-context";
import Head from "next/head";

type Props = {
  id: string;
  name: string;
  // operators: { id: string; name: string }[];
};

export const getServerSideProps: GetServerSideProps<
  Props,
  { locale: string; id: string }
> = async ({ params, res }) => {
  const { id, locale } = params!;

  const canton = (
    await search({
      source: getSource(),
      locale,
      query: "",
      types: ["canton"],
      ids: [id],
    })
  )[0];

  if (!canton) {
    res.statusCode = 404;
  }

  return { props: { id, name: canton.name } };
};

const CantonPage = ({ id, name }: Props) => {
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
