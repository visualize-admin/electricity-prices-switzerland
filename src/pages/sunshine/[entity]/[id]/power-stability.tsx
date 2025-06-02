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
import PeerGroupCard from "src/components/peer-group-card";
import {
  PowerStabilityNavigation,
  PowerStabilityTabOption,
} from "src/components/sunshine-tabs";
import TableComparisonCard, {
  Trend,
} from "src/components/table-comparison-card";
import {
  handleOperatorsEntity,
  PageParams,
  Props as SharedPageProps,
} from "src/data/shared-page-props";
import {
  fetchPowerStability,
  SunshinePowerStabilityData,
} from "src/domain/data";
import { getLocalizedLabel } from "src/domain/translation";
import { defaultLocale } from "src/locales/locales";

type Props =
  | (Extract<SharedPageProps, { entity: "operator"; status: "found" }> & {
      powerStability: SunshinePowerStabilityData;
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

  const powerStability = await fetchPowerStability(id);

  return {
    props: {
      ...operatorProps,
      powerStability,
    },
  };
};

const SaidiSaifi = (
  props: Extract<Props, { status: "found" }> & { attribute: "saidi" | "saifi" }
) => {
  const {
    operator: { peerGroup },
    latestYear,
  } = props.powerStability;
  const { attribute } = props;

  const data = props.powerStability[attribute];
  const operatorLabel = props.name;

  const comparisonCardProps = {
    title:
      attribute === "saidi" ? (
        <Trans id="sunshine.power-stability.saidi.comparison-card-title">
          Total Outage Duration
        </Trans>
      ) : (
        <Trans id="sunshine.power-stability.saifi.comparison-card-title">
          Total Outage Frequency
        </Trans>
      ),
    subtitle: (
      <Trans id="sunshine.power-stability.latest-year">
        Latest year ({latestYear})
      </Trans>
    ),
    rows: [
      {
        label: (
          <Trans id="sunshine.power-stability.operator">{operatorLabel}</Trans>
        ),
        value: {
          value: data.operatorMinutes,
          unit: "min/year",
          trend: "decreasing" satisfies Trend,
        },
      },
      {
        label: (
          <Trans id="sunshine.power-stability.median-peer-group">
            Median Peer Group
          </Trans>
        ),
        value: {
          value: data.peerGroupMinutes,
          unit: "min/year",
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
      </CardGrid>
    </>
  );
};

const PowerStability = (props: Props) => {
  const { query } = useRouter();
  const [activeTab, setActiveTab] = useState<PowerStabilityTabOption>(
    PowerStabilityTabOption.SAIDI
  );

  if (props.status === "notfound") {
    return <ErrorPage statusCode={404} />;
  }

  const { id, name, entity } = props;

  const pageTitle = `${getLocalizedLabel({ id: entity })} ${name} – ${t({
    id: "sunshine.power-stability.title",
    message: "Power Stability",
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
          <Trans id="sunshine.power-stability.title">Power Stability</Trans>
        </DetailsPageTitle>
        <DetailsPageSubtitle>
          <Trans id="sunshine.power-stability.description">
            The Power Stability page provides insights into the reliability of
            the electricity supply through two key indicators: SAIFI (System
            Average Interruption Frequency Index) and SAIDI (System Average
            Interruption Duration Index). These indicators measure the frequency
            and duration of power interruptions. The data is comparable within
            the same grid operator group, allowing for a clear assessment of
            power stability and reliability across the network.
          </Trans>
        </DetailsPageSubtitle>
      </DetailsPageHeader>

      {/* Tab Navigation */}
      <PowerStabilityNavigation
        activeTab={activeTab}
        handleTabChange={handleTabChange}
      />

      {activeTab === PowerStabilityTabOption.SAIDI && (
        <SaidiSaifi attribute="saidi" {...props} />
      )}
      {activeTab === PowerStabilityTabOption.SAIFI && (
        <SaidiSaifi attribute="saifi" {...props} />
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

export default PowerStability;
