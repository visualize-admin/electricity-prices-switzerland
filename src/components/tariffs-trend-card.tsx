import { t, Trans } from "@lingui/macro";
import { Card, CardContent, CardProps, Grid, Typography } from "@mui/material";
import React, { ReactNode } from "react";

import { ButtonGroup } from "src/components/button-group";
import CardSource from "src/components/card-source";
import { infoDialogProps } from "src/components/info-dialog-props";
import { getPalette } from "src/domain/helpers";
import { useQueryStateTariffsTrendCardFilters } from "src/domain/query-states";
import { PeerGroup, SunshineCostsAndTariffsData } from "src/domain/sunshine";
import { getLocalizedLabel, getPeerGroupLabels } from "src/domain/translation";

import { CardHeader } from "./detail-page/card";
import { Download, DownloadImage } from "./detail-page/download-image";
import { InfoDialogButton, InfoDialogButtonProps } from "./info-dialog";
import { OverviewCard } from "./overview-card";
import { ViewByFilter } from "./power-stability-card";
import { AllOrMultiCombobox } from "./query-combobox";
import { TariffsTrendChart } from "./tariffs-trend-chart";

const DOWNLOAD_ID: Download = "costs-and-tariffs";

type TariffsTrendCardProps = {
  peerGroup: PeerGroup;
  updateDate: string;
  netTariffs: SunshineCostsAndTariffsData["netTariffs"];
  operatorId: string;
  operatorLabel: string;
  latestYear: number;
  cardTitle: React.ReactNode;
  infoDialogProps: Pick<InfoDialogButtonProps, "slug" | "label">;
} & Omit<CardProps, "title">;

export type TariffsTrendCardFilters = {
  compareWith?: string[];
  viewBy?: ViewByFilter;
};

const getTariffsTrendCardState = (
  props: Omit<TariffsTrendCardProps, "cardTitle" | "infoDialogProps">,
  filters: TariffsTrendCardFilters
) => {
  const {
    peerGroup,
    updateDate,
    netTariffs,
    operatorId,
    operatorLabel,
    latestYear,
  } = props;
  const { peerGroupLabel } = getPeerGroupLabels(peerGroup);
  const { yearlyData, ...restNetTariffs } = netTariffs;
  const { observations, multiComboboxOptions } = React.useMemo(() => {
    const multiComboboxOptions: typeof yearlyData = [];
    const observations: typeof yearlyData = [];
    yearlyData.forEach((d) => {
      const isLatestYear = d.period === latestYear;
      const operatorIdStr = d.operator_id.toString();
      const isSelected =
        filters.compareWith?.includes("sunshine.select-all") ||
        filters.compareWith?.includes(operatorIdStr) ||
        operatorIdStr === operatorId;
      if ((filters.viewBy === "latest" ? isLatestYear : true) && isSelected) {
        observations.push(d);
      }
      if (isLatestYear && operatorIdStr !== operatorId) {
        multiComboboxOptions.push(d);
      }
    });
    return { observations, multiComboboxOptions };
  }, [yearlyData, filters.compareWith, latestYear, operatorId, filters.viewBy]);
  return {
    peerGroupLabel,
    observations,
    multiComboboxOptions,
    restNetTariffs,
    updateDate,
    operatorId,
    operatorLabel,
  };
};

export const TariffsTrendCard: React.FC<TariffsTrendCardProps> = (props) => {
  const [state, setQueryState] = useQueryStateTariffsTrendCardFilters();
  const { compareWith, viewBy } = state;
  const chartData = getTariffsTrendCardState(props, state);
  const {
    peerGroupLabel,
    observations,
    multiComboboxOptions,
    restNetTariffs,
    updateDate,
    operatorId,
    operatorLabel,
  } = chartData;
  const { cardTitle: title, infoDialogProps, ...cardProps } = props;
  return (
    <Card {...cardProps} id={DOWNLOAD_ID}>
      <CardContent>
        <CardHeader
          trailingContent={
            <>
              <InfoDialogButton
                iconOnly
                iconSize={24}
                type="outline"
                {...infoDialogProps}
              />
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
          <Typography variant="h3">{title}</Typography>
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
        </CardHeader>
        {/* Dropdown Controls */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid
            item
            xs={12}
            sm={6}
            sx={{
              mt: 2.5,
            }}
          >
            <ButtonGroup
              id="view-by-button-group"
              label={getLocalizedLabel({
                id: "costs-and-tariffs.view-by",
              })}
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
              setValue={(value) =>
                setQueryState({ ...state, viewBy: value as ViewByFilter })
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <AllOrMultiCombobox
              label={t({
                id: "sunshine.costs-and-tariffs.compare-with",
                message: "Compare With",
              })}
              colorful={
                compareWith?.includes("sunshine.select-all")
                  ? undefined
                  : getPalette("elcom2")
              }
              items={[
                { id: "sunshine.select-all" },
                ...multiComboboxOptions.map((item) => {
                  return {
                    id: String(item.operator_id),
                    name: item.operator_name,
                  };
                }),
              ]}
              selectedItems={compareWith}
              setSelectedItems={(items) =>
                setQueryState({ ...state, compareWith: items })
              }
            />
          </Grid>
        </Grid>
        <TariffsTrendChart
          id={operatorId}
          operatorLabel={operatorLabel}
          observations={observations}
          netTariffs={restNetTariffs}
          viewBy={viewBy}
          compareWith={compareWith}
          rootProps={{
            sx: {
              mt: 8,
            },
          }}
        />
        {/* Footer Info */}
        <CardSource date={`${updateDate}`} source={"Lindas"} />
      </CardContent>
    </Card>
  );
};

export const TariffsTrendCardMinified: React.FC<
  Omit<TariffsTrendCardProps, "infoDialogProps"> & {
    linkContent?: ReactNode;
    filters?: TariffsTrendCardFilters;
    cardDescription?: ReactNode;
    indicator: "energyTariffs" | "netTariffs";
  }
> = (props) => {
  const {
    filters: defaultFilters,
    cardTitle,
    cardDescription,
    ...rest
  } = props;
  const [state] = useQueryStateTariffsTrendCardFilters({
    defaultValue: defaultFilters,
  });
  const { viewBy } = state;
  const chartData = getTariffsTrendCardState(rest, state);
  return (
    <OverviewCard
      {...rest}
      title={cardTitle}
      description={cardDescription}
      chart={
        <TariffsTrendChart
          id={chartData.operatorId}
          operatorLabel={chartData.operatorLabel}
          observations={chartData.observations}
          netTariffs={chartData.restNetTariffs}
          viewBy={viewBy}
          compareWith={[]}
          rootProps={{ sx: { mt: 2 } }}
        />
      }
      linkContent={props.linkContent}
      infoDialogProps={
        props.indicator === "netTariffs"
          ? infoDialogProps["help-net-tariffs"]
          : props.indicator === "energyTariffs"
          ? infoDialogProps["help-energy-tariffs"]
          : ({
              label: "",
              slug: "",
            } as never)
      }
    />
  );
};
