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
import { fetchOperationalStandards } from "src/lib/db/sunshine-data";
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

  const operationalStandards = await fetchOperationalStandards(id);

  return {
    props: {
      ...operatorProps,
      operationalStandards,
    },
  };
};

const ProductVariety = (props: Extract<Props, { status: "found" }>) => {
  const {
    operator: { peerGroup },
    latestYear,
  } = props.operationalStandards;

  const data = props.operationalStandards;

  const comparisonCardProps = {
    title: (
      <Trans id="sunshine.operational-standards.product-variety.comparison-card-title">
        Product Variety
      </Trans>
    ),
    subtitle: (
      <Trans id="sunshine.product-variety.latest-year">
        Latest year ({latestYear})
      </Trans>
    ),
    rows: [
      {
        label: (
          <Trans id="sunshine.product-variety.eco-friendly-products-offered">
            Eco-friendly products offered
          </Trans>
        ),
        value: {
          value: `${data.productVariety.ecoFriendlyProductsOffered}`,
        },
      },
      {
        label: (
          <Trans id="sunshine.product-variety.product-combinations-options">
            Product combination options
          </Trans>
        ),
        value: {
          value: data.productVariety.productCombinationsOptions ? (
            <Trans id="sunshine.product-variety.product-combinations-options.yes">
              Yes
            </Trans>
          ) : (
            <Trans id="sunshine.product-variety.product-combinations-options.no">
              No
            </Trans>
          ),
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

const ServiceQuality = (props: Extract<Props, { status: "found" }>) => {
  const {
    operator: { peerGroup },
    latestYear,
  } = props.operationalStandards;

  const data = props.operationalStandards;

  const comparisonCardProps = {
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

const Compliance = (props: Extract<Props, { status: "found" }>) => {
  const {
    operator: { peerGroup },
    latestYear,
  } = props.operationalStandards;

  const data = props.operationalStandards;

  const comparisonCardProps = {
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
  const [activeTab, setActiveTab] = useState<OperationalStandardsTabOption>(
    OperationalStandardsTabOption.PRODUCT_VARIETY
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

      {activeTab === OperationalStandardsTabOption.PRODUCT_VARIETY && (
        <ProductVariety {...props} />
      )}
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
