import {
  Box,
  NativeSelect,
  nativeSelectClasses,
  NativeSelectProps,
  Typography,
} from "@mui/material";
import React, { ReactNode } from "react";
import { makeStyles } from "tss-react/mui";

type Option = {
  value: string | $FixMe;
  label: string | $FixMe;
  disabled?: boolean;
};

const useLabelStyles = makeStyles<{ disabled?: boolean; smaller?: boolean }>()(
  (theme, { disabled, smaller }) => ({
    root: {
      color: disabled ? theme.palette.grey[600] : theme.palette.grey[700],
      fontSize: smaller ? "0.75rem" : "1rem",
      paddingBottom: smaller ? theme.spacing(1) : 0,
      marginRight: theme.spacing(4),
      display: "flex",
      width: "100%",
      alignItems: "center",
      lineHeight: 1,
    },
    labelBox: {
      maxWidth: "88%",
      textAlign: "left",
      paddingRight: theme.spacing(1),
    },
  })
);

const useSelectStyles = makeStyles()((theme) => ({
  container: {
    color: theme.palette.grey[800],
  },
  select: {
    "&&": {
      fontSize: "0.75rem",
      [theme.breakpoints.down("sm")]: {
        fontSize: "0.625rem",
      },
    },
    border: 0,
    height: "auto !important",
    padding: 0,
    minHeight: "unset",
    "&:focus": {
      backgroundColor: "transparent",
      outline: "none",
      borderColor: theme.palette.primary.main,
    },
    [`& .${nativeSelectClasses.select}.${nativeSelectClasses.select}`]: {
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",

      //  Use this trick to have the focus background color extend "below"
      // the icon
      marginRight: "-20px",
      paddingRight: "20px",
    },
    [`& .${nativeSelectClasses.icon}`]: {
      color: theme.palette.text.primary,
      padding: 0,
      width: 24,
      height: 24,
      border: 0,
      position: "static",
    },
  },
}));

const Label = ({
  label,
  htmlFor,
  disabled,
  smaller = false,
  children,
  showLabel = true,
}: {
  label?: string | ReactNode;
  htmlFor: string;
  disabled?: boolean;
  smaller?: boolean;
  children: ReactNode;
  showLabel?: boolean;
}) => {
  const { classes } = useLabelStyles({ disabled, smaller });

  return (
    <Typography
      variant="inherit"
      component="label"
      display="block"
      htmlFor={htmlFor}
      className={classes.root}
    >
      {children}
      {label && (
        <Box
          className={classes.labelBox}
          sx={{ visibility: showLabel ? "visible" : "hidden" }}
        >
          {label}
        </Box>
      )}
    </Typography>
  );
};

export const MiniSelect = ({
  label,
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  options: Option[];
  label?: ReactNode;
  disabled?: boolean;
} & NativeSelectProps) => {
  const { classes } = useSelectStyles();

  return (
    <Box className={classes.container}>
      {label && (
        <Label htmlFor={id} smaller>
          {label}
        </Label>
      )}
      <NativeSelect
        disableUnderline
        className={classes.select}
        id={id}
        name={id}
        onChange={onChange}
        value={value}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value || undefined}>
            {opt.label}
          </option>
        ))}
      </NativeSelect>
    </Box>
  );
};
