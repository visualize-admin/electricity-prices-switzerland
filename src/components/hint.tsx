import { keyframes } from "@emotion/react";
import { Trans } from "@lingui/macro";
import { Box, BoxProps, IconButton, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import { ReactNode } from "react";

import { Icon, IconName } from "src/icons";
import { palette } from "src/themes/palette";

const ContentWrapper = dynamic(
  () =>
    import("@interactivethings/swiss-federal-ci/dist/components").then(
      (mod) => mod.ContentWrapper
    ),
  { ssr: false }
);

const delayedShow = keyframes`
  0% { opacity: 0 }
  100% { opacity: 1 }
`;

const spin = keyframes`
  0% { transform: rotate(-360deg) },
  100% { transform: rotate(0deg) }
`;

export const Loading = ({ delayMs = 1000 }: { delayMs?: number }) => (
  <Box
    sx={{
      width: "100%",
      height: "100%",
      color: "hint.main",
      margin: "auto",
      textAlign: "center",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      flexGrow: 1,
      padding: 2,
      opacity: 0,
      animation: `0s linear ${delayMs}ms forwards ${delayedShow}`,
    }}
    display="flex"
    data-testid="loading"
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        animation: `1s linear infinite ${spin}`,
      }}
    >
      <Icon name="loading" size={48} />
    </Box>
    <Typography variant="body1">
      <Trans id="hint.loading.data">Loading data...</Trans>
    </Typography>
  </Box>
);

export const LoadingIcon = ({
  delayMs = 200,
  sx,
}: {
  delayMs?: number;
  sx?: BoxProps["sx"];
}) => (
  <Box
    sx={{
      width: "100%",
      height: "100%",
      color: "hint.main",
      margin: "auto",
      textAlign: "center",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      flexGrow: 1,
      padding: 2,
      opacity: 0,
      animation: `0s linear ${delayMs}ms forwards ${delayedShow}`,
      ...sx,
    }}
    display="flex"
  >
    <Box
      sx={{
        animation: `1s linear infinite ${spin}`,
        height: 32,
        width: 32,
      }}
    >
      <Icon name="loading" size={32} />
    </Box>
  </Box>
);

export const LoadingIconInline = ({
  size = 20,
  delayMs = 200,
}: {
  size?: number;
  delayMs?: number;
}) => (
  <Box
    sx={{
      display: "inline-block",
      color: "hint.main",
      margin: "auto",
      textAlign: "center",
      opacity: 0,
      animation: `0s linear ${delayMs}ms forwards ${delayedShow}`,
    }}
  >
    <Box
      sx={{
        width: size,
        height: size,
        animation: `1s linear infinite ${spin}`,
      }}
    >
      <Icon name="loading" size={size} />
    </Box>
  </Box>
);

export const NoDataHint = () => (
  <Box
    sx={{
      width: "100%",
      height: "100%",
      color: "hint.main",
      margin: "auto",
      textAlign: "center",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      flexGrow: 1,
    }}
    display="flex"
  >
    <Icon name="warningcircle" size={64} />
    <Typography variant="h2" sx={{ my: 3 }}>
      <Trans id="hint.nodata.title">No data</Trans>
    </Typography>
    <Typography variant="body2" sx={{ maxWidth: "40rem" }}>
      <Trans id="hint.nodata.message">
        No data could be loaded for the current selection.
      </Trans>
    </Typography>
  </Box>
);

export const NoContentHint = () => (
  <Box
    sx={{
      width: "100%",
      height: "100%",
      color: "hint.main",
      margin: "auto",
      textAlign: "center",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      flexGrow: 1,
    }}
    display="flex"
  >
    <Icon name="warningcircle" size={48} />
    <Typography variant="body2" sx={{ maxWidth: "40rem" }}>
      <Trans id="hint.nocontent.message">
        This content could not be loaded
      </Trans>
    </Typography>
  </Box>
);

export const NoGeoDataHint = () => (
  <Box
    sx={{
      width: "100%",
      height: "100%",
      color: "hint.main",
      margin: "auto",
      textAlign: "center",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      flexGrow: 1,
    }}
    display="flex"
  >
    <Icon name="warningcircle" size={64} />
    <Typography variant="h2" sx={{ my: 3 }}>
      <Trans id="hint.nogeodata.title">No map display possible</Trans>
    </Typography>
    <Typography variant="body2" sx={{ maxWidth: "40rem" }}>
      <Trans id="hint.nogeodata.message">
        No map can be displayed for the selected year.
      </Trans>
    </Typography>
  </Box>
);

export const HintBlue = ({
  iconName,
  children,
  onRemove,
}: {
  iconName: IconName;
  children: ReactNode;
  onRemove?: () => void;
}) => (
  <Box
    sx={{
      width: "auto",
      height: "auto",
      py: 4,
      px: 9,
      bgcolor: "blue.50",
      color: "blue.700",
      boxShadow: 1,
    }}
    display="flex"
  >
    <ContentWrapper
      sx={{
        textAlign: "center",
        justifyContent: "flex-start",
        gap: 4,
        alignItems: ["flex-start", "center"],
        display: "flex",
      }}
    >
      <Box
        sx={{ width: 24, alignItems: "center", justifyContent: "center" }}
        display={"flex"}
      >
        <Icon name={iconName} size={24} color={palette.blue[700]} />
      </Box>
      <Typography variant="body3" sx={{ textAlign: "left" }}>
        {children}
      </Typography>
      {onRemove && (
        <IconButton size="sm" onClick={onRemove} sx={{ ml: "auto" }}>
          <Icon name={"cancel"} color={palette.blue[700]} size={24} />
        </IconButton>
      )}
    </ContentWrapper>
  </Box>
);
