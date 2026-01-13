import { Trans } from "@lingui/macro";
import { Box } from "@mui/material";

import { SafeHydration } from "src/components/hydration";

const CardSource = ({
  date: rawDate,
  source,
}: {
  date: string;
  source: string;
}) => {
  const date = new Date(rawDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <Box
      mt={4}
      color="text.secondary"
      sx={{
        typography: "caption",
      }}
    >
      <div data-visual-test="transparent">
        <SafeHydration>
          <Trans id="sunshine.date">Date: {date}</Trans>
        </SafeHydration>
      </div>
      <div>
        <Trans id="sunshine.source">Source: {source}</Trans>
      </div>
    </Box>
  );
};

export default CardSource;
