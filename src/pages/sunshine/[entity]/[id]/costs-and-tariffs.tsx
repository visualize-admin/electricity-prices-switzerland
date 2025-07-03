import { t, Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";
import { useRouter } from "next/router";
import React, { ComponentProps, useCallback, useMemo, useState } from "react";
import { gql } from "urql";

import { ButtonGroup } from "src/components/button-group";
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
import { Loading } from "src/components/hint";
import { NetworkCostsTrendCard } from "src/components/network-costs-trend-card";
import PeerGroupCard from "src/components/peer-group-card";
import {
  CostAndTariffsTab,
  CostsAndTariffsNavigation,
} from "src/components/sunshine-tabs";
import TableComparisonCard from "src/components/table-comparison-card";
import { TariffsTrendCard } from "src/components/tariffs-trend-card";
import {
  handleOperatorsEntity,
  PageParams,
  Props as SharedPageProps,
} from "src/data/shared-page-props";
import {
  NetworkLevel,
  SunshineCostsAndTariffsData,
  tariffCategories,
} from "src/domain/data";
import { getNetworkLevelMetrics, RP_PER_KM } from "src/domain/metrics";
import {
  QueryStateSingleSunshineDetails,
  useQueryStateSunshineDetails,
} from "src/domain/query-states";
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
import { TariffCategory } from "src/graphql/resolver-mapped-types";
import { Trend } from "src/graphql/resolver-types";
import { fetchOperatorCostsAndTariffsData } from "src/lib/db/sunshine-data";
import { truthy } from "src/lib/truthy";
import { defaultLocale } from "src/locales/config";

type Props =
  | (Extract<SharedPageProps, { entity: "operator"; status: "found" }> & {
      costsAndTariffs: Omit<
        SunshineCostsAndTariffsData,
        "energyTariffs" | "networkCosts" | "netTariffs"
      >;
    })
  | { status: "notfound" };

export const getServerSideProps: GetServerSideProps<
  Props,
  PageParams
> = async ({ params, res, locale }) => {
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

  const costsAndTariffs = await fetchOperatorCostsAndTariffsData({
    operatorId: id,
    networkLevel: "NE5",
    category: "NC2",
  });

  return {
    props: {
      ...operatorProps,
      costsAndTariffs,
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

  // TODO Assuming NE5 is the network level for the operator
  const [networkLevel, setNetworkLevel] = useState<NetworkLevel["id"]>("NE5");
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
    return <Loading />;
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
    <>
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
            `"selector" "peer-group" "comparison" "trend"`, // One column on small screens
            `"selector space" "peer-group comparison" "trend trend"`, // Two columns on medium screens
          ],
        }}
      >
        <Box sx={{ mb: 2, gridArea: "selector" }}>
          <ButtonGroup
            id="basic-button-group"
            label={getLocalizedLabel({ id: "network-level" })}
            options={[
              {
                value: "NE5",
                label: getLocalizedLabel({ id: "network-level.NE5.short" }),
              },
              {
                value: "NE6",
                label: getLocalizedLabel({ id: "network-level.NE6.short" }),
              },
              {
                value: "NE7",
                label: getLocalizedLabel({ id: "network-level.NE7.short" }),
              },
            ]}
            value={networkLevel}
            setValue={setNetworkLevel}
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

        <NetworkCostsTrendCard
          latestYear={Number(latestYear)}
          sx={{ gridArea: "trend" }}
          peerGroup={peerGroup}
          updateDate={updateDate}
          operatorId={props.id}
          operatorLabel={operatorLabel}
          networkCosts={networkCosts}
        />
      </CardGrid>
    </>
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
      { type: "header", title: getItemLabel("EC-group") },
      ...tariffCategories.filter((x) => x.startsWith("EC")),
      { type: "header", title: getItemLabel("EH-group") },
      ...tariffCategories.filter((x) => x.startsWith("EH")),
      { type: "header", title: getItemLabel("NC-group") },
      ...tariffCategories.filter((x) => x.startsWith("NC")),
      { type: "header", title: getItemLabel("NH-group") },
      ...tariffCategories.filter((x) => x.startsWith("NH")),
    ] as ComponentProps<typeof Combobox>["items"];
  }, []);

  const [category, _setCategory] = useState<TariffCategory>("NC2"); // Default category, can be changed based on user input
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
    return <Loading />;
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
              trend: Trend.Stable,
            },
          }
        : null,
    ].filter(truthy),
  } satisfies React.ComponentProps<typeof TableComparisonCard>;

  return (
    <>
      <CardGrid
        sx={{
          gridTemplateColumns: {
            xs: "1fr", // Single column on small screens
            sm: "repeat(2, 1fr)", // Two columns on medium screens
          },
          gridTemplateRows: ["auto auto auto", "auto auto"], // Three rows: two for cards, one for trend chart
          gridTemplateAreas: [
            `"selector" "peer-group" "comparison" "trend"`, // One column on small screens
            `"selector space" "peer-group comparison" "trend trend"`, // Two columns on medium screens
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
            setSelectedItem={(item) => _setCategory(item as TariffCategory)}
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
          infoDialogProps={{
            slug: "help-energy-tariffs",
            label: t({
              id: "sunshine.costs-and-tariffs.energy-tariffs-trend",
              message: "Energy Tariffs Trend",
            }),
          }}
        />
      </CardGrid>
    </>
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
      { type: "header", title: getItemLabel("EC-group") },
      ...tariffCategories.filter((x) => x.startsWith("EC")),
      { type: "header", title: getItemLabel("EH-group") },
      ...tariffCategories.filter((x) => x.startsWith("EH")),
      { type: "header", title: getItemLabel("NC-group") },
      ...tariffCategories.filter((x) => x.startsWith("NC")),
      { type: "header", title: getItemLabel("NH-group") },
      ...tariffCategories.filter((x) => x.startsWith("NH")),
    ] as ComponentProps<typeof Combobox>["items"];
  }, []);

  const [category, _setCategory] = useState<TariffCategory>("NC2"); // Default category, can be changed based on user input
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
    return <Loading />;
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
              unit: RP_PER_KM,
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
              unit: RP_PER_KM,
              trend: "stable" as Trend,
            },
          }
        : null,
    ].filter(truthy),
  } satisfies React.ComponentProps<typeof TableComparisonCard>;

  return (
    <>
      <CardGrid
        sx={{
          gridTemplateColumns: {
            xs: "1fr", // Single column on small screens
            sm: "repeat(2, 1fr)", // Two columns on medium screens
          },
          gridTemplateRows: ["auto auto auto", "auto auto"], // Three rows: two for cards, one for trend chart
          gridTemplateAreas: [
            `"selector" "peer-group" "comparison" "trend"`, // One column on small screens
            `"selector space" "peer-group comparison" "trend trend"`, // Two columns on medium screens
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
            setSelectedItem={(item) => _setCategory(item as TariffCategory)}
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
          netTariffs={netTariffs}
          cardTitle={
            <Trans id="sunshine.costs-and-tariffs.net-tariffs-trend">
              Net Tariffs Trend
            </Trans>
          }
          infoDialogProps={{
            slug: "help-net-tariffs",
            label: t({
              id: "sunshine.costs-and-tariffs.net-tariffs-trend",
              message: "Net Tariffs Trend",
            }),
          }}
        />
      </CardGrid>
    </>
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

  const pageTitle = `${getLocalizedLabel({ id: entity })} ${name} – ${t({
    id: "sunshine.costs-and-tariffs.title",
    message: "Costs and Tariffs",
  })}`;

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
    <DetailsPageLayout
      title={pageTitle}
      BannerContent={bannerContent}
      SidebarContent={sidebarContent}
      MainContent={mainContent}
      download={query.download}
    />
  );
};

export default CostsAndTariffs;
