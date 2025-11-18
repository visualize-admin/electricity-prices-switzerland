import { t, Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import ErrorPage from "next/error";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback } from "react";
import { gql } from "urql";

import CardGrid from "src/components/card-grid";
import { DetailPageBanner } from "src/components/detail-page/banner";
import {
  DetailsPageHeader,
  DetailsPageLayout,
  DetailsPageSubtitle,
  DetailsPageTitle,
} from "src/components/detail-page/layout";
import { DetailsPageSidebar } from "src/components/detail-page/sidebar";
import { LoadingSkeleton } from "src/components/hint";
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
  getOperatorsPageProps,
  Props as SharedPageProps,
} from "src/data/shared-page-props";
import { ANZAHL_PER_YEAR, MIN_PER_YEAR } from "src/domain/metrics";
import {
  QueryStateSingleSunshineDetails,
  useQueryStateSunshineDetails,
} from "src/domain/query-states";
import { SunshinePowerStabilityData } from "src/domain/sunshine";
import { getLocalizedLabel } from "src/domain/translation";
import { useSaidiQuery, useSaifiQuery } from "src/graphql/queries";
import { Trend } from "src/graphql/resolver-types";
import { fetchPowerStability } from "src/lib/sunshine-data";
import { defaultLocale } from "src/locales/config";
import createGetServerSideProps from "src/utils/create-server-side-props";
import { makePageTitle } from "src/utils/page-title";

type Props =
  | (Extract<SharedPageProps, { entity: "operator"; status: "found" }> & {
      powerStability: Omit<SunshinePowerStabilityData, "saidi" | "saifi">;
      sessionConfig: SessionConfigDebugProps;
    })
  | { status: "notfound" };

export const getServerSideProps = createGetServerSideProps(
  async (context, { sparqlClient, sunshineDataService, sessionConfig }) => {
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

    const powerStability = await fetchPowerStability(sunshineDataService, {
      operatorId: id,
    });

    return {
      props: {
        ...operatorProps,
        powerStability,
        sessionConfig,
      },
    };
  }
);

// Operator document and year filter
export const SaidiDocument = gql`
  query Saidi($filter: StabilityFilter!) {
    saidi(filter: $filter) {
      operatorTotal
      peerGroupTotal
      yearlyData {
        year
        total
        unplanned
        operator_id
        operator_name
      }
    }
  }
`;

export const SaifiDocument = gql`
  query Saifi($filter: StabilityFilter!) {
    saifi(filter: $filter) {
      operatorTotal
      peerGroupTotal
      yearlyData {
        year
        total
        unplanned
        operator_id
        operator_name
      }
    }
  }
`;

const Saidi = (props: Extract<Props, { status: "found" }>) => {
  const {
    operator: { peerGroup },
    latestYear,
    updateDate,
  } = props.powerStability;

  const [{ data, fetching }] = useSaidiQuery({
    variables: {
      filter: {
        operatorId: parseInt(props.id, 10),
        year: parseInt(latestYear, 10),
      },
    },
  });

  if (fetching) {
    return <LoadingSkeleton height={700} />;
  }

  if (!data?.saidi) {
    return (
      <Typography variant="body2" color="text.secondary">
        <Trans id="sunshine.power-stability.no-saidi-data">
          No SAIDI data available for this operator in the selected year.
        </Trans>
      </Typography>
    );
  }

  const operatorLabel = props.name;

  const comparisonCardProps = {
    title: (
      <Trans id="sunshine.power-stability.saidi.comparison-card-title">
        Total Outage Duration
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
          value: data.saidi.operatorTotal,
          unit: MIN_PER_YEAR,
          // TODO Compute the trend
          trend: Trend.Down,
          round: 2,
        },
      },
      {
        label: (
          <Trans id="legend-item.peer-group-median">Peer Group Median</Trans>
        ),
        value: {
          value: data.saidi.peerGroupTotal,
          unit: MIN_PER_YEAR,
          // TODO Compute the trend
          trend: Trend.Stable,
          round: 2,
        },
      },
    ],
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
          `"comparison" "peer-group" "trend"`, // One column on small screens
          `"comparison peer-group" "trend trend"`, // Two columns on medium screens
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
        infoDialogProps={getInfoDialogProps("help-saidi")}
      />

      <PowerStabilityCardState
        latestYear={Number(latestYear)}
        sx={{ gridArea: "trend" }}
        peerGroup={peerGroup}
        updateDate={updateDate}
        operatorId={props.id}
        operatorLabel={operatorLabel}
        observations={data.saidi.yearlyData}
        cardTitle={t({
          id: "sunshine.power-stability.saidi-trend",
          message: "Average Power Outage Duration (SAIDI)",
        })}
      />
    </CardGrid>
  );
};

const Saifi = (props: Extract<Props, { status: "found" }>) => {
  const {
    operator: { peerGroup },
    latestYear,
    updateDate,
  } = props.powerStability;

  const [{ data, fetching }] = useSaifiQuery({
    variables: {
      filter: {
        operatorId: parseInt(props.id, 10),
        year: parseInt(latestYear, 10),
      },
    },
  });

  if (fetching) {
    return <LoadingSkeleton height={700} />;
  }

  if (!data?.saifi) {
    return (
      <Typography variant="body2" color="text.secondary">
        <Trans id="sunshine.power-stability.no-saifi-data">
          No SAIFI data available for this operator in the selected year.
        </Trans>
      </Typography>
    );
  }

  const operatorLabel = props.name;

  const comparisonCardProps = {
    title: (
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
          value: data.saifi.operatorTotal,
          unit: ANZAHL_PER_YEAR,
          round: 2,
          // TODO Compute the trend
          trend: Trend.Down,
        },
      },
      {
        label: (
          <Trans id="legend-item.peer-group-median">Peer Group Median</Trans>
        ),
        value: {
          value: data.saifi.peerGroupTotal,
          unit: ANZAHL_PER_YEAR,
          round: 2,
          // TODO Compute the trend
          trend: Trend.Stable,
        },
      },
    ],
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
          `"comparison" "peer-group" "trend"`, // One column on small screens
          `"comparison peer-group" "trend trend"`, // Two columns on medium screens
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
        infoDialogProps={getInfoDialogProps("help-saifi")}
      />

      <PowerStabilityCardState
        latestYear={Number(latestYear)}
        sx={{ gridArea: "trend" }}
        peerGroup={peerGroup}
        updateDate={updateDate}
        operatorId={props.id}
        operatorLabel={operatorLabel}
        observations={data.saifi.yearlyData}
        cardTitle={t({
          id: "sunshine.power-stability.saifi-trend",
          message: "Average Power Outage Frequency (SAIFI)",
        })}
      />
    </CardGrid>
  );
};

const PowerStability = (props: Props) => {
  const { query } = useRouter();
  const [state, setQueryState] = useQueryStateSunshineDetails();
  const { tab: activeTabQuery } = state;
  const activeTab = activeTabQuery ?? ("saidi" satisfies PowerStabilityTab);
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
      />
    </>
  );
};

export default PowerStability;
