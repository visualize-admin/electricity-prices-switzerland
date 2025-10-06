import { t, Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { ComponentProps, useCallback, useMemo } from "react";
import { gql } from "urql";

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
import { LoadingSkeleton } from "src/components/hint";
import { infoDialogProps } from "src/components/info-dialog-props";
import { NetworkCostsTrendCardState } from "src/components/network-costs-trend-card";
import PeerGroupCard from "src/components/peer-group-card";
import { SunshineDataServiceDebug } from "src/components/sunshine-data-service-debug";
import {
  CostAndTariffsTab,
  CostsAndTariffsNavigation,
} from "src/components/sunshine-tabs";
import TableComparisonCard from "src/components/table-comparison-card";
import { TariffsTrendCard } from "src/components/tariffs-trend-card";
import {
  DataServiceProps,
  getOperatorsPageProps,
  PageParams,
  Props as SharedPageProps,
} from "src/data/shared-page-props";
import { categories } from "src/domain/data";
import {
  getNetworkLevelMetrics,
  RP_PER_KM,
  RP_PER_KWH,
} from "src/domain/metrics";
import {
  QueryStateSingleSunshineDetails,
  useQueryStateSunshineCostsAndTariffs,
  useQueryStateSunshineDetails,
} from "src/domain/query-states";
import { SunshineCostsAndTariffsData } from "src/domain/sunshine";
import {
  getCategoryLabels,
  getLocalizedLabel,
  getNetworkLevelLabels,
} from "src/domain/translation";
import {
  NetworkCostsQuery,
  useEnergyTariffsQuery,
  useNetTariffsQuery,
  useNetworkCostsQuery,
} from "src/graphql/queries";
import { ElectricityCategory } from "src/graphql/resolver-mapped-types";
import { Trend } from "src/graphql/resolver-types";
import { fetchOperatorCostsAndTariffsData } from "src/lib/sunshine-data";
import {
  getSunshineDataServiceFromGetServerSidePropsContext,
  getSunshineDataServiceInfo,
} from "src/lib/sunshine-data-service-context";
import { truthy } from "src/lib/truthy";
import { defaultLocale } from "src/locales/config";
import { makePageTitle } from "src/utils/page-title";
type Props =
  | (Extract<SharedPageProps, { entity: "operator"; status: "found" }> & {
      costsAndTariffs: Omit<
        SunshineCostsAndTariffsData,
        "energyTariffs" | "networkCosts" | "netTariffs"
      >;
      dataService: DataServiceProps;
    })
  | { status: "notfound" };

export const getServerSideProps: GetServerSideProps<Props, PageParams> = async (
  context
) => {
  const { params, res, req, locale } = context;

  const { id, entity } = params!;

  if (entity !== "operator") {
    return {
      props: {
        status: "notfound",
      },
    };
  }

  const operatorProps = await getOperatorsPageProps({
    id,
    locale: locale ?? defaultLocale,
    res,
    req,
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
  const costsAndTariffs = await fetchOperatorCostsAndTariffsData(
    sunshineDataService,
    {
      operatorId: id,
      networkLevel: "NE7",
      category: "H4",
    }
  );

  return {
    props: {
      ...operatorProps,
      costsAndTariffs,
      dataService,
    },
  };
};

export const NetworkCostsDocument = gql`
  query NetworkCosts($filter: NetworkCostsFilter!) {
    networkCosts(filter: $filter) {
      networkLevel {
        id
      }
      operatorRate
      operatorTrend
      peerGroupMedianRate
      peerGroupMedianTrend
      yearlyData {
        year
        rate
        operator_id
        operator_name
        network_level
      }
    }
  }
`;

const NetworkCosts = (props: Extract<Props, { status: "found" }>) => {
  const {
    operator: { peerGroup },
    latestYear,
    updateDate,
  } = props.costsAndTariffs;

  const [{ networkLevel }, setQueryState] =
    useQueryStateSunshineCostsAndTariffs();
  const [{ data, fetching }] = useNetworkCostsQuery({
    variables: {
      filter: {
        operatorId: parseInt(props.id, 10),
        networkLevel: networkLevel,
        period: parseInt(latestYear, 10),
      },
    },
  });
  const networkCosts = data?.networkCosts as NetworkCostsQuery["networkCosts"];

  if (fetching) {
    return <LoadingSkeleton height={700} />;
  }

  if (!networkCosts) {
    return (
      <Typography variant="body2" color="text.secondary">
        <Trans id="sunshine.costs-and-tariffs.no-network-costs">
          No network costs data available for this operator in the selected
          year.
        </Trans>
      </Typography>
    );
  }

  const {
    operatorRate,
    operatorTrend,
    peerGroupMedianRate,
    peerGroupMedianTrend,
    yearlyData: _yearlyData,
  } = networkCosts;
  const networkLabels = getNetworkLevelLabels({ id: networkLevel });

  const operatorLabel = props.name;

  const comparisonCardProps = {
    title: (
      <Trans id="sunshine.costs-and-tariffs.network-costs-end-consumer">
        Network Costs at {networkLabels.long} Level
      </Trans>
    ),
    subtitle: (
      <Trans id="sunshine.costs-and-tariffs.latest-year">
        Latest year ({latestYear})
      </Trans>
    ),
    rows: [
      operatorRate !== null && operatorRate !== undefined
        ? {
            label: (
              <Trans id="sunshine.costs-and-tariffs.operator">
                {operatorLabel}
              </Trans>
            ),
            value: {
              value: operatorRate,
              unit: getNetworkLevelMetrics(networkLevel),
              trend: operatorTrend,
              round: 0,
            },
          }
        : null,
      peerGroupMedianRate !== null && peerGroupMedianRate !== undefined
        ? {
            label: (
              <Trans id="sunshine.costs-and-tariffs.median-peer-group">
                Median Peer Group
              </Trans>
            ),
            value: {
              value: peerGroupMedianRate,
              unit: getNetworkLevelMetrics(networkLevel),
              trend: peerGroupMedianTrend,
              round: 0,
            },
          }
        : null,
    ].filter(truthy),
  } satisfies React.ComponentProps<typeof TableComparisonCard>;

  return (
    <CardGrid
      sx={{
        gridTemplateColumns: {
          xs: "1fr", // Single column on small screens
          sm: "repeat(2, 1fr)", // Two columns on medium screens
        },

        gridTemplateRows: ["auto auto auto", "auto auto"], // Three rows: two for cards, one for trend chart

        // On Desktop, peer group and network costs cards are side by side
        // Network costs trend is below them
        // On Mobile, they are stacked
        gridTemplateAreas: [
          `"selector" "comparison" "peer-group" "trend"`, // One column on small screens
          `"selector space" "comparison peer-group" "trend trend"`, // Two columns on medium screens
        ],
      }}
    >
      <Box sx={{ mb: 2, gridArea: "selector" }}>
        <Combobox
          id="network-level"
          label={getLocalizedLabel({ id: "network-level" })}
          items={["NE5", "NE6", "NE7"]}
          getItemLabel={(item) =>
            getLocalizedLabel({ id: `network-level.${item}.short` })
          }
          selectedItem={networkLevel}
          setSelectedItem={(item) => setQueryState({ networkLevel: item })}
          infoDialogSlug="help-network-level"
        />
      </Box>
      <PeerGroupCard
        latestYear={latestYear}
        peerGroup={peerGroup}
        sx={{ gridArea: "peer-group" }}
      />
      <TableComparisonCard
        {...comparisonCardProps}
        sx={{ gridArea: "comparison" }}
      />
      <NetworkCostsTrendCardState
        latestYear={Number(latestYear)}
        sx={{ gridArea: "trend" }}
        peerGroup={peerGroup}
        updateDate={updateDate}
        operatorId={props.id}
        operatorLabel={operatorLabel}
        networkCosts={networkCosts}
        infoDialogProps={infoDialogProps["help-network-costs"]}
      />
    </CardGrid>
  );
};

export const EnergyTariffsDocument = gql`
  query EnergyTariffs($filter: TariffsFilter!) {
    energyTariffs(filter: $filter) {
      category
      operatorRate
      peerGroupMedianRate
      yearlyData {
        period
        rate
        operator_id
        operator_name
        category
      }
    }
  }
`;

const EnergyTariffs = (props: Extract<Props, { status: "found" }>) => {
  const {
    operator: { peerGroup },
    latestYear,
    updateDate,
  } = props.costsAndTariffs;

  const getItemLabel = (id: string) => getLocalizedLabel({ id });
  const groupedCategories = useMemo(() => {
    return [
      { type: "header", title: getItemLabel("C-group") },
      ...categories.filter((x) => x.startsWith("C")),
      { type: "header", title: getItemLabel("H-group") },
      ...categories.filter((x) => x.startsWith("H")),
    ] as ComponentProps<typeof Combobox>["items"];
  }, []);

  const [{ category }, setQueryState] = useQueryStateSunshineCostsAndTariffs();
  const [{ data, fetching }] = useEnergyTariffsQuery({
    variables: {
      filter: {
        operatorId: parseInt(props.id, 10),
        period: parseInt(latestYear, 10),
        category: category,
      },
    },
  });
  const energyTariffs = data?.energyTariffs;

  if (fetching) {
    return <LoadingSkeleton height={700} />;
  }

  if (!energyTariffs) {
    return (
      <Typography variant="body2" color="text.secondary">
        <Trans id="sunshine.costs-and-tariffs.no-energy-tariffs">
          No energy tariffs data available for this operator in the selected
          year.
        </Trans>
      </Typography>
    );
  }

  const { operatorRate, peerGroupMedianRate } = energyTariffs;

  const categoryLabels = getCategoryLabels(category);

  const operatorLabel = props.name;

  const comparisonCardProps = {
    title: (
      <Trans id="sunshine.costs-and-tariffs.energy-tariffs-comparison-title">
        Energy Tariffs {categoryLabels.long}
      </Trans>
    ),
    subtitle: (
      <Trans id="sunshine.costs-and-tariffs.latest-year">
        Latest year ({latestYear})
      </Trans>
    ),
    rows: [
      operatorRate !== null && operatorRate !== undefined
        ? {
            label: (
              <Trans id="sunshine.costs-and-tariffs.operator">
                {operatorLabel}
              </Trans>
            ),
            value: {
              value: operatorRate,
              unit: RP_PER_KM,
              round: 2,
              // TODO
              trend: Trend.Stable,
            },
          }
        : null,
      peerGroupMedianRate !== null && peerGroupMedianRate !== undefined
        ? {
            label: (
              <Trans id="sunshine.costs-and-tariffs.median-peer-group">
                Median Peer Group
              </Trans>
            ),
            value: {
              value: peerGroupMedianRate,
              unit: RP_PER_KM,
              round: 2,
              // TODO
              trend: Trend.Stable,
            },
          }
        : null,
    ].filter(truthy),
  } satisfies React.ComponentProps<typeof TableComparisonCard>;

  return (
    <CardGrid
      sx={{
        gridTemplateColumns: {
          xs: "1fr", // Single column on small screens
          sm: "repeat(2, 1fr)", // Two columns on medium screens
        },
        gridTemplateRows: ["auto auto auto", "auto auto"], // Three rows: two for cards, one for trend chart
        gridTemplateAreas: [
          `"selector" "comparison" "peer-group" "trend"`, // One column on small screens
          `"selector space" "comparison peer-group" "trend trend"`, // Two columns on medium screens
        ],
      }}
    >
      <Box sx={{ mb: 2, gridArea: "selector" }}>
        <Combobox
          id="category"
          label={t({ id: "selector.category", message: "Category" })}
          items={groupedCategories}
          getItemLabel={getItemLabel}
          selectedItem={category}
          setSelectedItem={(item) =>
            setQueryState({ category: item as ElectricityCategory })
          }
          //FIXME: Might need change
          infoDialogSlug="help-categories"
        />
      </Box>

      <PeerGroupCard
        latestYear={latestYear}
        peerGroup={peerGroup}
        sx={{ gridArea: "peer-group" }}
      />

      <TableComparisonCard
        {...comparisonCardProps}
        sx={{ gridArea: "comparison" }}
      />

      <TariffsTrendCard
        latestYear={Number(latestYear)}
        sx={{ gridArea: "trend" }}
        peerGroup={peerGroup}
        updateDate={updateDate}
        operatorId={props.id}
        operatorLabel={operatorLabel}
        netTariffs={energyTariffs}
        cardTitle={
          <Trans id="sunshine.costs-and-tariffs.energy-tariffs-trend">
            Energy Tariffs Trend
          </Trans>
        }
        infoDialogProps={infoDialogProps["help-energy-tariffs"]}
      />
    </CardGrid>
  );
};

export const NetTariffsDocument = gql`
  query NetTariffs($filter: TariffsFilter!) {
    netTariffs(filter: $filter) {
      category
      operatorRate
      peerGroupMedianRate
      yearlyData {
        period
        rate
        operator_id
        operator_name
        category
      }
    }
  }
`;

const NetTariffs = (props: Extract<Props, { status: "found" }>) => {
  const {
    operator: { peerGroup },
    latestYear,
    updateDate,
  } = props.costsAndTariffs;

  const getItemLabel = (id: string) => getLocalizedLabel({ id });
  const groupedCategories = useMemo(() => {
    return [
      { type: "header", title: getItemLabel("C-group") },
      ...categories.filter((x) => x.startsWith("C")),
      { type: "header", title: getItemLabel("H-group") },
      ...categories.filter((x) => x.startsWith("H")),
    ] as ComponentProps<typeof Combobox>["items"];
  }, []);

  const [{ category }, setQueryState] = useQueryStateSunshineCostsAndTariffs();
  const [{ data, fetching }] = useNetTariffsQuery({
    variables: {
      filter: {
        operatorId: parseInt(props.id, 10),
        period: parseInt(latestYear, 10),
        category: category,
      },
    },
  });
  const netTariffs = data?.netTariffs;

  if (fetching) {
    return <LoadingSkeleton height={700} />;
  }

  if (!netTariffs) {
    return (
      <Typography variant="body2" color="text.secondary">
        <Trans id="sunshine.costs-and-tariffs.no-net-tariffs">
          No network tariffs data available for this operator in the selected
          year.
        </Trans>
      </Typography>
    );
  }

  const { operatorRate, peerGroupMedianRate } = netTariffs;
  const categoryLabels = getCategoryLabels(category);

  const operatorLabel = props.name;

  const comparisonCardProps = {
    title: (
      <Trans id="sunshine.costs-and-tariffs.net-tariffs-comparison-title">
        Net Tariffs {categoryLabels.long}
      </Trans>
    ),
    subtitle: (
      <Trans id="sunshine.costs-and-tariffs.latest-year">
        Latest year ({latestYear})
      </Trans>
    ),
    rows: [
      operatorRate !== null && operatorRate !== undefined
        ? {
            label: (
              <Trans id="sunshine.costs-and-tariffs.operator">
                {operatorLabel}
              </Trans>
            ),
            value: {
              value: operatorRate,
              unit: RP_PER_KWH,
              round: 2,
              // TODO
              trend: "stable" as Trend,
            },
          }
        : null,
      peerGroupMedianRate !== null && peerGroupMedianRate !== undefined
        ? {
            label: (
              <Trans id="sunshine.costs-and-tariffs.median-peer-group">
                Median Peer Group
              </Trans>
            ),
            value: {
              value: peerGroupMedianRate,
              unit: RP_PER_KWH,
              round: 2,
              // TODO
              trend: "stable" as Trend,
            },
          }
        : null,
    ].filter(truthy),
  } satisfies React.ComponentProps<typeof TableComparisonCard>;

  return (
    <CardGrid
      sx={{
        gridTemplateColumns: {
          xs: "1fr", // Single column on small screens
          sm: "repeat(2, 1fr)", // Two columns on medium screens
        },
        gridTemplateRows: ["auto auto auto", "auto auto"], // Three rows: two for cards, one for trend chart
        gridTemplateAreas: [
          `"selector" "comparison" "peer-group" "trend"`, // One column on small screens
          `"selector space" "comparison peer-group" "trend trend"`, // Two columns on medium screens
        ],
      }}
    >
      <Box sx={{ mb: 2, gridArea: "selector" }}>
        <Combobox
          id="category"
          label={t({ id: "selector.category", message: "Category" })}
          items={groupedCategories}
          getItemLabel={getItemLabel}
          selectedItem={category}
          setSelectedItem={(item) =>
            setQueryState({ category: item as ElectricityCategory })
          }
          infoDialogSlug="help-categories"
        />
      </Box>

      <PeerGroupCard
        latestYear={latestYear}
        peerGroup={peerGroup}
        sx={{ gridArea: "peer-group" }}
      />

      <TableComparisonCard
        {...comparisonCardProps}
        sx={{ gridArea: "comparison" }}
      />

      <TariffsTrendCard
        latestYear={Number(latestYear)}
        sx={{ gridArea: "trend" }}
        peerGroup={peerGroup}
        updateDate={updateDate}
        operatorId={props.id}
        operatorLabel={operatorLabel}
        netTariffs={netTariffs}
        cardTitle={
          <Trans id="sunshine.costs-and-tariffs.net-tariffs-trend">
            Net Tariffs Trend
          </Trans>
        }
        infoDialogProps={infoDialogProps["help-net-tariffs"]}
      />
    </CardGrid>
  );
};

const CostsAndTariffs = (props: Props) => {
  const { query } = useRouter();
  const [state, setQueryState] = useQueryStateSunshineDetails();
  const { tab: activeTabQuery } = state;
  const activeTab =
    activeTabQuery ?? ("networkCosts" satisfies CostAndTariffsTab);
  const setActiveTab = useCallback(
    (tab: QueryStateSingleSunshineDetails["tab"]) => {
      setQueryState({
        tab,
      });
    },
    [setQueryState]
  );

  if (props.status === "notfound") {
    return <ErrorPage statusCode={404} />;
  }

  const { id, name, entity } = props;

  const pageTitle = makePageTitle(name);

  const handleTabChange = (
    _: React.SyntheticEvent,
    newValue: CostAndTariffsTab
  ) => {
    setActiveTab(newValue);
  };

  const bannerContent = (
    <DetailPageBanner
      id={id}
      name={name}
      municipalities={props.municipalities}
      entity={entity}
    />
  );

  const sidebarContent = <DetailsPageSidebar id={id} entity={entity} />;

  const mainContent = (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <DetailsPageHeader>
        <DetailsPageTitle>
          <Trans id="sunshine.costs-and-tariffs.title">Costs and Tariffs</Trans>
        </DetailsPageTitle>
        <DetailsPageSubtitle>
          <Trans id="sunshine.costs-and-tariffs.description">
            This page provides an overview of electricity costs and tariffs,
            including network costs, net tariffs, and energy tariffs. Compare
            different providers and analyze trends within your peer group to
            better understand your position in the market.
          </Trans>
        </DetailsPageSubtitle>
      </DetailsPageHeader>

      {/* Tab Navigation */}
      <CostsAndTariffsNavigation
        activeTab={activeTab}
        handleTabChange={handleTabChange}
      />

      {activeTab === "networkCosts" && <NetworkCosts {...props} />}
      {activeTab === "netTariffs" && <NetTariffs {...props} />}
      {activeTab === "energyTariffs" && <EnergyTariffs {...props} />}
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

export default CostsAndTariffs;
