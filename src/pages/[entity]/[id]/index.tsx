import { IncomingMessage, ServerResponse } from "http";

import { t, Trans } from "@lingui/macro";
import { Box } from "@mui/material";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import ErrorPage from "next/error";
import Head from "next/head";
import { useRouter } from "next/router";

const ContentWrapper = dynamic(
  () =>
    import("@interactivethings/swiss-federal-ci/dist/components").then(
      (mod) => mod.ContentWrapper
    ),
  { ssr: false }
);

import { DetailPageBanner } from "src/components/detail-page/banner";
import { CantonsComparisonRangePlots } from "src/components/detail-page/cantons-comparison-range";
import {
  DetailPageLayout,
  DetailsPageHeader,
  DetailsPageSubtitle,
  DetailsPageTitle,
} from "src/components/detail-page/layout";
import { PriceComponentsBarChart } from "src/components/detail-page/price-components-bars";
import { PriceDistributionHistograms } from "src/components/detail-page/price-distribution-histogram";
import { PriceEvolutionCard } from "src/components/detail-page/price-evolution-line-chart";
import { SelectorMulti } from "src/components/detail-page/selector-multi";
import { DetailsPageSidebar } from "src/components/detail-page/sidebar";
import { Entity, priceComponents } from "src/domain/data";
import { getLocalizedLabel } from "src/domain/translation";
import { useIsMobile } from "src/lib/use-mobile";
import { defaultLocale } from "src/locales/locales";
import {
  getCanton,
  getDimensionValuesAndLabels,
  getMunicipality,
  getObservationsCube,
  getOperator,
} from "src/rdf/queries";

const ApplicationLayout = dynamic(
  () =>
    import("src/components/app-layout").then((mod) => mod.ApplicationLayout),
  { ssr: false }
);

type Props =
  | {
      entity: "canton";
      status: "found";
      id: string;
      name: string;
    }
  | {
      entity: "municipality";
      status: "found";
      id: string;
      name: string;
      operators: { id: string; name: string }[];
      locale: string;
    }
  | {
      entity: "operator";
      status: "found";
      id: string;
      name: string;
      municipalities: { id: string; name: string }[];
    }
  | {
      status: "notfound";
    };

type PageParams = { locale: string; id: string; entity: Entity };

export const getServerSideProps: GetServerSideProps<
  Props,
  PageParams
> = async ({ params, res, locale }) => {
  const { id, entity } = params!;

  let props: Props;

  switch (entity) {
    case "canton":
      props = await handleCantonEntity({
        id,
        locale: locale ?? defaultLocale,
        res,
      });

      break;
    case "municipality":
      props = await handleMunicipalityEntity({
        id,
        locale: locale ?? defaultLocale,
        res,
      });

      break;
    case "operator":
      props = await handleOperatorsEntity({
        id,
        locale: locale ?? defaultLocale,
        res,
      });

      break;
    default:
      props = { status: "notfound" };
      break;
  }

  return {
    props,
  };
};

const handleCantonEntity = async (
  params: Omit<PageParams, "entity"> & { res: ServerResponse<IncomingMessage> }
): Promise<Props> => {
  const { id, locale, res } = params!;
  const canton = await getCanton({ id, locale: locale! });

  if (!canton) {
    res.statusCode = 404;
    return { status: "notfound" };
  }

  return { status: "found", id, name: canton.name, entity: "canton" };
};

const handleMunicipalityEntity = async (
  params: Omit<PageParams, "entity"> & { res: ServerResponse<IncomingMessage> }
): Promise<Props> => {
  const { id, locale, res } = params!;
  const municipality = await getMunicipality({ id });

  if (!municipality) {
    res.statusCode = 404;
    return { status: "notfound" };
  }

  const cube = await getObservationsCube();

  const operators = await getDimensionValuesAndLabels({
    cube,
    dimensionKey: "operator",
    filters: { municipality: [id] },
  });

  return {
    entity: "municipality",
    status: "found",
    id,
    name: municipality.name,
    operators: operators
      .sort((a, b) => a.name.localeCompare(b.name, locale))
      .map(({ id, name }) => ({ id, name })),
    locale: locale ?? defaultLocale,
  };
};

const handleOperatorsEntity = async (
  params: Omit<PageParams, "entity"> & { res: ServerResponse<IncomingMessage> }
): Promise<Props> => {
  const { id, locale, res } = params!;
  const operator = await getOperator({ id });

  if (!operator) {
    res.statusCode = 404;
    return { status: "notfound" };
  }

  const cube = await getObservationsCube();

  const municipalities = await getDimensionValuesAndLabels({
    cube,
    dimensionKey: "municipality",
    filters: { operator: [id] },
  });

  return {
    entity: "operator",
    status: "found",
    id,
    name: operator.name,
    municipalities: municipalities
      .sort((a, b) => a.name.localeCompare(b.name, locale))
      .map(({ id, name }) => ({ id, name })),
  };
};

const ElectricityTariffsPage = (props: Props) => {
  const { query } = useRouter();

  if (props.status === "notfound") {
    return <ErrorPage statusCode={404} />;
  }

  const { id, name, entity } = props;

  const isMobile = useIsMobile();

  return (
    <>
      <Head>
        <title>{`${getLocalizedLabel({ id: entity })} ${name} – ${t({
          id: "site.title",
          message: "Stromtarife und Vorschriften",
        })}`}</title>
      </Head>
      <ApplicationLayout>
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
              operators={
                entity === "municipality" ? props.operators : undefined
              }
              municipalities={
                entity === "operator" ? props.municipalities : undefined
              }
              entity={entity}
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
              <DetailPageLayout
                download={query.download}
                selector={
                  !isMobile ? (
                    <DetailsPageSidebar id={id} entity={entity} />
                  ) : null
                }
              >
                <DetailsPageHeader>
                  <DetailsPageTitle>
                    <Trans id="page.electricity-tariffs.title">
                      Stromtarife
                    </Trans>
                  </DetailsPageTitle>
                  <DetailsPageSubtitle>
                    <Trans id="page.electricity-tariffs.description">
                      Auf der Detailseite des Netzbetreibers finden Sie aktuelle
                      Informationen zu den Stromtarifen, die einen
                      Preisvergleich ermöglichen. Sie können die Aufschlüsselung
                      der Energie-, Netz- und Zusatzkosten einsehen und unter
                      historische Trends abrufen, um ein besseres Verständnis
                      der Stromkosten von zu erhalten.
                    </Trans>
                  </DetailsPageSubtitle>
                </DetailsPageHeader>

                <SelectorMulti entity={entity} />

                <PriceComponentsBarChart id={id} entity={entity} />
                <PriceEvolutionCard
                  priceComponents={priceComponents}
                  id={id}
                  entity={entity}
                />
                <PriceDistributionHistograms id={id} entity={entity} />
                <CantonsComparisonRangePlots id={id} entity={entity} />
              </DetailPageLayout>
            </Box>
          </ContentWrapper>
        </Box>
      </ApplicationLayout>
    </>
  );
};

export default ElectricityTariffsPage;
