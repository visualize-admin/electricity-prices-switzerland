import { Box, Typography } from "@mui/material";
import React from "react";

interface SunshineDataServiceDebugProps {
  serviceName: string;
}

export const SunshineDataServiceDebug: React.FC<
  SunshineDataServiceDebugProps
> = ({ serviceName }) => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: 0,
        background: "hotpink",
        color: "white",
        padding: 1,
        zIndex: 9999,
        fontSize: "12px",
        fontWeight: "bold",
        borderBottomLeftRadius: 4,
      }}
    >
      <Typography variant="caption" component="div">
        Sunshine Data Service: {serviceName}
      </Typography>
    </Box>
  );
};
