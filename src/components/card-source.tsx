import { Trans } from "@lingui/react";
import { Box } from "@mui/material";

const CardSource = ({ date, source }: { date: string; source: string }) => (
  <Box
    sx={{
      mt: 4,
      color: "text.secondary",
      typography: "caption",
    }}
  >
    <div>
      <Trans id="sunshine.costs-and-tariffs.date">Date: {date}</Trans>
    </div>
    <div>
      <Trans id="sunshine.costs-and-tariffs.source">Source: {source}</Trans>
    </div>
  </Box>
);

export default CardSource;
