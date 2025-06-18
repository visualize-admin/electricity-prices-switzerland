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
import { filterBySeparator } from "src/domain/helpers";
import { getPeerGroupLabels } from "src/domain/translation";

import { CardHeader } from "./detail-page/card";
import { Download, DownloadImage } from "./detail-page/download-image";
import { InfoDialogButton } from "./info-dialog";
import { NetworkCostTrendChart } from "./network-cost-trend-chart";
import { AllOrMultiCombobox } from "./query-combobox";

const DOWNLOAD_ID: Download = "costs-and-tariffs";

const NetworkCostsTrendCard: React.FC<
  {
    peerGroup: PeerGroup;
    updateDate: string;
    networkCosts: SunshineCostsAndTariffsData["networkCosts"];
    operatorId: string;
    operatorLabel: string;
    latestYear: number;
  } & CardProps
> = (props) => {
  const [compareWith, setCompareWith] = useState(["sunshine.select-all"]);
  const [viewBy, setViewBy] = useState("latest");

  const {
    peerGroup,
    updateDate,
    networkCosts,
    operatorId,
    operatorLabel,
    latestYear,
  } = props;
  const { peerGroupLabel } = getPeerGroupLabels(peerGroup);

  const { yearlyData, ...restNetworkCosts } = networkCosts;

  const latestYearDataItems = useMemo(() => {
    return yearlyData.filter(
      (d) => d.year === latestYear && d.operator_id.toString() !== operatorId
    );
  }, [yearlyData, latestYear, operatorId]);

  const latestYearData = useMemo(() => {
    return yearlyData.filter(
      (d) =>
        d.year === latestYear &&
        (compareWith.includes("sunshine.select-all") ||
          compareWith.includes(d.operator_id.toString()) ||
          d.operator_id.toString() === operatorId)
    );
  }, [yearlyData, compareWith, latestYear, operatorId]);

  return (
    <Card {...props} id={DOWNLOAD_ID}>
      <CardContent>
        <CardHeader
          trailingContent={
            <>
              <InfoDialogButton
                iconOnly
                iconSize={24}
                type="outline"
                //FIXME: use correct slug
                slug="help-costs-and-tariffs"
                label={"sunshine.costs-and-tariffs.network-cost-trend"}
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
          <Typography variant="h3">
            <Trans id="sunshine.costs-and-tariffs.network-cost-trend">
              Network Cost Trend
            </Trans>
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
            <AllOrMultiCombobox
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
                setCompareWith((prev) =>
                  filterBySeparator(items, prev, "sunshine.select-all")
                )
              }
            />
          </Grid>
        </Grid>

        {/* Scatter Plot */}
        <Box sx={{ height: 300, width: "100%" }}>
          <NetworkCostTrendChart
            id={operatorId}
            operatorLabel={operatorLabel}
            observations={latestYearData}
            networkCosts={restNetworkCosts}
          />
        </Box>
        {/* Footer Info */}
        <CardSource date={`${updateDate}`} source={"Lindas"} />
      </CardContent>
    </Card>
  );
};

export default NetworkCostsTrendCard;
