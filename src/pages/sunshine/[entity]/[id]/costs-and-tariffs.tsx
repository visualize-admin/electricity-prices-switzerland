import { Trans, t } from "@lingui/macro";
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
import {
  CostAndTariffsTabOption,
  CostsAndTariffsNavigation,
} from "src/components/sunshine-tabs";
import TableComparisonCard, {
  Trend,
} from "src/components/table-comparison-card";
import {
  handleOperatorsEntity,
  PageParams,
  Props as SharedPageProps,
} from "src/data/shared-page-props";
import { SunshineCostsAndTariffsData } from "src/domain/data";
import {
  getCategoryLabels,
  getLocalizedLabel,
  getNetworkLevelLabels,
} from "src/domain/translation";
import { fetchOperatorCostsAndTariffsData } from "src/lib/db/sunshine-data";
import { truthy } from "src/lib/truthy";
import { defaultLocale } from "src/locales/config";

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

  if (operatorProps.status === "notfound") {
    return {
      props: {
        status: "notfound",
      },
    };
  }

  const costsAndTariffs = await fetchOperatorCostsAndTariffsData(id);

  return {
    props: {
      ...operatorProps,
      costsAndTariffs,
    },
  };
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
      operatorRate !== null
        ? {
            label: (
              <Trans id="sunshine.costs-and-tariffs.operator">
                {operatorLabel}
              </Trans>
            ),
            value: {
              value: operatorRate,
              unit: "Rp./km",
              trend: "stable" as Trend,
            },
          }
        : null,
      peerGroupMedianRate !== null
        ? {
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
            `"peer-group" "comparison" "trend"`, // One column on small screens
            `"peer-group comparison" "trend trend"`, // Two columns on medium screens
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
          sx={{ gridArea: "comparison" }}
        />

        <NetworkCostsTrendCard
          sx={{ gridArea: "trend" }}
          peerGroup={peerGroup}
          updateDate={updateDate}
        />
      </CardGrid>
    </>
  );
};

const EnergyTariffs = (props: Extract<Props, { status: "found" }>) => {
  const {
    energyTariffs: { category, operatorRate, peerGroupMedianRate },
    operator: { peerGroup },
    latestYear,
    updateDate,
  } = props.costsAndTariffs;
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
      operatorRate !== null
        ? {
            label: (
              <Trans id="sunshine.costs-and-tariffs.operator">
                {operatorLabel}
              </Trans>
            ),
            value: {
              value: operatorRate,
              unit: "Rp./km",
              trend: "stable" as Trend,
            },
          }
        : null,
      peerGroupMedianRate !== null
        ? {
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
            `"peer-group" "comparison" "trend"`, // One column on small screens
            `"peer-group comparison" "trend trend"`, // Two columns on medium screens
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
          sx={{ gridArea: "comparison" }}
        />

        <NetTariffsTrendCard
          sx={{ gridArea: "trend" }}
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
      operatorRate !== null
        ? {
            label: (
              <Trans id="sunshine.costs-and-tariffs.operator">
                {operatorLabel}
              </Trans>
            ),
            value: {
              value: operatorRate,
              unit: "Rp./km",
              trend: "stable" as Trend,
            },
          }
        : null,
      peerGroupMedianRate !== null
        ? {
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
            `"peer-group" "comparison" "trend"`, // One column on small screens
            `"peer-group comparison" "trend trend"`, // Two columns on medium screens
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
          sx={{ gridArea: "comparison" }}
        />

        <NetTariffsTrendCard
          sx={{ gridArea: "trend" }}
          peerGroup={peerGroup}
          updateDate={updateDate}
        />
      </CardGrid>
    </>
  );
};

const CostsAndTariffs = (props: Props) => {
  const { query } = useRouter();
  const [activeTab, setActiveTab] = useState<CostAndTariffsTabOption>(
    CostAndTariffsTabOption.NETWORK_COSTS
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

      {activeTab === CostAndTariffsTabOption.NETWORK_COSTS && (
        <NetworkCosts {...props} />
      )}
      {activeTab === CostAndTariffsTabOption.NET_TARIFFS && (
        <NetTariffs {...props} />
      )}
      {activeTab === CostAndTariffsTabOption.ENERGY_TARIFFS && (
        <EnergyTariffs {...props} />
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
