import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

type SunshineCardProps = {
  children: ReactNode;
};

export const SunshineCard = (props: SunshineCardProps) => {
  const { children } = props;
  return (
    <Box
      sx={{
        flexDirection: "column",
        height: "100%",
        backgroundColor: "background.paper",
        boxShadow: 3,
        borderRadius: 1,
      }}
      display={"flex"}
    >
      {children}
    </Box>
  );
};

export const SunshineCardHeader = (props: SunshineCardProps) => {
  const { children } = props;
  return (
    <Box
      sx={{
        px: 6,
        py: 6.5,
      }}
    >
      {children}
    </Box>
  );
};

export const SunshineCardContent = (props: SunshineCardProps) => {
  const { children } = props;
  return (
    <Box
      sx={{
        p: 6.5,
        pt: 0,
      }}
    >
      {children}
    </Box>
  );
};

export const SunshineCardTitle = (props: SunshineCardProps) => {
  const { children } = props;
  return (
    <Typography fontWeight={700} component={"h4"} lineHeight={1.4} variant="h3">
      {children}
    </Typography>
  );
};

export const SunshineCardDescription = (props: SunshineCardProps) => {
  const { children } = props;
  return <Typography variant="body2">{children}</Typography>;
};

export const SunshineImageWrapper = (props: SunshineCardProps) => {
  const { children } = props;
  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",
        display: "flex",
        aspectRatio: "1.5",
      }}
    >
      <Box
        sx={{
          flex: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
