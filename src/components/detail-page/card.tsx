import { Box, Typography } from "@mui/material";
import * as React from "react";
import { ReactNode } from "react";

import { Entity } from "../../domain/data";

import { Download, DownloadImage } from "./download-image";

export const Card = ({
  title,
  downloadId,
  children,
}: {
  title: string | ReactNode;
  downloadId: Download;
  id: string;
  entity: Entity;

  children: ReactNode;
}) => {
  return (
    <Box
      // This id is used by the screenshot function
      id={downloadId}
      sx={{
        bgcolor: "grey.100",
        p: 5,
        m: 4,
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "grey.300",
        boxShadow: "primary",
      }}
    >
      <Typography
        component="h2"
        variant="h2"
        sx={{ pt: 1, color: "grey.800", mb: 4 }}
      >
        {title}
      </Typography>
      {children}
      <DownloadImage
        elementId={downloadId}
        fileName={downloadId}
        downloadType={downloadId}
      />
    </Box>
  );
};
