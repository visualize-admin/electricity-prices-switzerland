import { t, Trans } from "@lingui/macro";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";
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
import PowerStabilityCard from "src/components/power-stability-card";
import {
  PowerStabilityNavigation,
  PowerStabilityTab,
} from "src/components/sunshine-tabs";
import TableComparisonCard from "src/components/table-comparison-card";
import {
  handleOperatorsEntity,
  PageParams,
  Props as SharedPageProps,
} from "src/data/shared-page-props";
import { SunshinePowerStabilityData } from "src/domain/data";
import { MIN_PER_YEAR } from "src/domain/metrics";
import { getLocalizedLabel } from "src/domain/translation";
import { useSaidiQuery, useSaifiQuery } from "src/graphql/queries";
import { Trend } from "src/graphql/resolver-types";
import { fetchPowerStability } from "src/lib/db/sunshine-data";
import {
  QueryStateSingleSunshineDetails,
  useQueryStateSunshineDetails,
} from "src/lib/use-query-state";
import { defaultLocale } from "src/locales/config";

type Props =
  | (Extract<SharedPageProps, { entity: "operator"; status: "found" }> & {
      powerStability: Omit<SunshinePowerStabilityData, "saidi" | "saifi">;
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

  const powerStability = await fetchPowerStability({ operatorId: id });

  return {
    props: {
      ...operatorProps,
      powerStability,
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

const useSaidiOrSaifiByAttribute = {
  saidi: useSaidiQuery,
  saifi: useSaifiQuery,
} as const;

const SaidiSaifi = (
  props: Extract<Props, { status: "found" }> & { attribute: "saidi" | "saifi" }
) => {
  const {
    operator: { peerGroup },
    latestYear,
    updateDate,
  } = props.powerStability;
  const { attribute } = props;

  const useQuery = useSaidiOrSaifiByAttribute[attribute];
  const [queryState] = useQuery({
    variables: {
      filter: {
        operatorId: parseInt(props.id, 10),
        year: parseInt(latestYear, 10),
      },
    },
  });

  const data = queryState.data
    ? "saidi" in queryState?.data
      ? queryState.data.saidi
      : "saifi" in queryState?.data
      ? queryState.data.saifi
      : null
    : null;
  const yearlyObservations = useMemo(() => {
    const year = parseInt(latestYear, 10);
    return data?.["yearlyData"].filter((x) => x.year === year) ?? [];
  }, [data, latestYear]);

  if (!data) {
    return null;
  }

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
          value: data.operatorTotal,
          unit: MIN_PER_YEAR,

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
          value: data.peerGroupTotal,
          unit: MIN_PER_YEAR,

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

        <PowerStabilityCard
          latestYear={Number(latestYear)}
          sx={{ gridArea: "trend" }}
          peerGroup={peerGroup}
          updateDate={updateDate}
          operatorId={props.id}
          operatorLabel={operatorLabel}
          observations={yearlyObservations}
          attribute={attribute}
        />
      </CardGrid>
    </>
  );
};

const PowerStability = (props: Props) => {
  const { query } = useRouter();
  const [{ tab: activeTab }, setQueryState] = useQueryStateSunshineDetails();
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

      {activeTab === "saidi" && <SaidiSaifi attribute="saidi" {...props} />}
      {activeTab === "saifi" && <SaidiSaifi attribute="saifi" {...props} />}
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
