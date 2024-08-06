import { Box, Typography } from "@mui/material";
import * as React from "react";
import { ReactNode } from "react";

import { Entity } from "../../domain/data";

import { Download, DownloadImage } from "./download-image";

export const Card = ({
  title,
  downloadId,
  id,
  entity,
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
        bg: "grey[100]",
        p: 5,
        m: 4,
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "grey[300]",
        boxShadow: "primary",
      }}
    >
      <Text
        component="h2"
        variant="heading2"
        sx={{ pt: 1, color: "grey[800]", mb: 4 }}
      >
        {title}
      </Text>
      {children}
      <DownloadImage
        elementId={downloadId}
        fileName={downloadId}
        entity={entity}
        id={id}
        downloadType={downloadId}
      />
    </Box>
  );
};
