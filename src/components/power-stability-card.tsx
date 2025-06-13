import { Trans, t } from "@lingui/macro";
import {
  Box,
  Card,
  CardContent,
  CardProps,
  Grid,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

import { ButtonGroup } from "src/components/button-group";
import CardSource from "src/components/card-source";
import { PeerGroup, SunshinePowerStabilityData } from "src/domain/data";
import { getPeerGroupLabels } from "src/domain/translation";

import { PowerStabilityChart } from "./power-stability-chart";

const PowerStabilityCard: React.FC<
  {
    peerGroup: PeerGroup;
    updateDate: string;
    powerStability:
      | SunshinePowerStabilityData["saidi"]
      | SunshinePowerStabilityData["saifi"];
    operatorId: string;
    operatorLabel: string;
  } & CardProps
> = (props) => {
  const [compareWith, setCompareWith] = useState(
    "sunshine.costs-and-tariffs.all-peer-group"
  );
  const [viewBy, setViewBy] = useState("latest");

  const { peerGroup, updateDate, powerStability, operatorId, operatorLabel } =
    props;
  const { peerGroupLabel } = getPeerGroupLabels(peerGroup);
  return (
    <Card {...props}>
      <CardContent>
        <Typography variant="h3" gutterBottom>
          <Trans id="sunshine.costs-and-tariffs.net-tariffs-trend">
            Net Tariffs Trend
          </Trans>
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom mb={8}>
          <Trans id="sunshine.costs-and-tariffs.benchmarking-peer-group">
            Benchmarking within the Peer Group: {peerGroupLabel}
          </Trans>
        </Typography>

        {/* Dropdown Controls */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} sx={{ display: "flex" }}>
            <Box sx={{ flex: 1 }}>
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
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: "flex" }}>
            <Box sx={{ flex: 1 }}>
              <ButtonGroup
                id="view-by-button-group-2"
                label={t({
                  id: "sunshine.power-stability.view-by",
                  message: "View By",
                })}
                options={[
                  {
                    value: "latest",
                    label: (
                      <Trans id="sunshine.power-stability.overall-option">
                        Overall
                      </Trans>
                    ),
                  },
                  {
                    value: "progress",
                    label: (
                      <Trans id="sunshine.power-stability.ratio-option">
                        Ratio
                      </Trans>
                    ),
                  },
                ]}
                value={viewBy}
                setValue={setViewBy}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Stacked Horizontal Bar Chart */}
        <Box sx={{ height: 400, width: "100%" }}>
          <PowerStabilityChart
            observations={powerStability}
            id={operatorId}
            operatorLabel={operatorLabel}
          />
        </Box>
        {/* Footer Info */}
        <CardSource date={`${updateDate}`} source={"Lindas"} />
      </CardContent>
    </Card>
  );
};

export default PowerStabilityCard;
