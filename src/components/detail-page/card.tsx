import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

import { Download } from "src/components/detail-page/download-image";
import { Entity } from "src/domain/data";

export type SectionProps = {
  id: string;
  entity: Entity;
};

type CardBase = {
  children: ReactNode;
};

type CardProps = {
  downloadId: Download;
} & CardBase;

export const Card = (props: CardProps) => {
  const { children, downloadId } = props;
  return (
    <Box
      // This id is used by the screenshot function
      id={downloadId}
      sx={{
        bgcolor: "background.paper",
        borderRadius: 1,
        py: 8,
        px: { xxs: 5, md: 10 },
        boxShadow: 2,
        flexDirection: "column",
        gap: 8,
      }}
      display={"flex"}
    >
      {children}
    </Box>
  );
};

type CardHeaderProps = {
  trailingContent?: ReactNode;
} & CardBase;

export const CardHeader = (props: CardHeaderProps) => {
  const { children, trailingContent } = props;
  return (
    <Box
      display={"flex"}
      sx={{
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <Box
        display={"flex"}
        sx={{
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {children}
      </Box>
      {trailingContent && (
        <Box
          display={"flex"}
          sx={{
            alignItems: "center",
            gap: 2,
          }}
        >
          {trailingContent}
        </Box>
      )}
    </Box>
  );
};

export const CardTitle = (props: CardBase) => {
  const { children } = props;
  return (
    <Typography
      component="h2"
      variant="h2"
      sx={{ color: "text.primary", lineHeight: "140%" }}
    >
      {children}
    </Typography>
  );
};

export const CardDescription = (props: CardBase) => {
  const { children } = props;
  return (
    <Typography
      component="h3"
      variant="body1"
      sx={{ color: "text.primary", lineHeight: "150%" }}
    >
      {children}
    </Typography>
  );
};
