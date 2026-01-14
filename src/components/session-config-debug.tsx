import { Box, Typography } from "@mui/material";
import React from "react";

import { SessionConfigDebugProps } from "src/data/shared-page-props";

export const SessionConfigDebug: React.FC<SessionConfigDebugProps> = ({
  flags,
}) => {
  // Only show flags that differ from their default values
  const nonDefaultFlags = Object.entries(flags).filter(
    ([_, flagInfo]) => flagInfo.value !== flagInfo.default
  );

  // Don't render anything if all flags are at their default values
  if (nonDefaultFlags.length === 0) {
    return null;
  }

  return (
    <Box
      position="fixed"
      top="40px"
      right={0}
      color="white"
      padding={2}
      zIndex={9999}
      fontSize="12px"
      fontWeight="bold"
      minWidth={300}
      sx={{
        background: (theme) => theme.palette.warning.main,
      }}
    >
      {nonDefaultFlags.map(([flagKey, flagInfo]) => (
        <Typography key={flagKey} variant="caption" component="div">
          {flagInfo.label}: {flagInfo.value}
        </Typography>
      ))}
      {/* Link to /api/session-config */}
      <Typography variant="caption" component="div">
        <a
          href="/api/session-config"
          style={{ color: "white", textDecoration: "underline" }}
        >
          Configure
        </a>
      </Typography>
    </Box>
  );
};
