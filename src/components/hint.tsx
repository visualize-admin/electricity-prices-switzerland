import { keyframes } from "@emotion/react";
import { Trans } from "@lingui/macro";
import { Box, BoxProps, IconButton, Skeleton, Typography } from "@mui/material";
import { ReactNode } from "react";

import { Icon, IconName } from "src/icons";
import { palette } from "src/themes/palette";

const delayedShow = keyframes`
  0% { opacity: 0 }
  100% { opacity: 1 }
`;

export const spin = keyframes`
  0% { transform: rotate(-360deg) },
  100% { transform: rotate(0deg) }
`;

export const Loading = ({ delayMs = 1000 }: { delayMs?: number }) => (
  <Box
    display="flex"
    data-testid="loading"
    width="100%"
    height="100%"
    color="hint.main"
    margin="auto"
    textAlign="center"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    flexGrow={1}
    padding={2}
    sx={{
      opacity: 0,
      animation: `0s linear ${delayMs}ms forwards ${delayedShow}`,
    }}
  >
    <Box
      width={48}
      height={48}
      sx={{
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

export const LoadingSkeleton = ({
  height = 200,
  sx,
}: {
  height?: number;
  sx?: BoxProps["sx"];
}) => {
  return (
    <Skeleton
      variant="rectangular"
      width="100%"
      height={height}
      sx={sx}
      data-testid="loading"
      aria-busy="true"
    />
  );
};

export const LoadingIcon = ({
  delayMs = 200,
  sx,
}: {
  delayMs?: number;
  sx?: BoxProps["sx"];
}) => (
  <Box
    display="flex"
    width="100%"
    height="100%"
    color="hint.main"
    margin="auto"
    textAlign="center"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    flexGrow={1}
    padding={2}
    sx={{
      opacity: 0,
      animation: `0s linear ${delayMs}ms forwards ${delayedShow}`,
      ...sx,
    }}
  >
    <Box
      height={32}
      width={32}
      sx={{
        animation: `1s linear infinite ${spin}`,
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
    display="inline-block"
    color="hint.main"
    margin="auto"
    textAlign="center"
    sx={{
      opacity: 0,
      animation: `0s linear ${delayMs}ms forwards ${delayedShow}`,
    }}
  >
    <Box
      width={size}
      height={size}
      sx={{
        animation: `1s linear infinite ${spin}`,
      }}
    >
      <Icon name="loading" size={size} />
    </Box>
  </Box>
);

export const NoDataHint = () => (
  <Box
    display="flex"
    width="100%"
    height="100%"
    color="hint.main"
    margin="auto"
    textAlign="center"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    flexGrow={1}
  >
    <Icon name="warningcircle" size={64} />
    <Typography variant="h2" my={3}>
      <Trans id="hint.nodata.title">No data</Trans>
    </Typography>
    <Typography variant="body2" maxWidth="40rem">
      <Trans id="hint.nodata.message">
        No data could be loaded for the current selection.
      </Trans>
    </Typography>
  </Box>
);

export const NoContentHint = () => (
  <Box
    display="flex"
    width="100%"
    height="100%"
    color="hint.main"
    margin="auto"
    textAlign="center"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    flexGrow={1}
  >
    <Icon name="warningcircle" size={48} />
    <Typography variant="body2" maxWidth="40rem">
      <Trans id="hint.nocontent.message">
        This content could not be loaded
      </Trans>
    </Typography>
  </Box>
);

type HintSeverity = "info" | "success" | "warning" | "error";

const severityIcons: Record<HintSeverity, IconName> = {
  info: "infocircle",
  success: "checkmarkcircle",
  warning: "warningcircle",
  error: "warningcirclefilled",
};

export const Hint = ({
  severity,
  children,
  onRemove,
  sx,
}: {
  severity: HintSeverity;
  children: ReactNode;
  onRemove?: () => void;
  sx?: BoxProps["sx"];
}) => (
  <Box
    display="flex"
    justifyContent="flex-start"
    alignItems={["flex-start", "center"]}
    gap={4}
    py={4}
    px={9}
    bgcolor={`${severity}.light`}
    color={`${severity}.main`}
    boxShadow={1}
    sx={sx}
  >
    <Box
      display={"flex"}
      width={24}
      alignItems="center"
      justifyContent="center"
    >
      <Icon
        name={severityIcons[severity]}
        size={24}
        color={palette[severity].main}
      />
    </Box>
    <Typography variant="body3" component="div" textAlign="left">
      {children}
    </Typography>
    {onRemove && (
      <IconButton size="sm" onClick={onRemove} sx={{ ml: "auto" }}>
        <Icon name={"cancel"} color={palette[severity].main} size={24} />
      </IconButton>
    )}
  </Box>
);
