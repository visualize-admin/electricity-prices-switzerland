import { t, Trans } from "@lingui/macro";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";
import { useRouter } from "next/router";
import React, { useState } from "react";

import CardGrid from "src/components/card-grid";
import { DetailPageBanner } from "src/components/detail-page/banner";
import {
  DetailsPageHeader,
  DetailsPageLayout,
  DetailsPageSubtitle,
  DetailsPageTitle,
} from "src/components/detail-page/layout";
import { DetailsPageSidebar } from "src/components/detail-page/sidebar";
import OperationalStandardsCard from "src/components/operational-standards-card";
import PeerGroupCard from "src/components/peer-group-card";
import {
  OperationalStandardsNavigation,
  OperationalStandardsTabOption,
} from "src/components/sunshine-tabs";
import TableComparisonCard from "src/components/table-comparison-card";
import {
  handleOperatorsEntity,
  PageParams,
  Props as SharedPageProps,
} from "src/data/shared-page-props";
import { SunshineOperationalStandardsData } from "src/domain/data";
import { getLocalizedLabel } from "src/domain/translation";
import { fetchOperationalStandards } from "src/lib/sunshine-data";
import { defaultLocale } from "src/locales/config";

type Props =
  | (Extract<SharedPageProps, { entity: "operator"; status: "found" }> & {
      operationalStandards: SunshineOperationalStandardsData;
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

  const operationalStandards = await fetchOperationalStandards({
    operatorId: id,
  });

  return {
    props: {
      ...operatorProps,
      operationalStandards,
    },
  };
};

export const prepServiceQualityCardProps = (
  props: Extract<Props, { status: "found" }>
) => {
  const { latestYear } = props.operationalStandards;
  const data = props.operationalStandards;
  return {
    title: (
      <Trans id="sunshine.operational-standards.service-quality.comparison-card-title">
        Service Quality
      </Trans>
    ),
    subtitle: (
      <Trans id="sunshine.service-quality.latest-year">
        Latest year ({latestYear})
      </Trans>
    ),
    rows: [
      {
        label: (
          <Trans id="sunshine.service-quality.eco-friendly-products-offered">
            Informing customers about power outages
          </Trans>
        ),
        value: {
          value: `${data.serviceQuality.informingCustomersOfOutage}` ? (
            <Trans id="sunshine.service-quality.informing-customers-outage.yes">
              Yes
            </Trans>
          ) : (
            <Trans id="sunshine.service-quality.informing-customers-outage.no">
              No
            </Trans>
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
          value: `${data.serviceQuality.notificationPeriodDays}`,
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
          {...prepServiceQualityCardProps(props)}
          sx={{ gridArea: "comparison" }}
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
    </>
  );
};

export const prepComplianceCardProps = (
  props: Extract<Props, { status: "found" }>
) => {
  const { latestYear } = props.operationalStandards;
  const data = props.operationalStandards;
  return {
    title: (
      <Trans id="sunshine.operational-standards.compliance.comparison-card-title">
        Compliance
      </Trans>
    ),
    subtitle: (
      <Trans id="sunshine.compliance.latest-year">
        Latest year ({latestYear})
      </Trans>
    ),
    rows: [
      {
        label: (
          <Trans id="sunshine.compliance.francs-rule-regulation">
            75 Francs Rule Regulation
          </Trans>
        ),
        value: {
          // TODO Translate
          value: `${data.compliance.francsRule}`,
        },
      },
      {
        label: (
          <Trans id="sunshine.compliance.notification-period">
            Notification Days in Advance
          </Trans>
        ),
        value: {
          value: `${data.compliance.timelyPaperSubmission}` ? (
            <Trans id="sunshine.compliance.timely-paper-submission.yes">
              Yes
            </Trans>
          ) : (
            <Trans id="sunshine.compliance.timely-paper-submission.no">
              No
            </Trans>
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
          {...prepComplianceCardProps(props)}
          sx={{ gridArea: "comparison" }}
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
    </>
  );
};

const PowerStability = (props: Props) => {
  const { query } = useRouter();
  const [activeTab, setActiveTab] = useState<OperationalStandardsTabOption>(
    OperationalStandardsTabOption.SERVICE_QUALITY
  );

  if (props.status === "notfound") {
    return <ErrorPage statusCode={404} />;
  }

  const { id, name, entity } = props;

  const pageTitle = `${getLocalizedLabel({ id: entity })} ${name} – ${t({
    id: "sunshine.power-stability.title",
    message: "Power Stability",
  })}`;

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
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
        activeTab={activeTab}
        handleTabChange={handleTabChange}
      />

      {activeTab === OperationalStandardsTabOption.SERVICE_QUALITY && (
        <ServiceQuality {...props} />
      )}
      {activeTab === OperationalStandardsTabOption.COMPLIANCE && (
        <Compliance {...props} />
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
