import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

import {
  Download,
  DownloadImage,
} from "src/components/detail-page/download-image";

export const Card = ({
  title,
  downloadId,
  children,
}: {
  title: string | ReactNode;
  downloadId: Download;
  children: ReactNode;
}) => {
  return (
    <Box
      // This id is used by the screenshot function
      id={downloadId}
      sx={{
        bgcolor: "background.paper",
        borderRadius: 1,
        p: 5,
        boxShadow: 2,
      }}
    >
      <Typography
        component="h2"
        variant="h2"
        sx={{ pt: 1, color: "secondary.800", mb: 4 }}
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
