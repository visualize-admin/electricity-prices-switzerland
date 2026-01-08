import { t, Trans } from "@lingui/macro";
import { Card, CardContent, CardProps, Grid, Typography } from "@mui/material";
import React, { ReactNode, useMemo } from "react";

import { ButtonGroup } from "src/components/button-group";
import CardSource from "src/components/card-source";
import { getInfoDialogProps } from "src/components/info-dialog-props";
import { OverviewCard } from "src/components/overview-card";
import { createColorMapping } from "src/domain/color-mapping";
import { filterBySeparator } from "src/domain/helpers";
import {
  CompareWithFilter,
  OverallOrRatioFilter,
  QueryStateSunshineMap,
  useQueryStatePowerStabilityCardFilters,
  ViewByFilter,
} from "src/domain/query-states";
import {
  isPeerGroupRow,
  PeerGroup,
  SunshinePowerStabilityData,
} from "src/domain/sunshine";
import { getLocalizedLabel, getPeerGroupLabels } from "src/domain/translation";

import { CardHeader } from "./detail-page/card";
import { Download, DownloadImage } from "./detail-page/download-image";
import { InfoDialogButton, InfoDialogButtonProps } from "./info-dialog";
import { PowerStabilityChart } from "./power-stability-chart";
import { ItemMultiCombobox } from "./query-combobox";

const DOWNLOAD_ID: Download = "power-stability";

export type PowerStabilityCardFilters = {
  compareWith?: CompareWithFilter;
  viewBy?: ViewByFilter;
  saidiSaifiType?: QueryStateSunshineMap["saidiSaifiType"];
  overallOrRatio?: OverallOrRatioFilter;
};

type PowerStabilityCardProps = {
  peerGroup: PeerGroup;
  updateDate: string;
  observations:
    | SunshinePowerStabilityData["saidi"]["yearlyData"]
    | SunshinePowerStabilityData["saifi"]["yearlyData"];
  operatorId: string;
  operatorLabel: string;
  latestYear: number;
  cardTitle: React.ReactNode;
  infoDialogProps?: Pick<InfoDialogButtonProps, "slug" | "label">;
  state: ReturnType<typeof useQueryStatePowerStabilityCardFilters>[0];
  setQueryState: ReturnType<typeof useQueryStatePowerStabilityCardFilters>[1];
} & CardProps;

const getPowerStabilityCardState = (
  props: Omit<
    PowerStabilityCardProps,
    "cardTitle" | "infoDialogProps" | "state" | "setQueryState"
  >,
  filters: PowerStabilityCardFilters
) => {
  const {
    peerGroup,
    updateDate,
    observations,
    operatorId,
    operatorLabel,
    latestYear,
  } = props;
  const { peerGroupLabel } = getPeerGroupLabels(peerGroup);
  const { observations: chartObservations, multiComboboxOptions } =
    React.useMemo(() => {
      const multiComboboxOptions: typeof observations = [];
      const chartObservations: typeof observations = [];
      observations.forEach((d) => {
        const isLatestYear = d.year === latestYear;
        const operatorIdStr = d.operator_id.toString();
        const isSelected =
          filters.compareWith?.includes("sunshine.select-all") ||
          filters.compareWith?.includes(operatorIdStr) ||
          operatorIdStr === operatorId ||
          isPeerGroupRow(d);
        if ((filters.viewBy === "latest" ? isLatestYear : true) && isSelected) {
          chartObservations.push(d);
        }
        if (isLatestYear && operatorIdStr !== operatorId) {
          multiComboboxOptions.push(d);
        }
      });
      return { observations: chartObservations, multiComboboxOptions };
    }, [
      observations,
      filters.compareWith,
      latestYear,
      operatorId,
      filters.viewBy,
    ]);
  return {
    peerGroupLabel,
    observations: chartObservations,
    multiComboboxOptions,
    updateDate,
    operatorId,
    operatorLabel,
    latestYear,
  };
};

export const PowerStabilityCardState = (
  props: Omit<PowerStabilityCardProps, "state" | "setQueryState">
) => {
  const [state, setQueryState] = useQueryStatePowerStabilityCardFilters();
  return (
    <PowerStabilityCard
      {...props}
      state={state}
      setQueryState={setQueryState}
      latestYear={Number(props.latestYear)}
    />
  );
};

export const PowerStabilityCard: React.FC<PowerStabilityCardProps> = (
  props
) => {
  const {
    state,
    setQueryState,
    infoDialogProps,

    peerGroup: _peerGroup,
    updateDate: _updateDate,
    observations: propsObservations,
    operatorId: _operatorId,
    operatorLabel: _operatorLabel,
    latestYear,
    ...cardProps
  } = props;
  const { compareWith, viewBy, saidiSaifiType, overallOrRatio } = state;

  const filteredObservations = useMemo(() => {
    return viewBy === "latest"
      ? propsObservations.filter((x) => x.year === latestYear) ?? []
      : propsObservations;
  }, [latestYear, propsObservations, viewBy]);

  const chartData = getPowerStabilityCardState(
    {
      ...props,
      observations: filteredObservations,
    },
    state
  );
  const {
    peerGroupLabel,
    observations,
    multiComboboxOptions,
    updateDate,
    operatorId,
    operatorLabel,
  } = chartData;

  // Create color mapping for consistent colors between combobox and chart
  const colorMapping = createColorMapping(compareWith, "elcom2");

  return (
    <Card {...cardProps}>
      <CardContent>
        <CardHeader
          trailingContent={
            <>
              {infoDialogProps && (
                <InfoDialogButton
                  iconOnly
                  iconSize={24}
                  type="outline"
                  {...infoDialogProps}
                />
              )}
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
          <Typography variant="h3" gutterBottom>
            {props.cardTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <Trans id="sunshine.costs-and-tariffs.benchmarking-peer-group">
              Benchmarking within the Peer Group: {peerGroupLabel}
            </Trans>
          </Typography>
        </CardHeader>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <ButtonGroup
              id="view-by-button-group-1"
              label={getLocalizedLabel({
                id: "power-stability.view-by",
              })}
              options={[
                {
                  value: "latest",
                  label: getLocalizedLabel({
                    id: "power-stability.latest-year-option",
                  }),
                },
                {
                  value: "progress",
                  label: getLocalizedLabel({
                    id: "power-stability.progress-over-time",
                  }),
                },
              ]}
              value={viewBy}
              setValue={(value) =>
                setQueryState({ ...state, viewBy: value as ViewByFilter })
              }
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            {viewBy === "latest" ? (
              <ButtonGroup
                id="view-by-button-group-2"
                label={getLocalizedLabel({
                  id: "power-stability.view-by",
                })}
                options={[
                  {
                    value: "overall",
                    label: getLocalizedLabel({
                      id: "power-stability.overall-option",
                    }),
                    content: getLocalizedLabel({
                      id: "power-stability.overall-tooltip",
                    }),
                  },
                  {
                    value: "ratio",
                    label: getLocalizedLabel({
                      id: "power-stability.ratio-option",
                    }),
                    content: getLocalizedLabel({
                      id: "power-stability.ratio-tooltip",
                    }),
                  },
                ]}
                value={overallOrRatio}
                setValue={(value) =>
                  setQueryState({
                    ...state,
                    overallOrRatio: value as OverallOrRatioFilter,
                  })
                }
              />
            ) : (
              <ButtonGroup
                id="view-by-button-group-3"
                label={getLocalizedLabel({
                  id: "power-stability.duration",
                })}
                options={[
                  {
                    value: "total",
                    label: getLocalizedLabel({
                      id: "power-stability.total-option",
                    }),
                    content: getLocalizedLabel({
                      id: "power-stability.total-tooltip",
                    }),
                  },
                  {
                    value: "planned",
                    label: getLocalizedLabel({
                      id: "power-stability.planned-option",
                    }),
                    content: getLocalizedLabel({
                      id: "power-stability.planned-tooltip",
                    }),
                  },
                  {
                    value: "unplanned",
                    label: getLocalizedLabel({
                      id: "power-stability.unplanned-option",
                    }),
                    content: getLocalizedLabel({
                      id: "power-stability.unplanned-tooltip",
                    }),
                  },
                ]}
                value={saidiSaifiType}
                setValue={(value) =>
                  setQueryState({
                    ...state,
                    saidiSaifiType:
                      value as QueryStateSunshineMap["saidiSaifiType"],
                  })
                }
              />
            )}
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: "flex" }}>
            <ItemMultiCombobox
              label={t({
                id: "sunshine.costs-and-tariffs.compare-with",
                message: "Compare With",
              })}
              colorMapping={colorMapping}
              InputProps={
                compareWith.length === 0
                  ? {
                      placeholder: t({
                        id: "sunshine.costs-and-tariffs.compare-with-placeholder",
                        message: "Select operators to compare",
                      }),
                    }
                  : undefined
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
          </Grid>
        </Grid>
        <PowerStabilityChart
          observations={observations}
          id={operatorId}
          operatorLabel={operatorLabel}
          viewBy={viewBy}
          overallOrRatio={overallOrRatio}
          saidiSaifiType={saidiSaifiType}
          compareWith={compareWith}
          colorMapping={colorMapping}
          rootProps={{
            sx: {
              mt: 8,
            },
          }}
        />
        <CardSource date={`${updateDate}`} source={"Lindas"} />
      </CardContent>
    </Card>
  );
};

export const PowerStabilityCardMinified: React.FC<
  Omit<
    PowerStabilityCardProps,
    "infoDialogProps" | "state" | "setQueryState"
  > & {
    linkContent?: ReactNode;
    filters?: PowerStabilityCardFilters;
    cardDescription?: ReactNode;
    indicator: "saidi" | "saifi";
  }
> = (props) => {
  const {
    filters: defaultFilters,
    cardTitle,
    cardDescription,
    indicator,
    ...rest
  } = props;
  const [state] = useQueryStatePowerStabilityCardFilters({
    defaultValue: defaultFilters,
  });
  const { viewBy, saidiSaifiType: duration, overallOrRatio } = state;
  const chartData = getPowerStabilityCardState(rest, state);
  const {
    updateDate: _updateDate,
    operatorId: _operatorId,
    ...overviewCardProps
  } = rest;
  return (
    <OverviewCard
      title={cardTitle}
      description={cardDescription}
      linkContent={props.linkContent}
      chart={
        <PowerStabilityChart
          observations={chartData.observations}
          id={chartData.operatorId}
          operatorLabel={chartData.operatorLabel}
          viewBy={viewBy ?? "progress"}
          overallOrRatio={overallOrRatio ?? "overall"}
          saidiSaifiType={duration ?? "total"}
          compareWith={[]}
          rootProps={{ sx: { mt: 2 } }}
        />
      }
      {...overviewCardProps}
      infoDialogProps={
        indicator === "saidi"
          ? getInfoDialogProps("help-saidi")
          : getInfoDialogProps("help-saifi")
      }
    />
  );
};
