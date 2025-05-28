import { Trans } from "@lingui/macro";
import { Typography, Card, CardContent, CardProps } from "@mui/material";
import React from "react";

import { PeerGroup } from "src/domain/data";
import { getPeerGroupLabels } from "src/domain/translation";

const PeerGroupCard: React.FC<
  {
    latestYear: string;
    peerGroup: PeerGroup;
  } & CardProps
> = ({ latestYear, peerGroup, ...props }) => {
  const { peerGroupLabel } = getPeerGroupLabels(peerGroup);

  return (
    <Card {...props}>
      <CardContent>
        <Typography variant="h3" gutterBottom>
          <Trans id="sunshine.costs-and-tariffs.peer-group">Peer Group</Trans>
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          <Trans id="sunshine.costs-and-tariffs.latest-year">
            Latest year ({latestYear})
          </Trans>
        </Typography>
        <Typography variant="body1">{peerGroupLabel}</Typography>
      </CardContent>
    </Card>
  );
};

export default PeerGroupCard;
