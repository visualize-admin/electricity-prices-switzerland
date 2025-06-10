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
import { Combobox } from "src/components/combobox";
import { PeerGroup, SunshineCostsAndTariffsData } from "src/domain/data";
import { getLocalizedLabel, getPeerGroupLabels } from "src/domain/translation";

import { NetworkCostTrendChart } from "./network-cost-trend-chart";

const NetworkCostsTrendCard: React.FC<
  {
    peerGroup: PeerGroup;
    updateDate: string;
    networkCosts: SunshineCostsAndTariffsData["networkCosts"];
    operatorId: string;
    operatorLabel: string;
  } & CardProps
> = (props) => {
  const [compareWith, setCompareWith] = useState(
    "sunshine.costs-and-tariffs.all-peer-group"
  );
  const [viewBy, setViewBy] = useState("latest");

  const { peerGroup, updateDate, networkCosts, operatorId, operatorLabel } =
    props;
  const { peerGroupLabel } = getPeerGroupLabels(peerGroup);
  return (
    <Card {...props}>
      <CardContent>
        <Typography variant="h3" gutterBottom>
          <Trans id="sunshine.costs-and-tariffs.network-cost-trend">
            Network Cost Trend
          </Trans>
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom mb={8}>
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
        <Box sx={{ height: 200, width: "100%" }}>
          <NetworkCostTrendChart
            id={operatorId}
            operatorLabel={operatorLabel}
            observations={networkCosts.yearlyData}
          />
        </Box>
        {/* Footer Info */}
        <CardSource date={`${updateDate}`} source={"Lindas"} />
      </CardContent>
    </Card>
  );
};

export default NetworkCostsTrendCard;
