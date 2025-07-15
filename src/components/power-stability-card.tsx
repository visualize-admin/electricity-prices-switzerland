import { t, Trans } from "@lingui/macro";
import {
  Card,
  CardContent,
  CardProps,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { ReactNode } from "react";

import { ButtonGroup } from "src/components/button-group";
import CardSource from "src/components/card-source";
import TooltipContent from "src/components/tooltip-content";
import { filterBySeparator } from "src/domain/helpers";
import { useQueryStatePowerStabilityCardFilters } from "src/domain/query-states";
import { PeerGroup, SunshinePowerStabilityData } from "src/domain/sunshine";
import { getPeerGroupLabels } from "src/domain/translation";

import { CardHeader } from "./detail-page/card";
import { Download, DownloadImage } from "./detail-page/download-image";
import { InfoDialogButton, InfoDialogButtonProps } from "./info-dialog";
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
  infoDialogProps: Pick<InfoDialogButtonProps, "slug" | "label">;
} & CardProps;

const getPowerStabilityCardState = (
  props: Omit<PowerStabilityCardProps, "cardTitle" | "infoDialogProps">,
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

export const PowerStabilityCard: React.FC<PowerStabilityCardProps> = (
  props
) => {
  const [state, setQueryState] = useQueryStatePowerStabilityCardFilters();
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
    <Card {...props}>
      <CardContent>
        <CardHeader
          trailingContent={
            <>
              <InfoDialogButton
                iconOnly
                iconSize={24}
                type="outline"
                {...props.infoDialogProps}
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
              label={t({
                id: "sunshine.power-stability.view-by",
                message: "View By",
              })}
              options={[
                {
                  value: "latest",
                  label: (
                    <Trans id="sunshine.power-stability.latest-year-option">
                      Latest year
                    </Trans>
                  ),
                },
                {
                  value: "progress",
                  label: (
                    <Trans id="sunshine.power-stability.progress-over-time">
                      Progress over time
                    </Trans>
                  ),
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
                label={t({
                  id: "sunshine.power-stability.view-by",
                  message: "View By",
                })}
                options={[
                  {
                    value: "overall",
                    label: (
                      <Tooltip
                        title={
                          <TooltipContent
                            title={
                              <Trans id="sunshine.power-stability.overall-option">
                                Overall
                              </Trans>
                            }
                            content={
                              <Trans id="sunshine.power-stability.overall-tooltip">
                                Shows the total outage duration per operator,
                                combining planned and unplanned outages for
                                direct comparison.
                              </Trans>
                            }
                          />
                        }
                        arrow
                        placement="top"
                        slotProps={{
                          tooltip: {
                            sx: {
                              padding: 0,
                            },
                          },
                        }}
                      >
                        <span>
                          <Trans id="sunshine.power-stability.overall-option">
                            Overall
                          </Trans>
                        </span>
                      </Tooltip>
                    ),
                  },
                  {
                    value: "ratio",
                    label: (
                      <Tooltip
                        title={
                          <TooltipContent
                            title={t({
                              id: "sunshine.power-stability.ratio-option",
                              message: "Ratio",
                            })}
                            content={t({
                              id: "sunshine.power-stability.ratio-tooltip",
                              message:
                                "Shows the ratio of unplanned outages to total outages, providing insight into the stability of the power supply.",
                            })}
                          />
                        }
                        arrow
                        placement="top"
                        slotProps={{
                          tooltip: {
                            sx: {
                              padding: 0,
                            },
                          },
                        }}
                      >
                        <span>
                          <Trans id="sunshine.power-stability.ratio-option">
                            Ratio
                          </Trans>
                        </span>
                      </Tooltip>
                    ),
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
                label={t({
                  id: "sunshine.power-stability.duration",
                  message: "Duration",
                })}
                options={[
                  {
                    value: "total",
                    label: (
                      <Trans id="sunshine.power-stability.total-option">
                        Total
                      </Trans>
                    ),
                  },
                  {
                    value: "planned",
                    label: (
                      <Trans id="sunshine.power-stability.planned-option">
                        Planned
                      </Trans>
                    ),
                  },
                  {
                    value: "unplanned",
                    label: (
                      <Trans id="sunshine.power-stability.unplanned-option">
                        Unplanned
                      </Trans>
                    ),
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
  Omit<PowerStabilityCardProps, "infoDialogProps"> & {
    linkContent?: ReactNode;
    filters?: PowerStabilityCardFilters;
    cardDescription?: ReactNode;
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
