import { Trans } from "@lingui/macro";
import { Box, Card, CardContent, CardProps, Typography } from "@mui/material";
import React from "react";

import CardSource from "src/components/card-source";
import { PeerGroup, SunshineOperationalStandardsData } from "src/domain/data";
import { getLocalizedLabel, getPeerGroupLabels } from "src/domain/translation";

const OperationalStandardsCard: React.FC<
  {
    peerGroup: PeerGroup;
    updateDate: string;
    operationalStandards:
      | SunshineOperationalStandardsData["productVariety"]
      | SunshineOperationalStandardsData["serviceQuality"]
      | SunshineOperationalStandardsData["compliance"];
    operatorId: string;
    operatorLabel: string;
    attribute: keyof Pick<
      SunshineOperationalStandardsData,
      "productVariety" | "serviceQuality" | "compliance"
    >;
  } & CardProps
> = (props) => {
  const {
    peerGroup,
    updateDate,
    operationalStandards,
    operatorId,
    operatorLabel,
    attribute,
  } = props;
  const { peerGroupLabel } = getPeerGroupLabels(peerGroup);
  return (
    <Card {...props}>
      <CardContent>
        <Typography variant="h3" gutterBottom>
          {getLocalizedLabel({
            id: `${attribute.toLowerCase()}-trend`,
          })}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom mb={8}>
          <Trans id="sunshine.costs-and-tariffs.benchmarking-peer-group">
            Benchmarking within the Peer Group: {peerGroupLabel}
          </Trans>
        </Typography>

        {/* Stacked Horizontal Bar Chart */}
        <Box sx={{ height: 400, width: "100%" }}></Box>
        {/* Footer Info */}
        <CardSource date={`${updateDate}`} source={"Lindas"} />
      </CardContent>
    </Card>
  );
};

export default OperationalStandardsCard;
