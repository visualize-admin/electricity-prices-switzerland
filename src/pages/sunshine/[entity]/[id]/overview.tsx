import { t, Trans } from "@lingui/macro";
import { Box, IconButton, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";
import Link from "next/link";
import { useRouter } from "next/router";
import { ComponentProps, useMemo } from "react";

import CardGrid from "src/components/card-grid";
import { Combobox } from "src/components/combobox";
import { DetailPageBanner } from "src/components/detail-page/banner";
import {
  DetailsPageHeader,
  DetailsPageLayout,
  DetailsPageSubtitle,
  DetailsPageTitle,
} from "src/components/detail-page/layout";
import { DetailsPageSidebar } from "src/components/detail-page/sidebar";
import { NetworkCostsTrendCardMinified } from "src/components/network-costs-trend-card";
import { PowerStabilityCardMinified } from "src/components/power-stability-card";
import { SunshineDataServiceDebug } from "src/components/sunshine-data-service-debug";
import { YearlyNavigation } from "src/components/sunshine-tabs";
import TableComparisonCard from "src/components/table-comparison-card";
import { TariffsTrendCardMinified } from "src/components/tariffs-trend-card";
import {
  DataServiceProps,
  handleOperatorsEntity,
  PageParams,
  Props as SharedPageProps,
} from "src/data/shared-page-props";
import { categories, ElectricityCategory } from "src/domain/data";
import {
  sunshineDetailsLink,
  useQueryStateSunshineOverviewFilters,
} from "src/domain/query-states";
import {
  NetworkLevel,
  SunshineCostsAndTariffsData,
  SunshineOperationalStandardsData,
  SunshinePowerStabilityData,
} from "src/domain/sunshine";
import { getLocalizedLabel } from "src/domain/translation";
import {
  EnergyTariffsQuery,
  NetTariffsQuery,
  NetworkCostsQuery,
  useEnergyTariffsQuery,
  useNetTariffsQuery,
  useNetworkCostsQuery,
  useOperationalStandardsQuery,
} from "src/graphql/queries";
import { Icon } from "src/icons";
import {
  fetchOperationalStandards,
  fetchOperatorCostsAndTariffsData,
  fetchPowerStability,
} from "src/lib/sunshine-data";
import {
  getSunshineDataServiceFromGetServerSidePropsContext,
  getSunshineDataServiceInfo,
} from "src/lib/sunshine-data-service-context";
import { defaultLocale } from "src/locales/config";

import {
  prepComplianceCardProps,
  prepServiceQualityCardProps,
} from "./operational-standards";

type Props =
  | (Extract<SharedPageProps, { entity: "operator"; status: "found" }> & {
      costsAndTariffs: SunshineCostsAndTariffsData;
      powerStability: SunshinePowerStabilityData;
      operationalStandards: SunshineOperationalStandardsData;
      dataService: DataServiceProps;
    })
  | { status: "notfound" };

export const getServerSideProps: GetServerSideProps<Props, PageParams> = async (
  context
) => {
  const { params, res, locale } = context;
  const { id, entity } = params!;

  if (entity !== "operator") {
    return {
      props: {
        status: "notfound",
      },
    };
  }

  const operatorProps = await handleOperatorsEntity({
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

  const sunshineDataService =
    getSunshineDataServiceFromGetServerSidePropsContext(context);
  const dataService = getSunshineDataServiceInfo(context);

  const [operationalStandards, powerStability, costsAndTariffs] =
    await Promise.all([
      fetchOperationalStandards(sunshineDataService, {
        operatorId: id,
      }),
      fetchPowerStability(sunshineDataService, {
        operatorId: id,
        operatorOnly: true,
      }),
      fetchOperatorCostsAndTariffsData(sunshineDataService, {
        operatorId: id,
        networkLevel: "NE5",
        category: "C2",
        operatorOnly: true,
      }),
    ]);

  return {
    props: {
      ...operatorProps,
      operationalStandards,
      powerStability,
      costsAndTariffs,
      dataService,
    },
  };
};

const OverviewPage = (props: Props) => {
  const { query } = useRouter();
  const latestYear = 2024; //FIXME: only year with data for power stability

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

  const getItemLabel = (id: string) => getLocalizedLabel({ id });
  const groupedCategories = useMemo(() => {
    return [
      { type: "header", title: getItemLabel("EC-group") },
      ...categories.filter((x) => x.startsWith("C")),
      { type: "header", title: getItemLabel("EH-group") },
      ...categories.filter((x) => x.startsWith("H")),
      { type: "header", title: getItemLabel("NC-group") },
      ...categories.filter((x) => x.startsWith("C")),
      { type: "header", title: getItemLabel("NH-group") },
      ...categories.filter((x) => x.startsWith("H")),
    ] as ComponentProps<typeof Combobox>["items"];
  }, []);

  const [overviewFilters, setOverviewFilters] =
    useQueryStateSunshineOverviewFilters();
  const { year, category, networkLevel } = overviewFilters;

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
        period: parseInt(overviewFilters.year),
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

  const mainContent = (
    <>
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
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(6, 1fr)",
          },
          gridTemplateAreas: {
            xs: `
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
            sm: `
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
        <Typography variant="h2" sx={{ gridArea: "row-title-1" }}>
          <Trans id="sunshine.grid.network-costs-title">Network Costs</Trans>
        </Typography>
        <Box
          sx={{
            gap: 4,
            mb: 2,
            gridArea: "filters",
            alignItems: "end",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
            columnGap: 4,
          }}
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
            getItemLabel={getItemLabel}
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
                href={`${sunshineDetailsLink(
                  `/sunshine/${entity}/${id}/costs-and-tariffs`,
                  { tab: "networkCosts" }
                )}#main-content`}
              >
                <IconButton variant="outlined" color="primary">
                  <Icon name="arrowright" />
                </IconButton>
              </Link>
            }
          />
        ) : (
          <div />
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
                href={`${sunshineDetailsLink(
                  `/sunshine/${entity}/${id}/costs-and-tariffs`,
                  { tab: "netTariffs" }
                )}#main-content`}
              >
                <IconButton variant="outlined" size="sm" color="primary">
                  <Icon name="arrowright" />
                </IconButton>
              </Link>
            }
          />
        ) : (
          <div />
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
                href={`${sunshineDetailsLink(
                  `/sunshine/${entity}/${id}/costs-and-tariffs`,
                  { tab: "energyTariffs" }
                )}#main-content`}
              >
                <IconButton variant="outlined" size="sm" color="primary">
                  <Icon name="arrowright" />
                </IconButton>
              </Link>
            }
          />
        ) : (
          <div />
        )}
        <Typography variant="h2" sx={{ gridArea: "row-title-2" }}>
          <Trans id="sunshine.grid.power-stability-title">
            Power Stability
          </Trans>
        </Typography>
        <PowerStabilityCardMinified
          filters={{
            viewBy: "progress",
            compareWith: [],
          }}
          peerGroup={props.powerStability.operator.peerGroup}
          updateDate={props.powerStability.updateDate}
          observations={saidiYearlyObservations}
          operatorId={id}
          operatorLabel={name}
          latestYear={latestYear}
          cardTitle={
            <Trans id="sunshine.power-stability.saidi-trend.overview">
              Power Outage (SAIDI)
            </Trans>
          }
          cardDescription={
            <Trans id="sunshine.power-stability.saidi-trend.description">
              Power Outage Duration
            </Trans>
          }
          sx={{ gridArea: "saidi" }}
          linkContent={
            <Link
              href={`${sunshineDetailsLink(
                `/sunshine/${entity}/${id}/power-stability`,
                { tab: "saidi" }
              )}#main-content`}
            >
              <IconButton variant="outlined" size="sm" color="primary">
                <Icon name="arrowright" />
              </IconButton>
            </Link>
          }
        />
        <PowerStabilityCardMinified
          filters={{
            viewBy: "progress",
            compareWith: [],
          }}
          peerGroup={props.powerStability.operator.peerGroup}
          updateDate={props.powerStability.updateDate}
          observations={saifiYearlyObservations}
          operatorId={id}
          operatorLabel={name}
          latestYear={latestYear}
          cardTitle={
            <Trans id="sunshine.power-stability.saifi-trend.overview">
              Power Outage (SAIFI)
            </Trans>
          }
          cardDescription={
            <Trans id="sunshine.power-stability.saifi-trend.description">
              Power Outage Frequency
            </Trans>
          }
          sx={{ gridArea: "saifi" }}
          linkContent={
            <Link
              href={`${sunshineDetailsLink(
                `/sunshine/${entity}/${id}/power-stability`,
                { tab: "saifi" }
              )}#main-content`}
            >
              <IconButton variant="outlined" size="sm" color="primary">
                <Icon name="arrowright" />
              </IconButton>
            </Link>
          }
        />
        <Typography variant="h2" sx={{ gridArea: "row-title-3" }}>
          <Trans id="sunshine.grid.operational-standards-title">
            Operational Standards
          </Trans>
        </Typography>
        <TableComparisonCard
          {...yearServiceQualityProps}
          subtitle={null}
          description={
            <YearlyNavigation
              activeTab={year}
              handleTabChange={(_, value) => updateYear(value)}
              sx={{ mb: 4 }}
            />
          }
          linkContent={
            <Link
              href={`${sunshineDetailsLink(
                `/sunshine/${entity}/${id}/operational-standards`,
                { tab: "serviceQuality" }
              )}#main-content`}
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
          description={
            <YearlyNavigation
              activeTab={year}
              handleTabChange={(_, value) => updateYear(value)}
              sx={{ mb: 4 }}
            />
          }
          linkContent={
            <Link
              href={`${sunshineDetailsLink(
                `/sunshine/${entity}/${id}/operational-standards`,
                { tab: "compliance" }
              )}#main-content`}
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
      {props.status === "found" && !props.dataService.isDefault && (
        <SunshineDataServiceDebug serviceName={props.dataService.serviceName} />
      )}
      <DetailsPageLayout
        title={pageTitle}
        BannerContent={bannerContent}
        SidebarContent={sidebarContent}
        MainContent={mainContent}
        download={query.download}
      />
    </>
  );
};

export default OverviewPage;
