import { Trans } from "@lingui/macro";
import { Card, CardContent, CardProps, Typography } from "@mui/material";
import React from "react";

import CardSource from "src/components/card-source";
import { PeerGroup } from "src/domain/sunshine";
import { getPeerGroupLabels } from "src/domain/translation";
import { OperationalStandardsData } from "src/graphql/resolver-types";

import { CardHeader } from "./detail-page/card";
import { NoDataAvailable } from "./no-data-available";
import { OperationalStandardsChartCardState } from "./operational-standards-chart";

type AttributeProps =
  | {
      attribute: "serviceQuality";
      operationalStandards: OperationalStandardsData["serviceQuality"];
    }
  | {
      attribute: "compliance";
      operationalStandards: OperationalStandardsData["compliance"];
    };

type OperationalStandardsCardProps = AttributeProps & {
  peerGroup: PeerGroup;
  updateDate: string;
  operatorId: string;
  operatorLabel: string;
  latestYear: number;
  /** When true, shows NoDataAvailable instead of the chart */
  noData?: boolean;
} & CardProps;

const OperationalStandardsCard: React.FC<OperationalStandardsCardProps> = (
  props
) => {
  const {
    peerGroup,
    updateDate,
    operationalStandards,
    operatorId,
    operatorLabel,
    attribute,
    noData,
    latestYear,
    ...rest
  } = props;

  const { peerGroupLabel } = getPeerGroupLabels(peerGroup);

  if (noData) {
    return (
      <Card {...rest}>
        <CardContent>
          <CardHeader>
            <Typography variant="h3">
              {attribute === "serviceQuality" ? (
                <Trans id="sunshine.operational-standards.service-quality-trend-title">
                  Notification period trend
                </Trans>
              ) : (
                <Trans id="sunshine.operational-standards.compliance-trend-title">
                  75 francs rule trend
                </Trans>
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <Trans id="sunshine.costs-and-tariffs.benchmarking-peer-group">
                Benchmarking within the Peer Group: {peerGroupLabel}
              </Trans>
            </Typography>
          </CardHeader>
          <NoDataAvailable sx={{ mt: 8 }} />
          <CardSource date={`${updateDate}`} source={"Lindas"} />
        </CardContent>
      </Card>
    );
  }

  return (
    <OperationalStandardsChartCardState
      {...rest}
      peerGroup={peerGroup}
      updateDate={updateDate}
      operatorId={operatorId}
      operatorLabel={operatorLabel}
      latestYear={latestYear}
      standardAttribute={attribute}
      yearlyData={operationalStandards.yearlyData}
    />
  );
};

export default OperationalStandardsCard;
