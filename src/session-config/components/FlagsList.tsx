import { Box, Typography, Button } from "@mui/material";
import React from "react";

import { getFlagInfo } from "src/session-config/flags";
import { SessionConfigFlags } from "src/session-config/flags";

import FlagInput from "./FlagInput";

interface FlagsListProps {
  flags: SessionConfigFlags;
  csrfToken: string;
}

const FlagsList: React.FC<FlagsListProps> = ({ flags, csrfToken }) => (
  <Box component="form" method="POST">
    <input type="hidden" name="csrfToken" value={csrfToken} />

    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Configuration Flags
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Modify the session config flags below to change application behavior
        (only for you). Changes take effect immediately.
      </Typography>

      {Object.entries(flags).map(([key, value]) => {
        const { description, type } = getFlagInfo(key as keyof typeof flags);
        return (
          <FlagInput
            key={key}
            flagKey={key}
            value={value}
            type={type}
            description={description}
          />
        );
      })}
    </Box>

    <Box
      sx={{
        display: "flex",
        gap: 2,
        pt: 3,
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <Button type="submit" variant="contained" color="primary">
        Update Flags
      </Button>
      <Button
        type="button"
        variant="outlined"
        color="secondary"
        onClick={() => window.location.reload()}
      >
        Reset Form
      </Button>
    </Box>
  </Box>
);

export default FlagsList;
