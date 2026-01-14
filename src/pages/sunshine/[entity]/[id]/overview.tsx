import { t, Trans } from "@lingui/macro";
import { Box, IconButton, useTheme } from "@mui/material";
import ErrorPage from "next/error";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";

import CardGrid, { CardGridSectionTitle } from "src/components/card-grid";
import { Combobox, ComboboxItem } from "src/components/combobox";
import { DetailPageBanner } from "src/components/detail-page/banner";
import {
  DetailsPageHeader,
  DetailsPageLayout,
  DetailsPageSubtitle,
  DetailsPageTitle,
} from "src/components/detail-page/layout";
import { DetailsPageSidebar } from "src/components/detail-page/sidebar";
import { LoadingSkeleton } from "src/components/hint";
import { SafeHydration } from "src/components/hydration";
import { getInfoDialogProps } from "src/components/info-dialog-props";
import { NetworkCostsTrendCardMinified } from "src/components/network-costs-trend-card";
import { NoDataAvailable } from "src/components/no-data-available";
import { OverviewCard } from "src/components/overview-card";
import { getPowerStabilityCardState } from "src/components/power-stability-card";
import { PowerStabilityChart } from "src/components/power-stability-chart";
import { SessionConfigDebug } from "src/components/session-config-debug";
import { YearlyNavigation } from "src/components/sunshine-tabs";
import TableComparisonCard from "src/components/table-comparison-card";
import { TariffsTrendCardMinified } from "src/components/tariffs-trend-card";
import {
  SessionConfigDebugProps,
  getOperatorsPageProps,
  PageParams,
  Props as SharedPageProps,
} from "src/data/shared-page-props";
import { ElectricityCategory } from "src/domain/data";
import {
  sunshineDetailsLink,
  useQueryStatePowerStabilityCardFilters,
  useQueryStateSunshineOverviewFilters,
} from "src/domain/query-states";
import {
  NetworkLevel,
  sunshineCategories,
  CostsAndTariffsData,
  PowerStabilityData,
} from "src/domain/sunshine";
import { getLocalizedLabel, TranslationKey } from "src/domain/translation";
import { runtimeEnv } from "src/env/runtime";
import {
  CostsAndTariffsDocument,
  CostsAndTariffsQuery,
  EnergyTariffsQuery,
  NetTariffsQuery,
  NetworkCostsQuery,
  OperationalStandardsDocument,
  OperationalStandardsQuery,
  PowerStabilityDocument,
  PowerStabilityQuery,
  useEnergyTariffsQuery,
  useNetTariffsQuery,
  useNetworkCostsQuery,
  useOperationalStandardsQuery,
} from "src/graphql/queries";
import { OperationalStandardsData } from "src/graphql/resolver-types";
import { Icon } from "src/icons";
import { defaultLocale } from "src/locales/config";
import createGetServerSideProps from "src/utils/create-server-side-props";
import { makePageTitle } from "src/utils/page-title";

import {
  prepComplianceCardProps,
  prepServiceQualityCardProps,
} from "./operational-standards";

type Props =
  | (Extract<SharedPageProps, { entity: "operator"; status: "found" }> & {
      costsAndTariffs: CostsAndTariffsData;
      powerStability: PowerStabilityData;
      operationalStandards: OperationalStandardsData;
      sessionConfig: SessionConfigDebugProps;
    })
  | { status: "notfound" };

export const getServerSideProps = createGetServerSideProps<Props, PageParams>(
  async (context, { sparqlClient, urqlClient, sessionConfig }) => {
    const { params, res, locale } = context;
    const { id, entity } = params!;

    if (entity !== "operator") {
      return {
        props: {
          status: "notfound",
        },
      };
    }

    const operatorProps = await getOperatorsPageProps(sparqlClient, {
      id,
      locale: locale ?? defaultLocale,
      res,
    });

    if (operatorProps.status === "notfound") {
      return {
        props: {
          status: "notfound",
        },
      };
    }

    const operatorId = parseInt(id, 10);

    const [operationalStandardsResult, powerStabilityResult, costsAndTariffsResult] =
      await Promise.all([
        urqlClient
          .query<OperationalStandardsQuery>(OperationalStandardsDocument, {
            filter: { operatorId },
          })
          .toPromise(),
        urqlClient
          .query<PowerStabilityQuery>(PowerStabilityDocument, {
            filter: { operatorId, operatorOnly: true },
          })
          .toPromise(),
        urqlClient
          .query<CostsAndTariffsQuery>(CostsAndTariffsDocument, {
            filter: {
              operatorId,
              networkLevel: "NE7",
              category: "H4",
              operatorOnly: true,
            },
          })
          .toPromise(),
      ]);

    if (
      operationalStandardsResult.error ||
      !operationalStandardsResult.data?.operationalStandards
    ) {
      throw new Error("Failed to fetch operational standards data");
    }
    if (
      powerStabilityResult.error ||
      !powerStabilityResult.data?.powerStability
    ) {
      throw new Error("Failed to fetch power stability data");
    }
    if (
      costsAndTariffsResult.error ||
      !costsAndTariffsResult.data?.costsAndTariffs
    ) {
      throw new Error("Failed to fetch costs and tariffs data");
    }

    return {
      props: {
        ...operatorProps,
        operationalStandards: operationalStandardsResult.data.operationalStandards,
        powerStability: powerStabilityResult.data.powerStability,
        costsAndTariffs: costsAndTariffsResult.data.costsAndTariffs,
        sessionConfig,
      },
    };
  }
);

const OverviewPage = (props: Props) => {
  const { query } = useRouter();
  const latestYear = 2024; //FIXME: only year with data for power stability

  // Power stability card filters - must be called before conditional returns
  const [powerStabilityFilters] = useQueryStatePowerStabilityCardFilters({
    defaultValue: {
      viewBy: "progress",
      compareWith: [],
    },
  });

  if (props.status === "notfound") {
    return <ErrorPage statusCode={404} />;
  }

  const { id, entity, name } = props;

  const pageTitle = `${getLocalizedLabel({ id: entity })} ${name} – ${t({
    id: "sunshine.overview-sunshine.title",
    message: "Sunshine Indicators Overview",
  })}`;

  const bannerContent = (
    <DetailPageBanner
      id={id}
      name={name}
      municipalities={props.municipalities}
      entity={entity}
    />
  );
  const saidiYearlyObservations = useMemo(() => {
    return props.powerStability.saidi.yearlyData;
  }, [props.powerStability.saidi.yearlyData]);

  const saifiYearlyObservations = useMemo(() => {
    return props.powerStability.saifi.yearlyData;
  }, [props.powerStability.saifi.yearlyData]);

  // Compute chart data for SAIDI and SAIFI
  const saidiChartData = getPowerStabilityCardState(
    {
      peerGroup: props.powerStability.operator.peerGroup,
      updateDate: props.powerStability.updateDate,
      observations: saidiYearlyObservations,
      operatorId: id,
      operatorLabel: name,
      latestYear,
    },
    powerStabilityFilters
  );

  const saifiChartData = getPowerStabilityCardState(
    {
      peerGroup: props.powerStability.operator.peerGroup,
      updateDate: props.powerStability.updateDate,
      observations: saifiYearlyObservations,
      operatorId: id,
      operatorLabel: name,
      latestYear,
    },
    powerStabilityFilters
  );

  const getItemLabel = (id: TranslationKey) => getLocalizedLabel({ id });
  const groupedCategories = useMemo((): ComboboxItem<ElectricityCategory>[] => {
    const cGroup = getItemLabel("C-group");
    const hGroup = getItemLabel("H-group");
    return sunshineCategories.map((value) => ({
      value,
      group: value.startsWith("C") ? cGroup : hGroup,
    }));
  }, []);

  const [overviewFilters, setOverviewFilters] =
    useQueryStateSunshineOverviewFilters();
  const { year, category: _category, networkLevel } = overviewFilters;
  const category = _category as ElectricityCategory;

  const updateYear = (newYear: string) => {
    setOverviewFilters({ ...overviewFilters, year: newYear });
  };

  const updateCategory = (newCategory: ElectricityCategory) => {
    setOverviewFilters({ ...overviewFilters, category: newCategory });
  };

  const updateNetworkLevel = (newNetworkLevel: NetworkLevel["id"]) => {
    setOverviewFilters({ ...overviewFilters, networkLevel: newNetworkLevel });
  };

  const sidebarContent = <DetailsPageSidebar id={id} entity={entity} />;

  const operatorId = parseInt(id, 10);
  const [networkCostsResult] = useNetworkCostsQuery({
    variables: {
      filter: {
        operatorId,
        networkLevel,
        period: latestYear,
        operatorOnly: true,
      },
    },
  });
  const [netTariffsResult] = useNetTariffsQuery({
    variables: {
      filter: {
        operatorId,
        period: latestYear,
        category,
        operatorOnly: true,
      },
    },
  });
  const [energyTariffsResult] = useEnergyTariffsQuery({
    variables: {
      filter: {
        operatorId,
        period: latestYear,
        category,
        operatorOnly: true,
      },
    },
  });

  // Client-side operational standards query for different years
  const [operationalStandardsQuery] = useOperationalStandardsQuery({
    variables: {
      filter: {
        operatorId,
        period: parseInt(overviewFilters.year, 10),
      },
    },
    pause: overviewFilters.year === props.operationalStandards.latestYear,
  });

  const networkCosts = networkCostsResult.data?.networkCosts as
    | NetworkCostsQuery["networkCosts"]
    | undefined;
  const netTariffs = netTariffsResult.data?.netTariffs as
    | NetTariffsQuery["netTariffs"]
    | undefined;
  const energyTariffs = energyTariffsResult.data?.energyTariffs as
    | EnergyTariffsQuery["energyTariffs"]
    | undefined;

  const { yearComplianceProps, yearServiceQualityProps } = useMemo(() => {
    // Use client-side data if available and different year is selected
    const operationalStandardsData =
      overviewFilters.year === props.operationalStandards.latestYear
        ? props.operationalStandards
        : operationalStandardsQuery.data?.operationalStandards ||
          props.operationalStandards;

    const yearComplianceProps = prepComplianceCardProps(
      operationalStandardsData.compliance,
      Number(overviewFilters.year),
      true
    );
    const yearServiceQualityProps = prepServiceQualityCardProps(
      operationalStandardsData.serviceQuality,
      Number(overviewFilters.year),
      true
    );
    return {
      yearComplianceProps,
      yearServiceQualityProps,
    };
  }, [props, operationalStandardsQuery.data, overviewFilters.year]);

  const years = useMemo(() => {
    const currentYear = parseInt(runtimeEnv.CURRENT_PERIOD, 10);
    return [currentYear - 2, currentYear - 1, currentYear];
  }, []);

  const theme = useTheme();

  const mainContent = (
    <>
      <Head>
        <title>
          {makePageTitle(
            t({
              id: "sunshine.overview-sunshine.title",
              message: "Sunshine Indicators Overview",
            })
          )}
        </title>
      </Head>
      <DetailsPageHeader>
        <DetailsPageTitle>
          <Trans id="sunshine.overview-sunshine.title">
            Sunshine Indicators Overview
          </Trans>
        </DetailsPageTitle>
        <DetailsPageSubtitle>
          <Trans id="sunshine.overview-sunshine.description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Pellentesque at tellus at leo fermentum gravida. Nam eu mollis
            lacus. Sed libero augue, porttitor at velit fringilla, blandit
            cursus ipsum. In neque metus, ultricies ut tellus et, ornare
            condimentu.
          </Trans>
        </DetailsPageSubtitle>
      </DetailsPageHeader>
      <CardGrid
        sx={{
          display: "grid",
          columnGap: 4,
          rowGap: 8,
          gridTemplateColumns: "1fr",
          gridTemplateAreas: `
            "row-title-1"
            "filters"
            "network-costs"
            "net-tariffs"
            "energy-tariffs"
            "row-title-2"
            "saidi"
            "saifi"
            "row-title-3"
            "service-quality"
            "compliance"
          `,

          [theme.breakpoints.up("xl")]: {
            gridTemplateColumns: "repeat(6, 1fr)",
            gridTemplateAreas: `
        "row-title-1 row-title-1 row-title-1 row-title-1 row-title-1 row-title-1"
        "filters filters filters filters filters filters"
        "network-costs network-costs net-tariffs net-tariffs energy-tariffs energy-tariffs"
        "row-title-2 row-title-2 row-title-2 row-title-2 row-title-2 row-title-2"
        "saidi saidi saidi saifi saifi saifi"
        "row-title-3 row-title-3 row-title-3 row-title-3 row-title-3 row-title-3"
        "service-quality service-quality service-quality compliance compliance compliance"
          `,
          },
        }}
      >
        <CardGridSectionTitle sx={{ gridArea: "row-title-1" }}>
          <Trans id="sunshine.grid.network-costs-title">Network Costs</Trans>
        </CardGridSectionTitle>
        <Box
          gap={4}
          mb={2}
          gridArea="filters"
          alignItems="end"
          display="grid"
          gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr 1fr" }}
          columnGap={4}
        >
          <Combobox
            id="network-level"
            label={getLocalizedLabel({ id: "network-level" })}
            items={["NE5", "NE6", "NE7"]}
            getItemLabel={(item) =>
              getLocalizedLabel({ id: `network-level.${item}.short` })
            }
            selectedItem={networkLevel}
            setSelectedItem={updateNetworkLevel}
            infoDialogSlug="help-network-level"
          />
          <Combobox
            id="category"
            label={t({ id: "selector.category", message: "Category" })}
            items={groupedCategories}
            getItemLabel={(x) => getItemLabel(`${x}-long`)}
            selectedItem={category}
            setSelectedItem={(item) =>
              updateCategory(item as ElectricityCategory)
            }
            //FIXME: Might need change
            infoDialogSlug="help-categories"
            sx={{
              gridColumn: { xs: "auto", sm: "span 2" },
            }}
          />
        </Box>
        {networkCosts ? (
          <NetworkCostsTrendCardMinified
            filters={{
              viewBy: "progress",
              compareWith: [],
            }}
            peerGroup={props.costsAndTariffs.operator.peerGroup}
            updateDate={props.costsAndTariffs.updateDate}
            networkCosts={networkCosts}
            operatorId={id}
            operatorLabel={name}
            latestYear={latestYear}
            sx={{ gridArea: "network-costs" }}
            cardDescription={getLocalizedLabel({
              id: `network-level.${networkLevel}.description`,
            })}
            linkContent={
              <Link
                href={sunshineDetailsLink(
                  `/sunshine/${entity}/${id}/costs-and-tariffs`,
                  { tabDetails: "networkCosts" }
                )}
              >
                <IconButton variant="outlined" color="primary" size="sm">
                  <Icon name="arrowright" />
                </IconButton>
              </Link>
            }
          />
        ) : (
          <LoadingSkeleton height={280} sx={{ gridArea: "network-costs" }} />
        )}
        {netTariffs ? (
          <TariffsTrendCardMinified
            filters={{
              viewBy: "progress",
              compareWith: [],
            }}
            peerGroup={props.costsAndTariffs.operator.peerGroup}
            updateDate={props.costsAndTariffs.updateDate}
            netTariffs={netTariffs}
            operatorId={id}
            operatorLabel={name}
            indicator="netTariffs"
            latestYear={latestYear}
            cardTitle={
              <Trans id="sunshine.costs-and-tariffs.net-tariffs.overview">
                Net Tariffs
              </Trans>
            }
            cardDescription={getLocalizedLabel({
              id: `${category}-long`,
            })}
            sx={{ gridArea: "net-tariffs" }}
            linkContent={
              <Link
                href={sunshineDetailsLink(
                  `/sunshine/${entity}/${id}/costs-and-tariffs`,
                  { tabDetails: "netTariffs" }
                )}
              >
                <IconButton variant="outlined" size="sm" color="primary">
                  <Icon name="arrowright" />
                </IconButton>
              </Link>
            }
          />
        ) : (
          <LoadingSkeleton height={280} sx={{ gridArea: "net-tariffs" }} />
        )}
        {energyTariffs ? (
          <TariffsTrendCardMinified
            filters={{
              viewBy: "progress",
              compareWith: [],
            }}
            peerGroup={props.costsAndTariffs.operator.peerGroup}
            updateDate={props.costsAndTariffs.updateDate}
            netTariffs={energyTariffs}
            operatorId={id}
            operatorLabel={name}
            indicator="energyTariffs"
            latestYear={latestYear}
            cardTitle={
              <Trans id="sunshine.costs-and-tariffs.energy-tariffs.overview">
                Energy Tariffs
              </Trans>
            }
            cardDescription={getLocalizedLabel({
              id: `${category}-long`,
            })}
            sx={{ gridArea: "energy-tariffs" }}
            linkContent={
              <Link
                href={sunshineDetailsLink(
                  `/sunshine/${entity}/${id}/costs-and-tariffs`,
                  { tabDetails: "energyTariffs" }
                )}
              >
                <IconButton variant="outlined" size="sm" color="primary">
                  <Icon name="arrowright" />
                </IconButton>
              </Link>
            }
          />
        ) : (
          <LoadingSkeleton height={280} sx={{ gridArea: "energy-tariffs" }} />
        )}
        <CardGridSectionTitle sx={{ gridArea: "row-title-2" }}>
          <Trans id="sunshine.grid.power-stability-title">
            Power Stability
          </Trans>
        </CardGridSectionTitle>
        <OverviewCard
          title={
            <Trans id="sunshine.power-stability.saidi-trend.overview">
              Power Outage (SAIDI)
            </Trans>
          }
          description={
            <Trans id="sunshine.power-stability.saidi-trend.description">
              Power Outage Duration
            </Trans>
          }
          infoDialogProps={getInfoDialogProps("help-saidi")}
          sx={{ gridArea: "saidi" }}
          chart={
            props.powerStability.saidi.operatorTotal != null ? (
              <PowerStabilityChart
                observations={saidiChartData.observations}
                id={saidiChartData.operatorId}
                operatorLabel={saidiChartData.operatorLabel}
                viewBy={powerStabilityFilters.viewBy ?? "progress"}
                overallOrRatio={
                  powerStabilityFilters.overallOrRatio ?? "overall"
                }
                saidiSaifiType={powerStabilityFilters.saidiSaifiType ?? "total"}
                compareWith={[]}
                rootProps={{ sx: { mt: 2 } }}
              />
            ) : (
              <NoDataAvailable sx={{ mt: 2 }} />
            )
          }
          linkContent={
            <Link
              href={sunshineDetailsLink(
                `/sunshine/${entity}/${id}/power-stability`,
                { tabDetails: "saidi" }
              )}
            >
              <IconButton variant="outlined" size="sm" color="primary">
                <Icon name="arrowright" />
              </IconButton>
            </Link>
          }
        />
        <OverviewCard
          title={
            <Trans id="sunshine.power-stability.saifi-trend.overview">
              Power Outage (SAIFI)
            </Trans>
          }
          description={
            <Trans id="sunshine.power-stability.saifi-trend.description">
              Power Outage Frequency
            </Trans>
          }
          infoDialogProps={getInfoDialogProps("help-saifi")}
          sx={{ gridArea: "saifi" }}
          chart={
            props.powerStability.saifi.operatorTotal != null ? (
              <PowerStabilityChart
                observations={saifiChartData.observations}
                id={saifiChartData.operatorId}
                operatorLabel={saifiChartData.operatorLabel}
                viewBy={powerStabilityFilters.viewBy ?? "progress"}
                overallOrRatio={
                  powerStabilityFilters.overallOrRatio ?? "overall"
                }
                saidiSaifiType={powerStabilityFilters.saidiSaifiType ?? "total"}
                compareWith={[]}
                rootProps={{ sx: { mt: 2 } }}
              />
            ) : (
              <NoDataAvailable sx={{ mt: 2 }} />
            )
          }
          linkContent={
            <Link
              href={sunshineDetailsLink(
                `/sunshine/${entity}/${id}/power-stability`,
                { tabDetails: "saifi" }
              )}
            >
              <IconButton variant="outlined" size="sm" color="primary">
                <Icon name="arrowright" />
              </IconButton>
            </Link>
          }
        />
        <CardGridSectionTitle sx={{ gridArea: "row-title-3" }}>
          <Trans id="sunshine.grid.operational-standards-title">
            Operational Standards
          </Trans>
        </CardGridSectionTitle>
        <TableComparisonCard
          {...yearServiceQualityProps}
          subtitle={null}
          infoDialogProps={getInfoDialogProps("help-service-quality")}
          description={
            <YearlyNavigation
              activeTab={year}
              handleTabChange={(_, value) => updateYear(value)}
              years={years}
              sx={{ mb: 4 }}
            />
          }
          linkContent={
            <Link
              href={sunshineDetailsLink(
                `/sunshine/${entity}/${id}/operational-standards`,
                { tabDetails: "outageInfo" }
              )}
            >
              <IconButton variant="outlined" size="sm" color="primary">
                <Icon name="arrowright" />
              </IconButton>
            </Link>
          }
          sx={{ gridArea: "service-quality" }}
        />
        <TableComparisonCard
          {...yearComplianceProps}
          subtitle={null}
          infoDialogProps={getInfoDialogProps("help-compliance")}
          description={
            <YearlyNavigation
              activeTab={year}
              handleTabChange={(_, value) => updateYear(value)}
              years={years}
              sx={{ mb: 4 }}
            />
          }
          linkContent={
            <Link
              href={sunshineDetailsLink(
                `/sunshine/${entity}/${id}/operational-standards`,
                { tabDetails: "compliance" }
              )}
            >
              <IconButton variant="outlined" size="sm" color="primary">
                <Icon name="arrowright" />
              </IconButton>
            </Link>
          }
          sx={{ gridArea: "compliance" }}
        />
      </CardGrid>
    </>
  );

  return (
    <>
      {props.status === "found" && (
        <SessionConfigDebug flags={props.sessionConfig.flags} />
      )}
      <SafeHydration>
        <DetailsPageLayout
          title={pageTitle}
          BannerContent={bannerContent}
          SidebarContent={sidebarContent}
          MainContent={mainContent}
          download={query.download}
          entity={entity}
          id={id}
        />
      </SafeHydration>
    </>
  );
};

export default OverviewPage;
