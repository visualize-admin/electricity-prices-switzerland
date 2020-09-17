import { Box, Flex } from "@theme-ui/components";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";
import Head from "next/head";
import { useRouter } from "next/router";
import * as React from "react";
import { DetailPageBanner } from "../../../components/detail-page/banner";
import { CantonsComparisonRangePlots } from "../../../components/detail-page/cantons-comparison-range";
import { DetailPageLayout } from "../../../components/detail-page/layout";
import { PriceComponentsBarChart } from "../../../components/detail-page/price-components-bars";
import { PriceDistributionHistograms } from "../../../components/detail-page/price-distribution-histogram";
import { PriceEvolution } from "../../../components/detail-page/price-evolution-line-chart";
import { SelectorMulti } from "../../../components/detail-page/selector-multi";
import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";
import { useI18n } from "../../../components/i18n-context";
import {
  getDimensionValuesAndLabels,
  getMunicipality,
  getSource,
  getView,
} from "../../../graphql/rdf";

type Props =
  | {
      status: "found";
      id: string;
      name: string;
      operators: { id: string; name: string }[];
    }
  | { status: "notfound" };

export const getServerSideProps: GetServerSideProps<
  Props,
  { locale: string; id: string }
> = async ({ params, res }) => {
  const { id, locale } = params!;

  console.time("Muni");

  const source = getSource();

  const municipality = await getMunicipality({ id, source });

  if (!municipality) {
    res.statusCode = 404;
    return { props: { status: "notfound" } };
  }

  const cube = await source.cube(
    "https://energy.ld.admin.ch/elcom/electricity-price/cube"
  );

  if (!cube) {
    throw Error(
      `No cube ${"https://energy.ld.admin.ch/elcom/electricity-price/cube"}`
    );
  }

  const view = getView(cube);

  const operators = await getDimensionValuesAndLabels({
    view,
    source,
    dimensionKey: "operator",
    filters: { municipality: [id] },
  });

  console.timeEnd("Muni");

  return {
    props: {
      status: "found",
      id,
      name: municipality.name,
      operators: operators
        .sort((a, b) => a.name.localeCompare(b.name, locale))
        .map(({ id, name }) => ({ id, name })),
    },
  };
};

const MunicipalityPage = (props: Props) => {
  const i18n = useI18n();
  const { query } = useRouter();

  if (props.status === "notfound") {
    return <ErrorPage statusCode={404} />;
  }

  const { id, name, operators } = props;

  return (
    <>
      <Head>
        <title>{`${i18n._("detail.municipality")} ${name} – ${i18n._(
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
          <DetailPageBanner
            id={id}
            name={name}
            operators={operators}
            entity="municipality"
          />

          {query.download ? (
            <DetailPageLayout
              main={
                <>
                  {query.download === "components" && (
                    <PriceComponentsBarChart id={id} entity="municipality" />
                  )}
                  {query.download === "evolution" && (
                    <PriceEvolution id={id} entity="municipality" />
                  )}
                  {query.download === "distribution" && (
                    <PriceDistributionHistograms
                      id={id}
                      entity="municipality"
                    />
                  )}
                  {query.download === "comparison" && (
                    <CantonsComparisonRangePlots
                      id={id}
                      entity="municipality"
                    />
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
                  <PriceComponentsBarChart id={id} entity="municipality" />
                  <PriceEvolution id={id} entity="municipality" />
                  <PriceDistributionHistograms id={id} entity="municipality" />
                  <CantonsComparisonRangePlots id={id} entity="municipality" />
                </>
              }
              selector={<SelectorMulti entity="municipality" />}
              aside={null}
            />
          )}
        </Box>
        <Footer />
      </Flex>
    </>
  );
};

export default MunicipalityPage;
