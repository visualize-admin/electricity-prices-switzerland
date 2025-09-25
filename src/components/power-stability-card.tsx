import { t, Trans } from "@lingui/macro";
import { Card, CardContent, CardProps, Grid, Typography } from "@mui/material";
import React, { ReactNode } from "react";

import { ButtonGroup } from "src/components/button-group";
import CardSource from "src/components/card-source";
import { infoDialogProps } from "src/components/info-dialog-props";
import { filterBySeparator } from "src/domain/helpers";
import { useQueryStatePowerStabilityCardFilters } from "src/domain/query-states";
import { PeerGroup, SunshinePowerStabilityData } from "src/domain/sunshine";
import { getLocalizedLabel, getPeerGroupLabels } from "src/domain/translation";

import { CardHeader } from "./detail-page/card";
import { Download, DownloadImage } from "./detail-page/download-image";
import { InfoDialogButton, InfoDialogButtonProps } from "./info-dialog";
import { OverviewCard } from "./overview-card";
import { PowerStabilityChart } from "./power-stability-chart";
import { AllOrMultiCombobox } from "./query-combobox";

const DOWNLOAD_ID: Download = "power-stability";

// TODO Those should come from the query state SunshineMap
export type ViewByFilter = "latest" | "progress";
export type CompareWithFilter = string[];
type OverallOrRatioFilter = "overall" | "ratio";
type DurationFilter = "total" | "planned" | "unplanned";

export type PowerStabilityCardFilters = {
  compareWith?: CompareWithFilter;
  viewBy?: ViewByFilter;
  duration?: DurationFilter;
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
        const operatorIdStr = d.operator.toString();
        const isSelected =
          filters.compareWith?.includes("sunshine.select-all") ||
          filters.compareWith?.includes(operatorIdStr) ||
          operatorIdStr === operatorId;
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
    observations: _observations,
    operatorId: _operatorId,
    operatorLabel: _operatorLabel,
    latestYear: _latestYear,
    ...cardProps
  } = props;
  const { compareWith, viewBy, duration, overallOrRatio } = state;
  const chartData = getPowerStabilityCardState(props, state);
  const {
    peerGroupLabel,
    observations,
    multiComboboxOptions,
    updateDate,
    operatorId,
    operatorLabel,
  } = chartData;

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
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4} sx={{ mt: 2.5 }}>
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
                  content: getLocalizedLabel({
                    id: "power-stability.latest-year-option-content",
                  }),
                },
                {
                  value: "progress",
                  label: getLocalizedLabel({
                    id: "power-stability.progress-over-time",
                  }),
                  content: getLocalizedLabel({
                    id: "power-stability.progress-over-time-content",
                  }),
                },
              ]}
              value={viewBy}
              setValue={(value) =>
                setQueryState({ ...state, viewBy: value as ViewByFilter })
              }
            />
          </Grid>
          <Grid item xs={12} sm={4} sx={{ mt: 2.5 }}>
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
                value={duration}
                setValue={(value) =>
                  setQueryState({ ...state, duration: value as DurationFilter })
                }
              />
            )}
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: "flex" }}>
            <AllOrMultiCombobox
              label={t({
                id: "sunshine.costs-and-tariffs.compare-with",
                message: "Compare With",
              })}
              items={[
                { id: "sunshine.select-all" },
                ...multiComboboxOptions.map((item) => {
                  return {
                    id: String(item.operator),
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
          duration={duration}
          compareWith={compareWith}
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
    ...rest
  } = props;
  const [state] = useQueryStatePowerStabilityCardFilters({
    defaultValue: defaultFilters,
  });
  const { viewBy, duration, overallOrRatio } = state;
  const chartData = getPowerStabilityCardState(rest, state);
  return (
    <OverviewCard
      {...rest}
      title={cardTitle}
      description={cardDescription}
      chart={
        <PowerStabilityChart
          observations={chartData.observations}
          id={chartData.operatorId}
          operatorLabel={chartData.operatorLabel}
          viewBy={viewBy ?? "progress"}
          overallOrRatio={overallOrRatio ?? "overall"}
          duration={duration ?? "total"}
          compareWith={[]}
          rootProps={{ sx: { mt: 2 } }}
        />
      }
      linkContent={props.linkContent}
      infoDialogProps={infoDialogProps[`help-${props.indicator}`]}
    />
  );
};
