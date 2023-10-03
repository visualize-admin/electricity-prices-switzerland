import { keyframes } from "@emotion/react";
import { Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import * as React from "react";

import Flex from "src/components/flex";
import { makeStyles } from "src/themes/makeStyles";

import { Icon, IconName } from "../icons";

const useStyles = makeStyles()((theme) => ({
  error: {
    justifyContent: "center",
    alignItems: "center",
    color: "error",
    borderColor: "error",
  },

  hint: {
    width: "100%",
    height: "100%",
    color: theme.palette.hint.main,
    margin: "auto",
    textAlign: "center",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },

  loading: {
    width: "100%",
    height: "100%",
    color: theme.palette.hint.main,
    margin: "auto",
    textAlign: "center",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
    padding: 2,
    opacity: 0,
  },

  loadingIcon: {
    width: "100%",
    height: "100%",
    color: theme.palette.hint.main,
    margin: "auto",
    textAlign: "center",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
    padding: 2,
    opacity: 0,
  },

  loadingIconInline: {
    display: "inline-block",
    color: theme.palette.hint.main,
    margin: "auto",
    textAlign: "center",
    opacity: 0,
  },

  loadingOverlay: {
    position: "absolute",
    backgroundColor: theme.palette.grey[100],
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },

  noData: {
    width: "100%",
    height: "100%",
    color: theme.palette.hint.main,
    margin: "auto",
    textAlign: "center",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },

  noContent: {
    width: "100%",
    height: "100%",
    color: theme.palette.hint.main,
    margin: "auto",
    textAlign: "center",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },

  noGeoData: {
    width: "100%",
    height: "100%",
    color: theme.palette.hint.main,
    margin: "auto",
    textAlign: "center",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },

  hintBlue: {
    width: "auto",
    height: "auto",
    padding: theme.spacing(5),
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.main,
    textAlign: "center",
    justifyContent: "flex-start",
    alignItems: ["flex-start", "center"],
  },

  hintRed: {
    width: "auto",
    height: "auto",
    borderRadius: theme.shape.borderRadius * 3,
    margin: "auto",
    padding: theme.spacing(5),
    backgroundColor: theme.palette.alert.light,
    color: theme.palette.alert.contrastText,
    textAlign: "center",
    justifyContent: "flex-start",
    alignItems: ["flex-start", "center"],
  },
}));

export const Error = ({ children }: { children: React.ReactNode }) => {
  const { classes } = useStyles();
  return <Flex className={classes.error}>{children}</Flex>;
};

export const Hint = ({ children }: { children: React.ReactNode }) => {
  const { classes } = useStyles();
  return <Flex className={classes.hint}>{children}</Flex>;
};

const delayedShow = keyframes`
  0% { opacity: 0 }
  100% { opacity: 1 }
`;

const spin = keyframes`
  0% { transform: rotate(-360deg) },
  100% { transform: rotate(0deg) }
`;

export const Loading = ({ delayMs = 1000 }: { delayMs?: number }) => {
  const { classes } = useStyles();
  return (
    <Flex
      className={classes.loading}
      sx={{
        animation: `0s linear ${delayMs}ms forwards ${delayedShow}`,
      }}
    >
      <Box
        sx={{
          animation: `1s linear infinite ${spin}`,
        }}
      >
        <Icon name="loading" size={48} />
      </Box>
      <Typography variant="h4" color="inherit">
        <Trans id="hint.loading.data">Loading data…</Trans>
      </Typography>
    </Flex>
  );
};

export const LoadingIcon = ({ delayMs = 200 }: { delayMs?: number }) => {
  const { classes } = useStyles();
  return (
    <Flex
      className={classes.loadingIcon}
      sx={{
        animation: `0s linear ${delayMs}ms forwards ${delayedShow}`,
      }}
    >
      <Box
        sx={{
          animation: `1s linear infinite ${spin}`,
        }}
      >
        <Icon name="loading" size={32} />
      </Box>
    </Flex>
  );
};

export const LoadingIconInline = ({
  size = 20,
  delayMs = 200,
}: {
  size?: number;
  delayMs?: number;
}) => {
  const { classes } = useStyles();
  return (
    <Box
      className={classes.loadingIconInline}
      sx={{
        animation: `0s linear ${delayMs}ms forwards ${delayedShow}`,
      }}
    >
      <Box
        sx={{
          animation: `1s linear infinite ${spin}`,
        }}
      >
        <Icon name="loading" size={size} />
      </Box>
    </Box>
  );
};

export const LoadingOverlay = () => {
  const { classes } = useStyles();
  return (
    <Box className={classes.loadingOverlay}>
      <Loading delayMs={0} />
    </Box>
  );
};

export const NoDataHint = () => {
  const { classes } = useStyles();
  return (
    <Flex className={classes.noData}>
      <Icon name="warning" size={64} />
      <Typography variant="h2" sx={{ my: 3 }}>
        <Trans id="hint.nodata.title">Keine Daten</Trans>
      </Typography>
      <Typography variant="body2" sx={{ maxWidth: "40rem" }}>
        <Trans id="hint.nodata.message">
          Für die aktuelle Auswahl konnten keine Daten geladen werden.
        </Trans>
      </Typography>
    </Flex>
  );
};

export const NoContentHint = () => {
  const { classes } = useStyles();
  return (
    <Flex className={classes.noContent}>
      <Icon name="warning" size={48} />

      <Typography variant="body2" sx={{ maxWidth: "40rem" }}>
        <Trans id="hint.nocontent.message">
          Dieser Inhalt konnte nicht geladen werden
        </Trans>
      </Typography>
    </Flex>
  );
};

export const NoGeoDataHint = () => {
  const { classes } = useStyles();
  return (
    <Flex className={classes.noGeoData}>
      <Icon name="warning" size={64} />
      <Typography variant="h2" sx={{ my: 3 }}>
        <Trans id="hint.nogeodata.title">Keine Kartendarstellung möglich</Trans>
      </Typography>
      <Typography variant="body2" sx={{ maxWidth: "40rem" }}>
        <Trans id="hint.nogeodata.message">
          Für das ausgewählte Jahr kann keine Karte angezeigt werden.
        </Trans>
      </Typography>
    </Flex>
  );
};

export const HintBlue = ({
  iconName,
  children,
}: {
  iconName: IconName;
  children: React.ReactNode;
}) => {
  const { classes } = useStyles();
  return (
    <Flex className={classes.hintBlue}>
      <Box sx={{ width: 24, pr: 4 }}>
        <Icon name={iconName} size={24} />
      </Box>
      <Typography variant="body1" sx={{ textAlign: "left", ml: 4 }}>
        {children}
      </Typography>
    </Flex>
  );
};
export const HintRed = ({
  iconName,
  children,
}: {
  iconName: IconName;
  children: React.ReactNode;
}) => {
  const { classes } = useStyles();
  return (
    <Flex className={classes.hintRed}>
      <Box sx={{ width: 24, pr: 4 }}>
        <Icon name={iconName} size={24} />
      </Box>
      <Typography variant="body1" sx={{ textAlign: "left", ml: 4 }}>
        {children}
      </Typography>
    </Flex>
  );
};
