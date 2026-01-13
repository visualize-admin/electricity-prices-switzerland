import { Trans } from "@lingui/macro";
import { Box, BoxProps, Typography } from "@mui/material";
import { makeStyles } from "tss-react/mui";

interface NoDataAvailableProps {
  sx?: BoxProps["sx"];
}
const useStyles = makeStyles()((theme) => ({
  root: {
    aspectRatio: "1.86",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    backgroundColor: theme.palette.accent2.main,
    borderRadius: theme.spacing(1),
  },
}));

export const NoDataAvailable: React.FC<NoDataAvailableProps> = ({ sx }) => {
  const { classes } = useStyles();

  return (
    <Box sx={{ ...sx }} className={classes.root}>
      <Typography variant="body2" fontWeight={700} gutterBottom>
        <Trans id="no-data-available.title">No data available</Trans>
      </Typography>
      <Typography variant="body3" color="text.secondary">
        <Trans id="no-data-available.description">
          There is no data available for this operator
        </Trans>
      </Typography>
    </Box>
  );
};
