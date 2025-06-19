import { Trans, t } from "@lingui/macro";
import {
  Box,
  Card,
  CardContent,
  CardProps,
  Grid,
  Typography,
} from "@mui/material";
import React, { useMemo, useState } from "react";

import { ButtonGroup } from "src/components/button-group";
import CardSource from "src/components/card-source";
import { PeerGroup, SunshinePowerStabilityData } from "src/domain/data";
import { filterBySeparator } from "src/domain/helpers";
import { getLocalizedLabel, getPeerGroupLabels } from "src/domain/translation";

import { PowerStabilityChart } from "./power-stability-chart";
import { AllOrMultiCombobox } from "./query-combobox";

export type ViewByFilter = "latest" | "progress";
export type OverallOrRatioFilter = "overall" | "ratio";

const PowerStabilityCard: React.FC<
  {
    peerGroup: PeerGroup;
    updateDate: string;
    observations:
      | SunshinePowerStabilityData["saidi"]["yearlyData"]
      | SunshinePowerStabilityData["saifi"]["yearlyData"];
    operatorId: string;
    operatorLabel: string;
    attribute: keyof Pick<SunshinePowerStabilityData, "saidi" | "saifi">;
    latestYear: number;
  } & CardProps
> = (props) => {
  const [compareWith, setCompareWith] = useState(["sunshine.select-all"]);
  const [viewBy, setViewBy] = useState<ViewByFilter>("latest");
  const [overallOrRatio, setOverallOrRatio] =
    useState<OverallOrRatioFilter>("overall");

  const {
    peerGroup,
    updateDate,
    observations,
    operatorId,
    operatorLabel,
    attribute,
    latestYear: useThisOnceDataIsAvailable,
  } = props;
  const { peerGroupLabel } = getPeerGroupLabels(peerGroup);

  //FIXME: doesn't seem to have any data in 2025
  const latestYear = new Date().getFullYear() - 1;

  const latestYearDataItems = useMemo(() => {
    return observations.filter(
      (d) =>
        (viewBy === "latest" ? d.year === latestYear : true) &&
        d.operator.toString() !== operatorId
    );
  }, [observations, latestYear, operatorId, viewBy]);

  const latestYearData = useMemo(() => {
    return observations.filter((d) => {
      const isLatestYear = viewBy === "latest" ? d.year === latestYear : true;
      const isSelected =
        compareWith.includes("sunshine.select-all") ||
        compareWith.includes(d.operator.toString()) ||
        d.operator.toString() === operatorId;

      return isLatestYear && isSelected;
    });
  }, [observations, compareWith, latestYear, operatorId, viewBy]);

  return (
    <Card {...props}>
      <CardContent>
        <Typography variant="h3" gutterBottom>
          {getLocalizedLabel({
            id: `${attribute}-trend`,
          })}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom mb={8}>
          <Trans id="sunshine.costs-and-tariffs.benchmarking-peer-group">
            Benchmarking within the Peer Group: {peerGroupLabel}
          </Trans>
        </Typography>

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
              setValue={setViewBy}
            />
          </Grid>
          <Grid item xs={12} sm={4} sx={{ mt: 2.5 }}>
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
                    <Trans id="sunshine.power-stability.overall-option">
                      Overall
                    </Trans>
                  ),
                },
                {
                  value: "ratio",
                  label: (
                    <Trans id="sunshine.power-stability.ratio-option">
                      Ratio
                    </Trans>
                  ),
                },
              ]}
              value={overallOrRatio}
              setValue={setOverallOrRatio}
            />
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: "flex" }}>
            <AllOrMultiCombobox
              label={t({
                id: "sunshine.costs-and-tariffs.compare-with",
                message: "Compare With",
              })}
              items={[
                { id: "sunshine.select-all" },
                ...latestYearDataItems.map((item) => {
                  return {
                    id: String(item.operator),
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

        {/* Stacked Horizontal Bar Chart */}
        <Box
          sx={{
            height: 400,
            width: "100%",
            overflowY: "auto",
            mt: 8,
          }}
        >
          <PowerStabilityChart
            observations={latestYearData}
            id={operatorId}
            operatorLabel={operatorLabel}
            view={viewBy}
            overallOrRatio={overallOrRatio}
          />
        </Box>
        {/* Footer Info */}
        <CardSource date={`${updateDate}`} source={"Lindas"} />
      </CardContent>
    </Card>
  );
};

export default PowerStabilityCard;
