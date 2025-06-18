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
import { PeerGroup, SunshineCostsAndTariffsData } from "src/domain/data";
import { containsDelimiter, filterByDelimiter } from "src/domain/helpers";
import { getPeerGroupLabels } from "src/domain/translation";

import { NetTariffsTrendChart } from "./net-tariffs-trend-chart";
import { AllOrComboboxMulti } from "./query-combobox";

const NetTariffsTrendCard: React.FC<
  {
    peerGroup: PeerGroup;
    updateDate: string;
    netTariffs: SunshineCostsAndTariffsData["netTariffs"];
    operatorId: string;
    operatorLabel: string;
  } & CardProps
> = (props) => {
  const [compareWith, setCompareWith] = useState(["sunshine.select-all"]);
  const [viewBy, setViewBy] = useState("latest");

  const { peerGroup, updateDate, netTariffs, operatorId, operatorLabel } =
    props;
  const { peerGroupLabel } = getPeerGroupLabels(peerGroup);

  const { yearlyData, ...restNetTariffs } = netTariffs;
  const latestYear = new Date().getFullYear();
  const latestYearDataItems = useMemo(() => {
    return yearlyData.filter((d) => d.period === latestYear);
  }, [yearlyData, latestYear]);

  const latestYearData = useMemo(() => {
    return yearlyData.filter(
      (d) =>
        d.period === latestYear &&
        containsDelimiter(
          compareWith,
          "sunshine.select-all",
          d.operator_id.toString()
        )
    );
  }, [yearlyData, compareWith, latestYear]);

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
            <AllOrComboboxMulti
              label={t({
                id: "sunshine.costs-and-tariffs.compare-with",
                message: "Compare With",
              })}
              items={[
                { id: "sunshine.select-all" },
                ...latestYearDataItems.map((item) => {
                  return {
                    id: String(item.operator_id),
                    name: item.operator_name,
                  };
                }),
              ]}
              selectedItems={compareWith}
              setSelectedItems={(items) =>
                setCompareWith(filterByDelimiter(items, "sunshine.select-all"))
              }
            />
          </Grid>
        </Grid>

        {/* Scatter Plot */}
        <Box sx={{ height: 300, width: "100%" }}>
          <NetTariffsTrendChart
            id={operatorId}
            operatorLabel={operatorLabel}
            observations={latestYearData}
            netTariffs={restNetTariffs}
          />
        </Box>
        {/* Footer Info */}
        <CardSource date={`${updateDate}`} source={"Lindas"} />
      </CardContent>
    </Card>
  );
};

export default NetTariffsTrendCard;
