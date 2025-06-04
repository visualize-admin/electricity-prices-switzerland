import { t, Trans } from "@lingui/macro";
import { GetServerSideProps } from "next";
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
  handleCantonEntity,
  handleMunicipalityEntity,
  handleOperatorsEntity,
  PageParams,
  Props,
} from "src/data/shared-page-props";
import { priceComponents } from "src/domain/data";
import { getLocalizedLabel } from "src/domain/translation";
import { defaultLocale } from "src/locales/config";

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
        priceComponents={priceComponents}
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
    />
  );
};

export default ElectricityTariffsPage;
