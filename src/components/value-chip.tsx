import { Typography } from "@mui/material";
import React from "react";
import { makeStyles } from "tss-react/mui";

import { getContrastColor } from "src/domain/helpers";

const useStyles = makeStyles()((theme) => ({
  chip: {
    borderRadius: 9999,
    padding: theme.spacing(0, 2),
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-end",
    height: "24px",
  },
}));

const ValueChip: React.FC<{
  color: string | undefined;
  formattedValue: string;
}> = ({ color, formattedValue }) => {
  const { classes } = useStyles();
  return (
    <Typography
      role="status"
      className={classes.chip}
      variant="caption"
      style={{
        background: color,
        color: color ? getContrastColor(color) : undefined,
      }}
    >
      {formattedValue}
    </Typography>
  );
};

export default ValueChip;
