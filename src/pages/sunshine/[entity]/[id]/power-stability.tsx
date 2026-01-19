import { t, Trans } from "@lingui/macro";
import { useTheme } from "@mui/material";
import ErrorPage from "next/error";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback } from "react";

import CardGrid from "src/components/card-grid";
import { DetailPageBanner } from "src/components/detail-page/banner";
import {
  DetailsPageHeader,
  DetailsPageLayout,
  DetailsPageSubtitle,
  DetailsPageTitle,
} from "src/components/detail-page/layout";
import { DetailsPageSidebar } from "src/components/detail-page/sidebar";
import { getInfoDialogProps } from "src/components/info-dialog-props";
import PeerGroupCard from "src/components/peer-group-card";
import { PowerStabilityCardState } from "src/components/power-stability-card";
import { SessionConfigDebug } from "src/components/session-config-debug";
import {
  PowerStabilityNavigation,
  PowerStabilityTab,
} from "src/components/sunshine-tabs";
import TableComparisonCard from "src/components/table-comparison-card";
import {
  SessionConfigDebugProps,
  Props as SharedPageProps,
} from "src/data/shared-page-props";
import { COUNT_PER_YEAR, MIN_PER_YEAR } from "src/domain/metrics";
import {
  QueryStateSingleSunshineDetails,
  useQueryStateSunshineDetails,
} from "src/domain/query-states";
import { PowerStabilityData } from "src/domain/sunshine";
import { getLocalizedLabel } from "src/domain/translation";
import {
  OperatorPagePropsDocument,
  OperatorPagePropsQuery,
  PowerStabilityDocument,
  PowerStabilityQuery,
} from "src/graphql/queries";
import { defaultLocale } from "src/locales/config";
import createGetServerSideProps from "src/utils/create-server-side-props";
import { makePageTitle } from "src/utils/page-title";

type Props =
  | (Extract<SharedPageProps, { entity: "operator"; status: "found" }> & {
      powerStability: PowerStabilityData;
      sessionConfig: SessionConfigDebugProps;
    })
  | { status: "notfound" };

export const getServerSideProps = createGetServerSideProps(
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

    const { data: operatorData, error: operatorError } = await urqlClient
      .query<OperatorPagePropsQuery>(OperatorPagePropsDocument, {
        locale: locale ?? defaultLocale,
        id,
      })
      .toPromise();

    if (operatorError || !operatorData?.operator) {
      res.statusCode = 404;
      return {
        props: {
          status: "notfound",
        },
      };
    }

    const operatorProps = {
      entity: "operator" as const,
      status: "found" as const,
      id: operatorData.operator.id ?? id,
      name: operatorData.operator.name,
      municipalities: operatorData.operator.municipalities,
    };

    const { data, error } = await urqlClient
      .query<PowerStabilityQuery>(PowerStabilityDocument, {
        filter: {
          operatorId: parseInt(id, 10),
        },
      })
      .toPromise();

    if (error || !data?.powerStability) {
      throw new Error("Failed to fetch power stability data");
    }

    return {
      props: {
        ...operatorProps,
        powerStability: data.powerStability,
        sessionConfig,
      },
    };
  }
);

const Saidi = (props: Extract<Props, { status: "found" }>) => {
  const {
    operator: { peerGroup },
    latestYear,
    updateDate,
    saidi,
  } = props.powerStability;

  const operatorLabel = props.name;

  const comparisonCardProps = {
    title: (
      <Trans id="sunshine.power-stability.saidi.comparison-card-title">
        Total Outage Duration
      </Trans>
    ),
    subtitle: (
      <Trans id="sunshine.latest-year">Latest year ({latestYear})</Trans>
    ),
    rows: [
      {
        label: <Trans id="sunshine.power-stability.saidi.total">Total</Trans>,
        value: {
          value: saidi.operatorTotal,
          unit: MIN_PER_YEAR,
          trend: saidi.trendTotal,
          round: 2,
        },
      },
      {
        label: (
          <Trans id="sunshine.power-stability.saidi.unplanned">Unplanned</Trans>
        ),
        value: {
          value: saidi.operatorUnplanned,
          unit: MIN_PER_YEAR,
          trend: saidi.trendUnplanned,
          round: 2,
        },
      },
      {
        label: (
          <Trans id="sunshine.power-stability.saidi.peer-group-median-total">
            Peer Group Median (Total)
          </Trans>
        ),
        value: {
          value: saidi.peerGroupMedianTotal,
          unit: MIN_PER_YEAR,
          round: 2,
          trend: saidi.peerGroupMedianTrendTotal,
        },
      },
      {
        label: (
          <Trans id="sunshine.power-stability.saidi.peer-group-median-unplanned">
            Peer Group Median (Unplanned)
          </Trans>
        ),
        value: {
          value: saidi.peerGroupMedianUnplanned,
          unit: MIN_PER_YEAR,
          round: 2,
          trend: saidi.peerGroupMedianTrendUnplanned,
        },
      },
    ],
  } satisfies React.ComponentProps<typeof TableComparisonCard>;

  const theme = useTheme();

  return (
    <CardGrid
      sx={{
        gridTemplateColumns: "1fr",
        gridTemplateAreas: `
          "comparison"
          "peer-group"
          "trend"
        `,
        [theme.breakpoints.up("sm")]: {
          gridTemplateColumns: "repeat(2, 1fr)",
          gridTemplateRows: "auto auto auto",
          gridTemplateAreas: `"comparison peer-group" "trend trend"`,
        },
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
        infoDialogProps={getInfoDialogProps("help-saidi")}
      />

      <PowerStabilityCardState
        latestYear={Number(latestYear)}
        sx={{ gridArea: "trend" }}
        peerGroup={peerGroup}
        updateDate={updateDate}
        operatorId={props.id}
        operatorLabel={operatorLabel}
        observations={saidi.yearlyData}
        cardTitle={t({
          id: "sunshine.power-stability.saidi-trend",
          message: "Average Power Outage Duration (SAIDI)",
        })}
        noData={saidi.operatorTotal == null}
      />
    </CardGrid>
  );
};

const Saifi = (props: Extract<Props, { status: "found" }>) => {
  const {
    operator: { peerGroup },
    latestYear,
    updateDate,
    saifi,
  } = props.powerStability;

  const operatorLabel = props.name;

  const comparisonCardProps = {
    title: (
      <Trans id="sunshine.power-stability.saifi.comparison-card-title">
        Total Outage Frequency
      </Trans>
    ),
    subtitle: (
      <Trans id="sunshine.latest-year">Latest year ({latestYear})</Trans>
    ),
    rows: [
      {
        label: <Trans id="sunshine.power-stability.saifi.total">Total</Trans>,
        value: {
          value: saifi.operatorTotal,
          unit: COUNT_PER_YEAR,
          round: 2,
          trend: saifi.trendTotal,
        },
      },
      {
        label: (
          <Trans id="sunshine.power-stability.saifi.unplanned">Unplanned</Trans>
        ),
        value: {
          value: saifi.operatorUnplanned,
          unit: COUNT_PER_YEAR,
          round: 2,
          trend: saifi.trendUnplanned,
        },
      },
      {
        label: (
          <Trans id="sunshine.power-stability.saifi.peer-group-median-total">
            Peer Group Median (Total)
          </Trans>
        ),
        value: {
          value: saifi.peerGroupMedianTotal,
          unit: COUNT_PER_YEAR,
          round: 2,
          trend: saifi.peerGroupMedianTrendTotal,
        },
      },
      {
        label: (
          <Trans id="sunshine.power-stability.saifi.peer-group-median-unplanned">
            Peer Group Median (Unplanned)
          </Trans>
        ),
        value: {
          value: saifi.peerGroupMedianUnplanned,
          unit: COUNT_PER_YEAR,
          round: 2,
          trend: saifi.peerGroupMedianTrendUnplanned,
        },
      },
    ],
  } satisfies React.ComponentProps<typeof TableComparisonCard>;

  const theme = useTheme();

  return (
    <CardGrid
      sx={{
        gridTemplateColumns: "1fr",
        gridTemplateAreas: `
          "comparison"
          "peer-group"
          "trend"
        `,
        [theme.breakpoints.up("sm")]: {
          gridTemplateColumns: "repeat(2, 1fr)",
          gridTemplateRows: "auto auto auto",
          gridTemplateAreas: `"comparison peer-group" "trend trend"`,
        },
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
        infoDialogProps={getInfoDialogProps("help-saifi")}
      />

      <PowerStabilityCardState
        latestYear={Number(latestYear)}
        sx={{ gridArea: "trend" }}
        peerGroup={peerGroup}
        updateDate={updateDate}
        operatorId={props.id}
        operatorLabel={operatorLabel}
        observations={saifi.yearlyData}
        cardTitle={t({
          id: "sunshine.power-stability.saifi-trend",
          message: "Average Power Outage Frequency (SAIFI)",
        })}
        noData={saifi.operatorTotal == null}
      />
    </CardGrid>
  );
};

const PowerStability = (props: Props) => {
  const { query } = useRouter();
  const [state, setQueryState] = useQueryStateSunshineDetails();
  const { tabDetails: activeTabQuery } = state;
  const activeTab = activeTabQuery ?? ("saidi" satisfies PowerStabilityTab);
  const setActiveTab = useCallback(
    (tab: QueryStateSingleSunshineDetails["tabDetails"]) => {
      setQueryState({
        tabDetails: tab,
      });
    },
    [setQueryState]
  );

  if (props.status === "notfound") {
    return <ErrorPage statusCode={404} />;
  }

  const { id, name, entity } = props;

  const pageTitle = `${getLocalizedLabel({ id: entity })} ${name} – ${t({
    id: "sunshine.power-stability.title",
    message: "Power Stability",
  })}`;

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: PowerStabilityTab
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
        <title>
          {makePageTitle(
            t({
              id: "sunshine.power-stability.title",
              message: "Power Stability",
            })
          )}
        </title>
      </Head>
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

      {activeTab === "saidi" && <Saidi {...props} />}
      {activeTab === "saifi" && <Saifi {...props} />}
    </>
  );

  return (
    <>
      {props.status === "found" && (
        <SessionConfigDebug flags={props.sessionConfig.flags} />
      )}
      <DetailsPageLayout
        title={pageTitle}
        BannerContent={bannerContent}
        SidebarContent={sidebarContent}
        MainContent={mainContent}
        download={query.download}
        entity={entity}
        id={id}
      />
    </>
  );
};

export default PowerStability;
