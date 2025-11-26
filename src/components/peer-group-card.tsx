import { Trans } from "@lingui/macro";
import { Card, CardContent, CardProps, Typography } from "@mui/material";
import React from "react";

import {
  InfoDialogButton,
  InfoDialogButtonProps,
} from "src/components/info-dialog";
import { PeerGroup } from "src/domain/sunshine";
import { getPeerGroupLabels } from "src/domain/translation";

const PeerGroupCard: React.FC<
  {
    latestYear: string;
    peerGroup: PeerGroup;
    infoDialogProps?: Pick<InfoDialogButtonProps, "slug" | "label">;
  } & CardProps
> = ({ latestYear, peerGroup, infoDialogProps, ...props }) => {
  const { peerGroupLabel } = getPeerGroupLabels(peerGroup);

  return (
    <Card {...props} sx={{ ...props.sx, position: "relative" }}>
      {infoDialogProps && (
        <InfoDialogButton
          sx={{
            position: "absolute",
            top: (theme) => theme.spacing(3),
            right: (theme) => theme.spacing(3),
          }}
          iconOnly
          iconSize={24}
          type="outline"
          slug={infoDialogProps.slug}
          label={infoDialogProps.label}
        />
      )}
      <CardContent>
        <Typography variant="h3" gutterBottom>
          <Trans id="sunshine.costs-and-tariffs.peer-group">Peer Group</Trans>
        </Typography>
        <Typography variant="body2" color="text.primary" gutterBottom>
          <Trans id="sunshine.latest-year">Latest year ({latestYear})</Trans>
        </Typography>
        <Typography variant="body1" fontWeight={700}>
          {peerGroupLabel}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PeerGroupCard;
