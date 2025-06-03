import { Trans, t } from "@lingui/macro";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";
import { useRouter } from "next/router";
import React, { useState } from "react";

import CardGrid from "src/components/card-grid";
import { DetailPageBanner } from "src/components/detail-page/banner";
import {
  DetailsPageLayout,
  DetailsPageHeader,
  DetailsPageSubtitle,
  DetailsPageTitle,
} from "src/components/detail-page/layout";
import { DetailsPageSidebar } from "src/components/detail-page/sidebar";
import NetTariffsTrendCard from "src/components/net-tariffs-trend-card";
import NetworkCostsTrendCard from "src/components/network-costs-trend-card";
import PeerGroupCard from "src/components/peer-group-card";
import TableComparisonCard, {
  Trend,
} from "src/components/table-comparison-card";
import {
  handleOperatorsEntity,
  PageParams,
  Props as SharedPageProps,
} from "src/data/shared-page-props";
import {
  fetchOperatorCostsAndTariffsData,
  SunshineCostsAndTariffsData,
} from "src/domain/data";
import {
  getCategoryLabels,
  getLocalizedLabel,
  getNetworkLevelLabels,
} from "src/domain/translation";
import { defaultLocale } from "src/locales/locales";

enum TabOption {
  NETWORK_COSTS = 0,
  NET_TARIFFS = 1,
  ENERGY_TARIFFS = 2,
}

type Props =
  | (Extract<SharedPageProps, { entity: "operator"; status: "found" }> & {
      costsAndTariffs: SunshineCostsAndTariffsData;
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

  const costsAndTariffs = await fetchOperatorCostsAndTariffsData(id);

  return {
    props: {
      ...operatorProps,
      costsAndTariffs,
    },
  };
};

const CostsAndTariffsNavigation: React.FC<{
  activeTab: unknown;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}> = ({ activeTab, handleTabChange }) => {
  return (
    <Tabs value={activeTab} onChange={handleTabChange}>
      <Tab
        label={
          <Trans id="sunshine.costs-and-tariffs.network-costs">
            Network Costs
          </Trans>
        }
      />
      <Tab
        label={
          <Trans id="sunshine.costs-and-tariffs.net-tariffs">Net Tariffs</Trans>
        }
      />
      <Tab
        label={
          <Trans id="sunshine.costs-and-tariffs.energy-tariffs">
            Energy Tariffs
          </Trans>
        }
      />
    </Tabs>
  );
};

const NetworkCosts = (props: Extract<Props, { status: "found" }>) => {
  const {
    networkCosts: { networkLevel, operatorRate, peerGroupMedianRate },
    operator: { peerGroup },
    latestYear,
    updateDate,
  } = props.costsAndTariffs;
  const networkLabels = getNetworkLevelLabels(networkLevel);

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
      {
        label: (
          <Trans id="sunshine.costs-and-tariffs.operator">
            {operatorLabel}
          </Trans>
        ),
        value: {
          value: operatorRate,
          unit: "Rp./km",
          trend: "stable" satisfies Trend,
        },
      },
      {
        label: (
          <Trans id="sunshine.costs-and-tariffs.median-peer-group">
            Median Peer Group
          </Trans>
        ),
        value: {
          value: peerGroupMedianRate,
          unit: "Rp./km",
          trend: "stable" as Trend,
        },
      },
    ],
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
            `"peer-group" "network-costs" "network-costs-trend"`, // One column on small screens
            `"peer-group network-costs" "network-costs-trend network-costs-trend"`, // Two columns on medium screens
          ],
        }}
      >
        <PeerGroupCard
          latestYear={latestYear}
          peerGroup={peerGroup}
          sx={{ gridArea: "peer-group" }}
        />

        <TableComparisonCard
          {...comparisonCardProps}
          sx={{ gridArea: "network-costs" }}
        />

        <NetworkCostsTrendCard
          sx={{ gridArea: "network-costs-trend" }}
          peerGroup={peerGroup}
          updateDate={updateDate}
        />
      </CardGrid>
    </>
  );
};

const NetTariffs = (props: Extract<Props, { status: "found" }>) => {
  const {
    netTariffs: { category, operatorRate, peerGroupMedianRate },
    operator: { peerGroup },
    latestYear,
    updateDate,
  } = props.costsAndTariffs;
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
      {
        label: (
          <Trans id="sunshine.costs-and-tariffs.operator">
            {operatorLabel}
          </Trans>
        ),
        value: {
          value: operatorRate,
          unit: "Rp./km",
          trend: "stable" satisfies Trend,
        },
      },
      {
        label: (
          <Trans id="sunshine.costs-and-tariffs.median-peer-group">
            Median Peer Group
          </Trans>
        ),
        value: {
          value: peerGroupMedianRate,
          unit: "Rp./km",
          trend: "stable" as Trend,
        },
      },
    ],
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
            `"peer-group" "net-tariffs" "net-tariffs-trend"`, // One column on small screens
            `"peer-group net-tariffs" "net-tariffs-trend net-tariffs-trend"`, // Two columns on medium screens
          ],
        }}
      >
        <PeerGroupCard
          latestYear={latestYear}
          peerGroup={peerGroup}
          sx={{ gridArea: "peer-group" }}
        />

        <TableComparisonCard
          {...comparisonCardProps}
          sx={{ gridArea: "net-tariffs" }}
        />

        <NetTariffsTrendCard
          sx={{ gridArea: "net-tariffs-trend" }}
          peerGroup={peerGroup}
          updateDate={updateDate}
        />
      </CardGrid>
    </>
  );
};

const CostsAndTariffs = (props: Props) => {
  const { query } = useRouter();
  const [activeTab, setActiveTab] = useState<TabOption>(
    TabOption.NETWORK_COSTS
  );

  if (props.status === "notfound") {
    return <ErrorPage statusCode={404} />;
  }

  const { id, name, entity } = props;

  const pageTitle = `${getLocalizedLabel({ id: entity })} ${name} – ${t({
    id: "sunshine.costs-and-tariffs.title",
    message: "Costs and Tariffs",
  })}`;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
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

      {activeTab === TabOption.NETWORK_COSTS && <NetworkCosts {...props} />}
      {activeTab === TabOption.NET_TARIFFS && <NetTariffs {...props} />}

      {activeTab === TabOption.ENERGY_TARIFFS && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h5">
            <Trans id="sunshine.costs-and-tariffs.energy-tariffs-content">
              Energy Tariffs Content
            </Trans>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <Trans id="sunshine.costs-and-tariffs.under-development-energy">
              This section is under development.
            </Trans>
          </Typography>
        </Box>
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
    />
  );
};

export default CostsAndTariffs;
