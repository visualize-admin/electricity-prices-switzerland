import { Trans, t } from "@lingui/macro";
import ErrorPage from "next/error";
import { useRouter } from "next/router";
import React, { useCallback } from "react";

import { Combobox, ComboboxItem, MultiCombobox } from "src/components/combobox";
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
import { DetailsPageSidebar } from "src/components/detail-page/sidebar";
import {
  CantonsCombobox,
  MunicipalitiesCombobox,
  OperatorsCombobox,
} from "src/components/query-combobox";
import {
  ElectricityPricesDetailTab,
  ElectricityPricesNavigation,
} from "src/components/sunshine-tabs";
import {
  getCantonPageProps,
  getMunicipalityPageProps,
  PageParams,
  Props,
} from "src/data/shared-page-props";
import {
  categories,
  ElectricityCategory,
  periods,
  products,
} from "src/domain/data";
import { useQueryStateEnergyPricesDetails } from "src/domain/query-states";
import { getLocalizedLabel, TranslationKey } from "src/domain/translation";
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
>(async (context, { sparqlClient, executeGraphqlQuery }) => {
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
      const data = await executeGraphqlQuery<OperatorPagePropsQuery>(
        OperatorPagePropsDocument,
        {
          locale: locale ?? defaultLocale,
          id,
        },
      );

      if (!data.operator) {
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
  const [queryState, setQueryState] = useQueryStateEnergyPricesDetails();
  const getItemLabel = (id: TranslationKey) => getLocalizedLabel({ id });

  const activeTab = queryState.tab satisfies ElectricityPricesDetailTab;

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: ElectricityPricesDetailTab) => {
      const currentPc = queryState.priceComponent[0];
      const priceComponentReset =
        (newValue === "tariffsDevelopment" && currentPc === "meteringrate") ||
        (newValue !== "tariffsDevelopment" && currentPc === "aidfee");
      setQueryState({
        tab: newValue,
        ...(priceComponentReset && { priceComponent: ["total"] }),
      });
    },
    [setQueryState, queryState.priceComponent],
  );

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

  const yearDisabled = activeTab === "tariffsDevelopment";

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

      <ElectricityPricesNavigation
        activeTab={activeTab}
        handleTabChange={handleTabChange}
      />

      <div
        data-testid="detail-page-selector-multi"
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        }}
      >
        {entity === "operator" ? (
          <OperatorsCombobox
            label={
              <Trans id="selector.compareoperators">
                Network operator for comparison
              </Trans>
            }
            selectedItems={queryState.operator ?? []}
            setSelectedItems={(items) => setQueryState({ operator: items })}
          />
        ) : entity === "municipality" ? (
          <MunicipalitiesCombobox
            label={
              <Trans id="selector.comparemunicipalities">
                Municipalities for comparison
              </Trans>
            }
            selectedItems={queryState.municipality ?? []}
            setSelectedItems={(items) => setQueryState({ municipality: items })}
          />
        ) : (
          <CantonsCombobox
            label={<Trans id="selector.comparecantons">Compare with</Trans>}
            selectedItems={queryState.canton ?? []}
            setSelectedItems={(items) => setQueryState({ canton: items })}
          />
        )}
        <MultiCombobox
          id="periods"
          label={<Trans id="selector.years">Years</Trans>}
          items={periods}
          selectedItems={queryState.period}
          minSelectedItems={1}
          disabled={yearDisabled}
          setSelectedItems={(items) => {
            setQueryState({ period: items }, { shallow: false });
          }}
        />
        <Combobox
          id="categories"
          label={t({ id: "selector.category", message: "Category" })}
          items={categories.map(
            (value): ComboboxItem<ElectricityCategory> => ({
              value,
              group: value.startsWith("H")
                ? getItemLabel("H-group")
                : getItemLabel("C-group"),
            }),
          )}
          getItemLabel={(x) => getItemLabel(`${x}-long`)}
          selectedItem={queryState.category[0]}
          setSelectedItem={(selectedItem) =>
            setQueryState({ category: [selectedItem] })
          }
          infoDialogSlug="help-categories"
        />
        <Combobox
          id="products"
          label={t({ id: "selector.product", message: "Product" })}
          items={products}
          getItemLabel={getItemLabel}
          selectedItem={queryState.product[0]}
          setSelectedItem={(selectedItem) =>
            setQueryState({ product: [selectedItem] })
          }
          infoDialogSlug="help-products"
        />
      </div>

      {activeTab === "priceComponents" && (
        <PriceComponentsBarChart id={id} entity={entity} />
      )}
      {activeTab === "tariffsDevelopment" && (
        <PriceEvolutionCard id={id} entity={entity} />
      )}
      {activeTab === "priceDistribution" && (
        <PriceDistributionHistograms id={id} entity={entity} />
      )}
      {activeTab === "cantonComparison" && (
        <CantonsComparisonRangePlots id={id} entity={entity} />
      )}
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
