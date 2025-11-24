import { t, Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import ErrorPage from "next/error";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

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
import OperationalStandardsCard from "src/components/operational-standards-card";
import PeerGroupCard from "src/components/peer-group-card";
import { SessionConfigDebug } from "src/components/session-config-debug";
import {
  OperationalStandardsNavigation,
  OperationalStandardsTab,
} from "src/components/sunshine-tabs";
import TableComparisonCard from "src/components/table-comparison-card";
import {
  SessionConfigDebugProps,
  getOperatorsPageProps,
  PageParams,
  Props as SharedPageProps,
} from "src/data/shared-page-props";
import { useQueryStateSunshineDetails } from "src/domain/query-states";
import { SunshineOperationalStandardsData } from "src/domain/sunshine";
import { getLocalizedLabel } from "src/domain/translation";
import { fetchOperationalStandards } from "src/lib/sunshine-data";
import { defaultLocale } from "src/locales/config";
import createGetServerSideProps from "src/utils/create-server-side-props";
import { makePageTitle } from "src/utils/page-title";

type Props =
  | (Extract<SharedPageProps, { entity: "operator"; status: "found" }> & {
      operationalStandards: SunshineOperationalStandardsData;
      sessionConfig: SessionConfigDebugProps;
    })
  | { status: "notfound" };

export const getServerSideProps = createGetServerSideProps<Props, PageParams>(
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

    const operationalStandards = await fetchOperationalStandards(
      sunshineDataService,
      {
        operatorId: id,
      }
    );

    return {
      props: {
        ...operatorProps,
        operationalStandards,
        sessionConfig,
      },
    };
  }
);

export const prepServiceQualityCardProps = (
  serviceQuality: Extract<
    Props,
    { status: "found" }
  >["operationalStandards"]["serviceQuality"],
  year: number,
  isLatestYear: boolean = true
) => {
  return {
    title: (
      <Trans id="sunshine.operational-standards.service-quality.comparison-card-title">
        Service Quality
      </Trans>
    ),
    subtitle: isLatestYear ? (
      <Trans id="sunshine.service-quality.latest-year">
        Latest year ({year})
      </Trans>
    ) : null,
    rows: [
      {
        label: (
          <Trans id="sunshine.service-quality.informing-customers-outage">
            Informing customers about power outages
          </Trans>
        ),
        value: {
          value: (
            <Typography variant="inherit" fontWeight="bold">
              {serviceQuality.informingCustomersOfOutage ? (
                <Trans id="sunshine.service-quality.informing-customers-outage.yes">
                  Yes
                </Trans>
              ) : (
                <Trans id="sunshine.service-quality.informing-customers-outage.no">
                  No
                </Trans>
              )}
            </Typography>
          ),
        },
      },
      {
        label: (
          <Trans id="sunshine.service-quality.notification-period">
            Notification Days in Advance
          </Trans>
        ),
        value: {
          value: (
            <Typography variant="inherit" fontWeight="bold">
              {serviceQuality.notificationPeriodDays}
            </Typography>
          ),
        },
      },
    ],
  } satisfies React.ComponentProps<typeof TableComparisonCard>;
};

const ServiceQuality = (props: Extract<Props, { status: "found" }>) => {
  const {
    operator: { peerGroup },
    latestYear,
    updateDate,
  } = props.operationalStandards;

  const data = props.operationalStandards;
  const operatorLabel = props.name;

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
        {...prepServiceQualityCardProps(
          props.operationalStandards.serviceQuality,
          Number(latestYear),
          true
        )}
        sx={{ gridArea: "comparison" }}
        infoDialogProps={getInfoDialogProps("help-service-quality")}
      />

      <OperationalStandardsCard
        sx={{ gridArea: "trend" }}
        peerGroup={peerGroup}
        updateDate={updateDate}
        operatorId={props.id}
        operatorLabel={operatorLabel}
        operationalStandards={data.serviceQuality}
        attribute="serviceQuality"
      />
    </CardGrid>
  );
};

export const prepComplianceCardProps = (
  compliance: Extract<
    Props,
    { status: "found" }
  >["operationalStandards"]["compliance"],
  year: number,
  isLatestYear: boolean = true
) => {
  return {
    title: (
      <Trans id="sunshine.operational-standards.compliance.comparison-card-title">
        Compliance
      </Trans>
    ),
    subtitle: isLatestYear ? (
      <Trans id="sunshine.compliance.latest-year">Latest year ({year})</Trans>
    ) : null,
    rows: [
      {
        label: (
          <Trans id="sunshine.compliance.francs-rule-regulation">
            75 Francs Rule Regulation
          </Trans>
        ),
        value: {
          // TODO Translate
          value: (
            <Typography variant="inherit" fontWeight="bold">
              {compliance.francsRule}
            </Typography>
          ),
        },
      },
      {
        label: (
          <Trans id="sunshine.compliance.timely-paper-submission">
            Timely Paper Submission
          </Trans>
        ),

        value: {
          // TODO Translate
          value: (
            <Typography variant="inherit" fontWeight="bold">
              {compliance.timelyPaperSubmission ? (
                <Trans id="sunshine.compliance.timely-paper-submission.yes">
                  Yes
                </Trans>
              ) : (
                <Trans id="sunshine.compliance.timely-paper-submission.no">
                  No
                </Trans>
              )}
            </Typography>
          ),
        },
      },
    ],
  } satisfies React.ComponentProps<typeof TableComparisonCard>;
};

const Compliance = (props: Extract<Props, { status: "found" }>) => {
  const {
    operator: { peerGroup },
    latestYear,
    updateDate,
  } = props.operationalStandards;

  const data = props.operationalStandards;
  const operatorLabel = props.name;

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
        {...prepComplianceCardProps(
          props.operationalStandards.compliance,
          Number(props.operationalStandards.latestYear),
          true
        )}
        sx={{ gridArea: "comparison" }}
        infoDialogProps={getInfoDialogProps("help-compliance")}
      />

      <OperationalStandardsCard
        sx={{ gridArea: "trend" }}
        peerGroup={peerGroup}
        updateDate={updateDate}
        operatorId={props.id}
        operatorLabel={operatorLabel}
        operationalStandards={data.compliance}
        attribute="compliance"
      />
    </CardGrid>
  );
};

const OperationalStandards = (props: Props) => {
  const { query } = useRouter();
  const [{ tab: _tab }, setQueryState] = useQueryStateSunshineDetails();
  const tab = ((_tab as OperationalStandardsTab) ??
    "outageInfo") satisfies OperationalStandardsTab;

  if (props.status === "notfound") {
    return <ErrorPage statusCode={404} />;
  }

  const { id, name, entity } = props;

  const pageTitle = `${getLocalizedLabel({ id: entity })} ${name} – ${t({
    id: "sunshine.power-stability.title",
    message: "Power Stability",
  })}`;

  const handleTabChange = (
    _: React.SyntheticEvent,
    newValue: OperationalStandardsTab
  ) => {
    setQueryState({ tab: newValue });
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
              id: "sunshine.operational-standards.title",
              message: "Operational Standards",
            })
          )}
        </title>
      </Head>
      <DetailsPageHeader>
        <DetailsPageTitle>
          <Trans id="sunshine.operational-standards.title">
            Operational Standards
          </Trans>
        </DetailsPageTitle>
        <DetailsPageSubtitle>
          <Trans id="sunshine.operational-standards.description">
            The Operational Standards page evaluates key performance indicators
            that highlight the quality of service provided by electricity
            companies. These indicators include Product Variety, measuring the
            range of eco-friendly and combined energy products offered; Service
            Quality, assessing how well companies inform consumers about planned
            electricity interruptions and the notice period provided; and
            Compliance, ensuring adherence to the 75 francs rule and the timely
            submission of official documents to the Federal Electricity
            Commission (ElCom).
          </Trans>
        </DetailsPageSubtitle>
      </DetailsPageHeader>

      {/* Tab Navigation */}
      <OperationalStandardsNavigation
        activeTab={tab}
        handleTabChange={handleTabChange}
      />

      {tab === "outageInfo" && <ServiceQuality {...props} />}
      {tab === "compliance" && <Compliance {...props} />}
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

export default OperationalStandards;
