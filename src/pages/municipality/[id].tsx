import { ContentWrapper } from "@interactivethings/swiss-federal-ci/dist/components";
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
import { defaultLocale } from "src/locales/locales";
import {
  getDimensionValuesAndLabels,
  getMunicipality,
  getObservationsCube,
} from "src/rdf/queries";

import { ApplicationLayout } from "../app-layout";

type Props =
  | {
      status: "found";
      id: string;
      name: string;
      operators: { id: string; name: string }[];
      locale: string;
    }
  | {
      status: "notfound";
      locale: string;
    };

export const getServerSideProps: GetServerSideProps<
  Props,
  { id: string }
> = async ({ params, req, res, locale }) => {
  await basicAuthMiddleware(req, res);

  const { id } = params!;

  const municipality = await getMunicipality({ id });

  if (!municipality) {
    res.statusCode = 404;
    return { props: { status: "notfound", locale: locale ?? defaultLocale } };
  }

  const cube = await getObservationsCube();

  const operators = await getDimensionValuesAndLabels({
    cube,
    dimensionKey: "operator",
    filters: { municipality: [id] },
  });

  return {
    props: {
      status: "found",
      id,
      name: municipality.name,
      operators: operators
        .sort((a, b) => a.name.localeCompare(b.name, locale))
        .map(({ id, name }) => ({ id, name })),
      locale: locale ?? defaultLocale,
    },
  };
};

const MunicipalityPage = (props: Props) => {
  const { query } = useRouter();

  if (props.status === "notfound") {
    return <ErrorPage statusCode={404} />;
  }

  const { id, name, operators, locale } = props;

  return (
    <>
      <Head>
        <title>{`${t({ id: "detail.municipality" })} ${name} – ${t({
          id: "site.title",
        })}`}</title>
      </Head>
      <ApplicationLayout locale={locale}>
        <Box
          sx={{
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
            borderBottomColor: "monochrome.300",
          }}
        >
          <ContentWrapper
            sx={{
              flexGrow: 1,
              backgroundColor: "background.paper",
            }}
          >
            <DetailPageBanner
              id={id}
              name={name}
              operators={operators}
              entity="municipality"
            />
          </ContentWrapper>
        </Box>
        <Box
          sx={{
            backgroundColor: "secondary.50",
          }}
        >
          <ContentWrapper
            sx={{
              backgroundColor: "secondary.50",
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                bgcolor: "background.paper",
              }}
            >
              {query.download ? (
                <DetailPageLayout
                  selector={null}
                  main={
                    <>
                      {query.download === "components" && (
                        <PriceComponentsBarChart
                          id={id}
                          entity="municipality"
                        />
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
                  aside={null}
                />
              ) : (
                <DetailPageLayout
                  selector={null}
                  main={
                    <>
                      <SelectorMulti entity="municipality" />

                      <PriceComponentsBarChart id={id} entity="municipality" />
                      <PriceEvolution id={id} entity="municipality" />
                      <PriceDistributionHistograms
                        id={id}
                        entity="municipality"
                      />
                      <CantonsComparisonRangePlots
                        id={id}
                        entity="municipality"
                      />
                    </>
                  }
                  aside={null}
                />
              )}
            </Box>
          </ContentWrapper>
        </Box>
      </ApplicationLayout>
    </>
  );
};

export default MunicipalityPage;
