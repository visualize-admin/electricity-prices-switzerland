import { t, Trans } from "@lingui/macro";
import ErrorPage from "next/error";
import { useRouter } from "next/router";

import { DetailPageBanner } from "src/components/detail-page/banner";
import { CantonsComparisonRangePlots } from "src/components/detail-page/cantons-comparison-range";
import {
  DetailsPageHeader,
  DetailsPageLayout,
  DetailsPageSubtitle,
  DetailsPageTitle,
} from "src/components/detail-page/layout";
import { PriceComponentsBarChart } from "src/components/detail-page/price-components-bars";
import { PriceDistributionHistograms } from "src/components/detail-page/price-distribution-histogram";
import { PriceEvolutionCard } from "src/components/detail-page/price-evolution-line-chart";
import { SelectorMulti } from "src/components/detail-page/selector-multi";
import { DetailsPageSidebar } from "src/components/detail-page/sidebar";
import {
  getCantonPageProps,
  getMunicipalityPageProps,
  PageParams,
  Props,
} from "src/data/shared-page-props";
import { detailsPriceComponents } from "src/domain/data";
import { getLocalizedLabel } from "src/domain/translation";
import { runtimeEnv } from "src/env/runtime";
import {
  OperatorPagePropsDocument,
  OperatorPagePropsQuery,
} from "src/graphql/queries";
import { defaultLocale } from "src/locales/config";
import createGetServerSideProps from "src/utils/create-server-side-props";

export const getServerSideProps = createGetServerSideProps<
  Props,
  Omit<PageParams, "req">
>(async (context, { sparqlClient, urqlClient }) => {
  const { params, res, locale, req } = context;
  const { id, entity } = params!;
  const query = new URL(req.url!, `http://${req.headers.host}`).searchParams;
  const periodQueryParam = query.getAll("period");
  const period =
    periodQueryParam
      .flatMap((x) => x.split(",").map((y) => y.trim()))
      .filter((x) => x) ?? [];

  let props: Props;

  switch (entity) {
    case "canton":
      props = await getCantonPageProps(sparqlClient, {
        id,
        locale: locale ?? defaultLocale,
        res,
      });

      break;
    case "municipality":
      props = await getMunicipalityPageProps(sparqlClient, {
        id,
        locale: locale ?? defaultLocale,
        // get years out of the query string from the request
        years: period.length > 0 ? period : [runtimeEnv.CURRENT_PERIOD],
        res,
      });

      break;
    case "operator": {
      const { data, error } = await urqlClient
        .query<OperatorPagePropsQuery>(OperatorPagePropsDocument, {
          locale: locale ?? defaultLocale,
          id,
        })
        .toPromise();

      if (error || !data?.operator) {
        res.statusCode = 404;
        props = { status: "notfound" };
      } else {
        props = {
          entity: "operator" as const,
          status: "found" as const,
          id: data.operator.id ?? id,
          name: data.operator.name,
          municipalities: data.operator.municipalities,
        };
      }

      break;
    }
    default:
      props = { status: "notfound" };
      break;
  }

  return {
    props,
  };
});

// Main page using the generic component
const ElectricityTariffsPage = (props: Props) => {
  const { query } = useRouter();

  if (props.status === "notfound") {
    return <ErrorPage statusCode={404} />;
  }

  const { id, name, entity } = props;

  const pageTitle = `${getLocalizedLabel({ id: entity })} ${name} – ${t({
    id: "site.title",
    message: "Electricity tariffs in Switzerland",
  })}`;

  const bannerContent = (
    <DetailPageBanner
      id={id}
      name={name}
      operators={entity === "municipality" ? props.operators : undefined}
      municipalities={entity === "operator" ? props.municipalities : undefined}
      entity={entity}
    />
  );

  const sidebarContent = <DetailsPageSidebar id={id} entity={entity} />;

  const mainContent = (
    <>
      <DetailsPageHeader>
        <DetailsPageTitle>
          <Trans id="page.electricity-tariffs.title">Electricity tariffs</Trans>
        </DetailsPageTitle>
        <DetailsPageSubtitle>
          <Trans id="page.electricity-tariffs.description">
            On the grid operator's details page, you will find up-to-date
            information on electricity tariffs, allowing you to compare prices.
            You can view the breakdown of energy, grid and additional costs and
            call up historical trends to gain a better understanding of
            electricity costs.
          </Trans>
        </DetailsPageSubtitle>
      </DetailsPageHeader>

      <SelectorMulti entity={entity} />

      <PriceComponentsBarChart id={id} entity={entity} />
      <PriceEvolutionCard
        // We hide meteringrate for now as there is only 1 value
        // To revisit later
        priceComponents={detailsPriceComponents.filter(
          (x) => x !== "meteringrate"
        )}
        id={id}
        entity={entity}
      />
      <PriceDistributionHistograms id={id} entity={entity} />
      <CantonsComparisonRangePlots id={id} entity={entity} />
    </>
  );

  return (
    <DetailsPageLayout
      title={pageTitle}
      BannerContent={bannerContent}
      SidebarContent={sidebarContent}
      MainContent={mainContent}
      download={query.download}
      entity={entity}
      id={id}
    />
  );
};

export default ElectricityTariffsPage;
