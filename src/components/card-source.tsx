import { Trans } from "@lingui/macro";
import { Box } from "@mui/material";

import { SafeHydration } from "src/components/hydration";

const CardSource = ({ date, source }: { date: string; source: string }) => (
  <Box
    sx={{
      mt: 4,
      color: "text.secondary",
      typography: "caption",
    }}
  >
    <div>
      <SafeHydration>
        <Trans id="sunshine.date">Date: {date}</Trans>
      </SafeHydration>
    </div>
    <div>
      <Trans id="sunshine.source">Source: {source}</Trans>
    </div>
  </Box>
);

export default CardSource;
