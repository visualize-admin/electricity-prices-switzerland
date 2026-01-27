import { t, Trans } from "@lingui/macro";
import { Box, Card, CardContent, CardProps, Typography } from "@mui/material";
import React, { ReactNode } from "react";

import { ButtonGroup } from "src/components/button-group";
import CardSource from "src/components/card-source";
import { getInfoDialogProps } from "src/components/info-dialog-props";
import { createColorMapping } from "src/domain/color-mapping";
import { filterBySeparator } from "src/domain/helpers";
import {
  CompareWithFilter,
  useQueryStateNetworkCostsTrendCardFilters,
  ViewByFilter,
} from "src/domain/query-states";
import {
  isPeerGroupRow,
  PeerGroup,
  CostsAndTariffsData,
} from "src/domain/sunshine";
import { getLocalizedLabel, getPeerGroupLabels } from "src/domain/translation";

import { CardHeader } from "./detail-page/card";
import { Download, DownloadImage } from "./detail-page/download-image";
import { InfoDialogButtonProps } from "./info-dialog";
import { NetworkCostTrendChart } from "./network-cost-trend-chart";
import { OverviewCard } from "./overview-card";
import { ItemMultiCombobox } from "./query-combobox";

const DOWNLOAD_ID: Download = "costs-and-tariffs";

type NetworkCostsTrendCardProps = {
  peerGroup: PeerGroup;
  updateDate: string;
  networkCosts: CostsAndTariffsData["networkCosts"];
  operatorId: string;
  operatorLabel: string;
  latestYear: number;
  state: ReturnType<typeof useQueryStateNetworkCostsTrendCardFilters>[0];
  setQueryState: ReturnType<
    typeof useQueryStateNetworkCostsTrendCardFilters
  >[1];
  infoDialogProps?: Pick<InfoDialogButtonProps, "slug" | "label">;
} & CardProps;

export type NetworkCostsTrendCardFilters = {
  compareWith?: CompareWithFilter;
  viewBy?: ViewByFilter;
};

// TODO See if can be shared with other cards
// like getTariffsTrendCardState
const getNetworkCostsTrendCardState = (
  props: Omit<NetworkCostsTrendCardProps, "state" | "setQueryState">,
  filters: NetworkCostsTrendCardFilters
) => {
  const {
    peerGroup,
    updateDate,
    networkCosts,
    operatorId,
    operatorLabel,
    latestYear,
    infoDialogProps,
  } = props;
  const { peerGroupLabel } = getPeerGroupLabels(peerGroup);
  const { yearlyData, ...restNetworkCosts } = networkCosts;
  const { observations, multiComboboxOptions } = React.useMemo(() => {
    const multiComboboxOptions: typeof yearlyData = [];
    const observations: typeof yearlyData = [];
    yearlyData.forEach((d) => {
      const isLatestYear = d.year === latestYear;
      const operatorIdStr = d.operator_id.toString();
      const isSelected =
        filters.compareWith?.includes("sunshine.select-all") ||
        filters.compareWith?.includes(operatorIdStr) ||
        operatorIdStr === operatorId ||
        isPeerGroupRow(d);
      if ((filters.viewBy === "latest" ? isLatestYear : true) && isSelected) {
        observations.push(d);
      }
      if (isLatestYear && operatorIdStr !== operatorId) {
        multiComboboxOptions.push(d);
      }
    });
    return { observations, multiComboboxOptions };
  }, [yearlyData, filters, latestYear, operatorId]);
  return {
    peerGroupLabel,
    observations,
    multiComboboxOptions,
    restNetworkCosts,
    updateDate,
    operatorId,
    operatorLabel,
    infoDialogProps,
  };
};

export const NetworkCostsTrendCardState = (
  props: Omit<NetworkCostsTrendCardProps, "state" | "setQueryState">
) => {
  const [state, setQueryState] = useQueryStateNetworkCostsTrendCardFilters();
  return (
    <NetworkCostsTrendCard
      {...props}
      state={state}
      setQueryState={setQueryState}
    />
  );
};

export const NetworkCostsTrendCard: React.FC<NetworkCostsTrendCardProps> = (
  props
) => {
  const { state, setQueryState } = props;
  const { compareWith, viewBy } = state;
  const chartData = getNetworkCostsTrendCardState(props, state);
  const {
    peerGroupLabel,
    observations,
    multiComboboxOptions,
    restNetworkCosts,
    updateDate,
    operatorId,
    operatorLabel,
  } = chartData;
  return (
    <Card {...props} id={DOWNLOAD_ID}>
      <CardContent>
        <CardHeader
          trailingContent={
            <>
              <DownloadImage
                iconOnly
                iconSize={24}
                elementId={DOWNLOAD_ID}
                fileName={DOWNLOAD_ID}
                downloadType={DOWNLOAD_ID}
              />
            </>
          }
        >
          <Typography variant="h3">
            <Trans id="sunshine.costs-and-tariffs.network-cost-trend">
              Network Cost Trend
            </Trans>
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <Trans id="sunshine.costs-and-tariffs.benchmarking-peer-group">
              Benchmarking within the Peer Group: {peerGroupLabel}
            </Trans>
          </Typography>
        </CardHeader>
        {/* Dropdown Controls */}
        <Box
          sx={{
            mb: 3,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "1fr 1fr",
            },
            gap: 4,
            overflow: "hidden",
          }}
        >
          <Box width="100%">
            <ButtonGroup
              id="view-by-button-group"
              label={getLocalizedLabel({
                id: "costs-and-tariffs.view-by",
              })}
              fitLabelToContent
              options={[
                {
                  value: "latest",
                  label: getLocalizedLabel({
                    id: "costs-and-tariffs.latest-year-option",
                  }),
                },
                {
                  value: "progress",
                  label: getLocalizedLabel({
                    id: "costs-and-tariffs.progress-over-time",
                  }),
                },
              ]}
              value={viewBy}
              asSelect="on-mobile"
              setValue={(value) =>
                setQueryState({ ...state, viewBy: value as ViewByFilter })
              }
            />
          </Box>
          <div>
            <ItemMultiCombobox
              colorMapping={createColorMapping(compareWith, "elcom2")}
              label={t({
                id: "sunshine.costs-and-tariffs.compare-with",
                message: "Compare With",
              })}
              InputProps={
                compareWith.length === 0
                  ? {
                      placeholder: t({
                        id: "sunshine.costs-and-tariffs.compare-with-placeholder",
                        message: "Select operators to compare",
                      }),
                    }
                  : {}
              }
              items={multiComboboxOptions.map((item) => {
                return {
                  id: String(item.operator_id),
                  name: item.operator_name,
                };
              })}
              selectedItems={compareWith}
              setSelectedItems={(items) =>
                setQueryState({
                  ...state,
                  compareWith: filterBySeparator(
                    items,
                    compareWith ?? [],
                    "sunshine.select-all"
                  ),
                })
              }
            />
          </div>
        </Box>
        <NetworkCostTrendChart
          rootProps={{
            sx: {
              mt: 8,
            },
          }}
          id={operatorId}
          operatorLabel={operatorLabel}
          observations={observations}
          networkCosts={restNetworkCosts}
          viewBy={viewBy}
          compareWith={compareWith}
          colorMapping={createColorMapping(compareWith, "elcom2")}
        />
        {/* Footer Info */}
        <CardSource date={`${updateDate}`} source={"Lindas"} />
      </CardContent>
    </Card>
  );
};

export const NetworkCostsTrendCardMinified: React.FC<
  Omit<
    NetworkCostsTrendCardProps,
    "infoDialogProps" | "state" | "setQueryState"
  > & {
    linkContent?: ReactNode;
    filters?: NetworkCostsTrendCardFilters;
    cardDescription?: ReactNode;
  }
> = (props) => {
  const { filters: defaultFilters, cardDescription, ...rest } = props;
  const [state] = useQueryStateNetworkCostsTrendCardFilters({
    defaultValue: defaultFilters,
  });
  const { viewBy } = state;
  const chartData = getNetworkCostsTrendCardState(rest, state);
  const { networkCosts: _networkCosts, ...overviewCardProps } = rest;

  return (
    <OverviewCard
      {...overviewCardProps}
      title={
        <Trans id="sunshine.costs-and-tariffs.network-cost-trend.overview">
          Network Costs
        </Trans>
      }
      description={cardDescription}
      chart={
        <NetworkCostTrendChart
          rootProps={{ sx: { mt: 2 } }}
          id={chartData.operatorId}
          operatorLabel={chartData.operatorLabel}
          observations={chartData.observations}
          networkCosts={chartData.restNetworkCosts}
          viewBy={viewBy}
          compareWith={[]}
        />
      }
      linkContent={props.linkContent}
      infoDialogProps={getInfoDialogProps("help-network-costs")}
    />
  );
};
