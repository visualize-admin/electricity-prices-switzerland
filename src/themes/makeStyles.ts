import { useTheme } from "@mui/material/styles";
import { createMakeAndWithStyles } from "tss-react";

export const { makeStyles, useStyles, withStyles } = createMakeAndWithStyles({
  useTheme,
});
