import { Trans, t } from "@lingui/macro";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { ButtonGroup } from "src/components/button-group";
import CardGrid from "src/components/card-grid";
import CardSource from "src/components/card-source";
import { Combobox } from "src/components/combobox";
import ComparisonTable from "src/components/comparison-table";
import { DetailPageBanner } from "src/components/detail-page/banner";
import {
  DetailsPageLayout,
  DetailsPageHeader,
  DetailsPageSubtitle,
  DetailsPageTitle,
} from "src/components/detail-page/layout";
import { DetailsPageSidebar } from "src/components/detail-page/sidebar";
import UnitValueWithTrend from "src/components/unit-value-with-trend";
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
  getLocalizedLabel,
  getNetworkLevelLabels,
  getPeerGroupLabels,
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

  const props = await handleOperatorsEntity({
    id,
    locale: locale ?? defaultLocale,
    res,
  });

  const costsAndTariffs = await fetchOperatorCostsAndTariffsData(id);

  return {
    props: {
      ...props,
      costsAndTariffs: costsAndTariffs as SunshineCostsAndTariffsData,
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
  const [compareWith, setCompareWith] = useState(
    "sunshine.costs-and-tariffs.all-peer-group"
  );
  const [viewBy, setViewBy] = useState("latest");

  const {
    networkLevel,
    latestYear,
    operatorRate,
    peerGroupMedianRate,
    peerGroup,
    updateDate,
  } = props.costsAndTariffs;
  const { peerGroupLabel } = getPeerGroupLabels(peerGroup);
  const networkLabels = getNetworkLevelLabels(networkLevel);

  const operatorLabel = props.name;

  return (
    <>
      {/* Summary Cards */}
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
        {/* Peer group */}
        <Card sx={{ gridArea: "peer-group" }}>
          <CardContent>
            <Typography variant="h3" gutterBottom>
              <Trans id="sunshine.costs-and-tariffs.peer-group">
                Peer Group
              </Trans>
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              <Trans id="sunshine.costs-and-tariffs.latest-year">
                Latest year ({latestYear})
              </Trans>
            </Typography>
            <Typography variant="body1">{peerGroupLabel}</Typography>
          </CardContent>
        </Card>

        {/* Network costs */}
        <Card sx={{ gridArea: "network-costs" }}>
          <CardContent>
            <Typography variant="h3" gutterBottom>
              <Trans id="sunshine.costs-and-tariffs.network-costs-end-consumer">
                Network Costs at {networkLabels.long} Level
              </Trans>
            </Typography>
            <Typography
              variant="subtitle2"
              color="text.  secondary"
              gutterBottom
            >
              <Trans id="sunshine.costs-and-tariffs.latest-year">
                Latest year ({latestYear})
              </Trans>
            </Typography>
            <ComparisonTable size="small">
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Typography variant="body3" color="text.secondary">
                      <Trans id="sunshine.costs-and-tariffs.operator">
                        {operatorLabel}
                      </Trans>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <UnitValueWithTrend
                      value={operatorRate}
                      unit="Rp./km"
                      trend="stable"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="body3" color="text.secondary">
                      <Trans id="sunshine.costs-and-tariffs.median-peer-group">
                        Median Peer Group
                      </Trans>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <UnitValueWithTrend
                      value={peerGroupMedianRate}
                      unit="Rp./km"
                      trend="stable"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </ComparisonTable>
          </CardContent>
        </Card>

        {/* Network Cost Trend */}
        <Card sx={{ gridArea: "network-costs-trend" }}>
          <CardContent>
            <Typography variant="h3" gutterBottom>
              <Trans id="sunshine.costs-and-tariffs.network-cost-trend">
                Network Cost Trend
              </Trans>
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              mb={8}
            >
              <Trans id="sunshine.costs-and-tariffs.benchmarking-peer-group">
                Benchmarking within the Peer Group: {peerGroupLabel}
              </Trans>
            </Typography>

            {/* Dropdown Controls */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <ButtonGroup
                  id="view-by-button-group"
                  label={t({
                    id: "sunshine.costs-and-tariffs.view-by",
                    message: "View By",
                  })}
                  options={[
                    {
                      value: "latest",
                      label: (
                        <Trans id="sunshine.costs-and-tariffs.latest-year-option">
                          Latest year
                        </Trans>
                      ),
                    },
                    {
                      value: "progress",
                      label: (
                        <Trans id="sunshine.costs-and-tariffs.progress-over-time">
                          Progress over time
                        </Trans>
                      ),
                    },
                  ]}
                  value={viewBy}
                  setValue={setViewBy}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Combobox
                  id="compare-with-selection"
                  label={t({
                    id: "sunshine.costs-and-tariffs.compare-with",
                    message: "Compare With",
                  })}
                  items={[
                    "sunshine.costs-and-tariffs.all-peer-group",
                    "sunshine.costs-and-tariffs.selected-operators",
                  ]}
                  selectedItem={compareWith}
                  setSelectedItem={setCompareWith}
                  getItemLabel={(item) =>
                    getLocalizedLabel({
                      id: item,
                    })
                  }
                />
              </Grid>
            </Grid>

            {/* Scatter Plot */}
            <Box sx={{ height: 400, width: "100%" }}>
              {/* This is a placeholder for the ScatterPlot component */}
              <Typography color="text.secondary" sx={{ pt: 10 }}>
                <Trans id="sunshine.costs-and-tariffs.scatter-plot-description">
                  Scatter Plot visualization showing network costs across
                  different levels (End Consumer Level, Low Voltage
                  Distribution, Medium Voltage Distribution)
                </Trans>
              </Typography>

              {/* Implement your ScatterPlot component here */}
              {/* <ScatterPlot /> */}
            </Box>
            {/* Footer Info */}
            <CardSource date={`${updateDate}`} source={"Lindas "} />
          </CardContent>
        </Card>
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

      {activeTab === TabOption.NET_TARIFFS && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h5">
            <Trans id="sunshine.costs-and-tariffs.net-tariffs-content">
              Net Tariffs Content
            </Trans>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <Trans id="sunshine.costs-and-tariffs.under-development">
              This section is under development.
            </Trans>
          </Typography>
        </Box>
      )}

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
