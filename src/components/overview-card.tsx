import { Card, CardContent, CardProps, Stack, Typography } from "@mui/material";
import React, { ReactNode } from "react";

import { InfoDialogButton, InfoDialogButtonProps } from "./info-dialog";

interface OverviewCardProps extends Omit<CardProps, "title"> {
  title: ReactNode;
  description?: ReactNode;
  chart: ReactNode;
  linkContent?: ReactNode;
  infoDialogProps: Pick<InfoDialogButtonProps, "slug" | "label">;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  description,
  chart,
  linkContent,
  infoDialogProps,
  ...cardProps
}) => {
  return (
    <Card {...cardProps} sx={{ position: "relative", ...cardProps.sx }}>
      <InfoDialogButton
        sx={{
          position: "absolute",
          top: (theme) => theme.spacing(3),
          right: (theme) => theme.spacing(3),
        }}
        iconOnly
        slug={infoDialogProps.slug}
        label={infoDialogProps.label}
        type="outline"
      />
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          height: "100%",
        }}
      >
        <Typography variant="h3">{title}</Typography>
        {description && <Typography variant="body2">{description}</Typography>}
        {chart}
        <Stack
          sx={{
            mt: 2,
            flexGrow: 1,
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "flex-end",
          }}
        >
          {linkContent}
        </Stack>
      </CardContent>
    </Card>
  );
};
