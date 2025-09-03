import { t, Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback, useMemo } from "react";
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
import PeerGroupCard from "src/components/peer-group-card";
import { PowerStabilityCardState } from "src/components/power-stability-card";
import { SunshineDataServiceDebug } from "src/components/sunshine-data-service-debug";
import {
  PowerStabilityNavigation,
  PowerStabilityTab,
} from "src/components/sunshine-tabs";
import TableComparisonCard from "src/components/table-comparison-card";
import {
  DataServiceProps,
  handleOperatorsEntity,
  PageParams,
  Props as SharedPageProps,
} from "src/data/shared-page-props";
import { MIN_PER_YEAR } from "src/domain/metrics";
import {
  QueryStateSingleSunshineDetails,
  useQueryStateSunshineDetails,
} from "src/domain/query-states";
import { SunshinePowerStabilityData } from "src/domain/sunshine";
import { getLocalizedLabel } from "src/domain/translation";
import { useSaidiQuery, useSaifiQuery } from "src/graphql/queries";
import { Trend } from "src/graphql/resolver-types";
import { fetchPowerStability } from "src/lib/sunshine-data";
import {
  getSunshineDataServiceFromGetServerSidePropsContext,
  getSunshineDataServiceInfo,
} from "src/lib/sunshine-data-service-context";
import { defaultLocale } from "src/locales/config";
import { makePageTitle } from "src/utils/page-title";

type Props =
  | (Extract<SharedPageProps, { entity: "operator"; status: "found" }> & {
      powerStability: Omit<SunshinePowerStabilityData, "saidi" | "saifi">;
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

  const powerStability = await fetchPowerStability(sunshineDataService, {
    operatorId: id,
  });

  return {
    props: {
      ...operatorProps,
      powerStability,
      dataService,
    },
  };
};

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
        operator
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
        operator
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

  const [{ data }] = useSaidiQuery({
    variables: {
      filter: {
        operatorId: parseInt(props.id, 10),
        year: parseInt(latestYear, 10),
      },
    },
  });

  const yearlyObservations = useMemo(() => {
    const year = parseInt(latestYear, 10);
    return data?.saidi?.yearlyData?.filter((x) => x.year === year) ?? [];
  }, [data, latestYear]);

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
          <Trans id="sunshine.power-stability.median-peer-group">
            Median Peer Group
          </Trans>
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
    <>
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
        />

        <PowerStabilityCardState
          latestYear={Number(latestYear)}
          sx={{ gridArea: "trend" }}
          peerGroup={peerGroup}
          updateDate={updateDate}
          operatorId={props.id}
          operatorLabel={operatorLabel}
          observations={yearlyObservations}
          cardTitle={t({
            id: "sunshine.power-stability.saidi-trend",
            message: "Average Power Outage Duration (SAIDI)",
          })}
          infoDialogProps={{
            slug: "help-saidi",
            label: t({
              id: "sunshine.power-stability.saidi.info-dialog-label",
              message: "Total Outage Duration",
            }),
          }}
        />
      </CardGrid>
    </>
  );
};

const Saifi = (props: Extract<Props, { status: "found" }>) => {
  const {
    operator: { peerGroup },
    latestYear,
    updateDate,
  } = props.powerStability;

  const [{ data }] = useSaifiQuery({
    variables: {
      filter: {
        operatorId: parseInt(props.id, 10),
        year: parseInt(latestYear, 10),
      },
    },
  });

  const yearlyObservations = useMemo(() => {
    const year = parseInt(latestYear, 10);
    return data?.saifi?.yearlyData?.filter((x) => x.year === year) ?? [];
  }, [data, latestYear]);

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
          unit: MIN_PER_YEAR,
          round: 2,
          // TODO Compute the trend
          trend: Trend.Down,
        },
      },
      {
        label: (
          <Trans id="sunshine.power-stability.median-peer-group">
            Median Peer Group
          </Trans>
        ),
        value: {
          value: data.saifi.peerGroupTotal,
          unit: MIN_PER_YEAR,
          round: 2,
          // TODO Compute the trend
          trend: Trend.Stable,
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
        />

        <PowerStabilityCardState
          latestYear={Number(latestYear)}
          sx={{ gridArea: "trend" }}
          peerGroup={peerGroup}
          updateDate={updateDate}
          operatorId={props.id}
          operatorLabel={operatorLabel}
          observations={yearlyObservations}
          cardTitle={t({
            id: "sunshine.power-stability.saifi-trend",
            message: "Average Power Outage Frequency (SAIFI)",
          })}
          infoDialogProps={{
            slug: "help-saifi",
            label: t({
              id: "sunshine.power-stability.saifi.info-dialog-label",
              message: "Total Outage Frequency",
            }),
          }}
        />
      </CardGrid>
    </>
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
    event: React.SyntheticEvent,
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

export default PowerStability;
