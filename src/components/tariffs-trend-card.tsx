import { Trans, t } from "@lingui/macro";
import {
  Card,
  CardContent,
  CardProps,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import React, { ReactNode, useMemo, useState } from "react";

import { ButtonGroup } from "src/components/button-group";
import CardSource from "src/components/card-source";
import { PeerGroup, SunshineCostsAndTariffsData } from "src/domain/data";
import { filterBySeparator } from "src/domain/helpers";
import { getPeerGroupLabels } from "src/domain/translation";

import { CardHeader } from "./detail-page/card";
import { Download, DownloadImage } from "./detail-page/download-image";
import { InfoDialogButton, InfoDialogButtonProps } from "./info-dialog";
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

const useTariffsTrendCard = (
  props: Omit<TariffsTrendCardProps, "cardTitle" | "infoDialogProps">,
  filters?: TariffsTrendCardFilters
) => {
  const {
    peerGroup,
    updateDate,
    netTariffs,
    operatorId,
    operatorLabel,
    latestYear,
  } = props;
  const [compareWith, setCompareWith] = useState(
    filters?.compareWith ?? ["sunshine.select-all"]
  );
  const [viewBy, setViewBy] = useState<ViewByFilter>(
    filters?.viewBy ?? "latest"
  );
  const { peerGroupLabel } = getPeerGroupLabels(peerGroup);
  const { yearlyData, ...restNetTariffs } = netTariffs;

  const { chartData, multiComboboxOptions } = useMemo(() => {
    const multiComboboxOptions: typeof yearlyData = [];
    const chartData: typeof yearlyData = [];

    yearlyData.forEach((d) => {
      const isLatestYear = d.period === latestYear;
      const operatorIdStr = d.operator_id.toString();
      const isSelected =
        compareWith.includes("sunshine.select-all") ||
        compareWith.includes(operatorIdStr) ||
        operatorIdStr === operatorId;
      if ((viewBy === "latest" ? isLatestYear : true) && isSelected) {
        chartData.push(d);
      }
      if (isLatestYear && operatorIdStr !== operatorId) {
        multiComboboxOptions.push(d);
      }
    });
    return { chartData, multiComboboxOptions };
  }, [yearlyData, compareWith, latestYear, operatorId, viewBy]);
  return {
    compareWith,
    setCompareWith,
    viewBy,
    setViewBy,
    peerGroupLabel,
    chartData,
    multiComboboxOptions,
    restNetTariffs,
    updateDate,
    operatorId,
    operatorLabel,
  };
};

export const TariffsTrendCard: React.FC<TariffsTrendCardProps> = (props) => {
  const logic = useTariffsTrendCard(props);
  const {
    compareWith,
    setCompareWith,
    viewBy,
    setViewBy,
    peerGroupLabel,
    chartData,
    multiComboboxOptions,
    restNetTariffs,
    updateDate,
    operatorId,
    operatorLabel,
  } = logic;
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
            <AllOrMultiCombobox
              label={t({
                id: "sunshine.costs-and-tariffs.compare-with",
                message: "Compare With",
              })}
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
                setCompareWith((prev) =>
                  filterBySeparator(items, prev, "sunshine.select-all")
                )
              }
            />
          </Grid>
        </Grid>
        {/* Scatter Plot */}
        <TariffsTrendChart
          id={operatorId}
          operatorLabel={operatorLabel}
          observations={chartData}
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
  }
> = (props) => {
  const { filters, cardTitle, cardDescription, ...rest } = props;
  const logic = useTariffsTrendCard(rest, filters);
  const { chartData, restNetTariffs, operatorId, operatorLabel } = logic;
  return (
    <Card {...rest}>
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          height: "100%",
        }}
      >
        <Typography variant="h3">{cardTitle}</Typography>
        <Typography variant="body2">{cardDescription}</Typography>
        <TariffsTrendChart
          id={operatorId}
          operatorLabel={operatorLabel}
          observations={chartData}
          netTariffs={restNetTariffs}
          viewBy={filters?.viewBy ?? "progress"}
          compareWith={filters?.compareWith ?? []}
          rootProps={{ sx: { mt: 2 } }}
        />
        <Stack
          sx={{
            mt: 2,
            flexGrow: 1,
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "flex-end",
          }}
        >
          {props.linkContent}
        </Stack>
      </CardContent>
    </Card>
  );
};
