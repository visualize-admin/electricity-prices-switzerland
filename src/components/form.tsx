import { Trans } from "@lingui/macro";
import {
  Box,
  BoxProps,
  Checkbox as MuiCheckbox,
  Radio as MuiRadio,
  Input as MuiInput,
  Select as MuiSelect,
  SelectProps,
  MenuItem,
  IconButton,
  InputAdornment,
} from "@mui/material";
import VisuallyHidden from "@reach/visually-hidden";
import * as React from "react";

import { makeStyles } from "src/themes/makeStyles";

import { Icon } from "../icons";

const useStyles = makeStyles()((theme) => ({
  labelContainer: {
    fontSize: "1.15rem",
    paddingBottom: 0,
    marginRight: theme.spacing(4),
    display: "flex",
    alignItems: "center",
    flexGrow: 1,
    color: theme.palette.grey[700],
  },

  labelContainerSmaller: {
    fontSize: "0.85rem",
    paddingBottom: theme.spacing(1),
  },

  labelContainerDisabled: {
    color: theme.palette.grey[600],
  },

  label: {
    maxWidth: "88%",
    textAlign: "left",
    paddingRight: theme.spacing(1),
    visibility: "hidden",
  },

  labelShowLabel: {
    visibility: "visible",
  },

  select: {
    borderColor: theme.palette.grey[500],
    fontSize: "1rem",
    bgcolor: theme.palette.grey[100],
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(5),
    height: "40px",
    color: theme.palette.grey[700],
    textOverflow: "ellipsis",
  },

  selectDisabled: {
    color: theme.palette.grey[500],
  },

  miniSelect: {
    borderColor: "transparent",
    fontSize: "0.625rem",
    [theme.breakpoints.up("sm")]: {
      fontSize: "0.75rem",
    },
    backgroundColor: "transparent",
    paddingTop: theme.spacing(0),
    paddingBottom: theme.spacing(0),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2),
    marginRight: theme.spacing(1), // Fix for Chrome which cuts of the label otherwise
    "&.Mui-focused": {
      outline: "none",
      borderColor: theme.palette.primary.main,
    },
  },

  searchField: {
    color: theme.palette.grey[700],
    fontSize: "1rem",
    position: "relative",
  },

  searchFieldInput: {
    "& input": {
      paddingBottom: 0,
    },
    alignItems: "center",
    borderColor: theme.palette.grey[500],
    bgcolor: theme.palette.grey[100],
    ".Mui-focused &": {
      outline: "none",
      borderColor: theme.palette.primary.main,
    },
  },

  fieldSetLegend: {
    fontFamily: "body",
    marginBottom: theme.spacing(1),
    color: theme.palette.grey[600],
    fontWeight: "normal",

    lineHeight: "1rem",
    fontSize: "0.625rem",
    [theme.breakpoints.up("sm")]: {
      lineHeight: "1.25rem",
      fontSize: "0.75rem",
    },
  },
}));

export type Option = {
  value: string | $FixMe;
  label: string | $FixMe;
  disabled?: boolean;
};

export type FieldProps = Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "id" | "name" | "value" | "checked" | "type"
>;

export const Label = ({
  label,
  htmlFor,
  disabled,
  smaller = false,
  children,
  showLabel = true,
}: {
  label?: string | React.ReactNode;
  htmlFor: string;
  disabled?: boolean;
  smaller?: boolean;
  children: React.ReactNode;
  showLabel?: boolean;
}) => {
  const { classes, cx } = useStyles();
  return (
    <Box
      component="label"
      typography="body2"
      htmlFor={htmlFor}
      className={cx(
        classes.labelContainer,
        smaller && classes.labelContainerSmaller,
        disabled && classes.labelContainerDisabled
      )}
    >
      {children}
      {label && (
        <Box className={cx(classes.label, showLabel && classes.labelShowLabel)}>
          {label}
        </Box>
      )}
    </Box>
  );
};

export const Radio = ({
  label,
  name,
  value,
  checked,
  disabled,
  onChange,
}: { label: string | React.ReactNode; disabled?: boolean } & FieldProps) => {
  return (
    <Box mb={2}>
      <Label label={label} htmlFor={`${name}-${value}`} disabled={disabled}>
        <MuiRadio
          name={name}
          id={`${name}-${value}`}
          value={value}
          onChange={onChange}
          checked={checked}
          disabled={disabled}
          sx={{
            color: checked && !disabled ? "primary.main" : "grey.500",
          }}
        />
      </Label>
    </Box>
  );
};

export const Checkbox = ({
  label,
  name,
  value,
  checked,
  disabled,
  onChange,
}: { label: React.ReactNode; disabled?: boolean } & FieldProps) => {
  return (
    <Label label={label} htmlFor={`${name}-${label}`} disabled={disabled}>
      <MuiCheckbox
        sx={{
          // size: 20,
          color: checked && !disabled ? "primary.main" : "grey.500",
        }}
        id={`${name}-${label}`}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
    </Label>
  );
};

export const Select = ({
  label,
  id,
  value,
  disabled,
  options,
  onChange,
}: {
  id: string;
  options: Option[];
  label?: React.ReactNode;
  disabled?: boolean;
} & SelectProps) => {
  const { classes } = useStyles();
  return (
    <Box sx={{ color: "grey.700", pb: 2 }}>
      {label && (
        <Label htmlFor={id} disabled={disabled} smaller>
          {label}
        </Label>
      )}
      <MuiSelect
        id={id}
        name={id}
        onChange={onChange}
        value={value}
        disabled={disabled}
        className={classes.select}
      >
        {options.map((opt) => (
          <MenuItem
            key={opt.value}
            disabled={opt.disabled}
            value={opt.value || undefined}
          >
            {opt.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </Box>
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
  label?: React.ReactNode;
  disabled?: boolean;
} & BoxProps<"select">) => {
  const { classes } = useStyles();
  return (
    <Box sx={{ color: "grey.800" }}>
      {label && (
        <Label htmlFor={id} smaller>
          {label}
        </Label>
      )}
      <Box
        component="select"
        typography="body2"
        id={id}
        name={id}
        onChange={onChange}
        value={value}
        className={classes.miniSelect}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value || undefined}>
            {opt.label}
          </option>
        ))}
      </Box>
    </Box>
  );
};

export const Input = ({
  label,
  name,
  value,
  onChange,
}: {
  label?: string | React.ReactNode;
  disabled?: boolean;
} & FieldProps) => {
  return (
    <Box sx={{ color: "grey.700", fontSize: "1rem" }}>
      {label && name && (
        <Label htmlFor={name} smaller>
          {label}
        </Label>
      )}
      <MuiInput
        sx={{
          borderColor: "grey.500",
          bgcolor: "grey.100",
          height: "40px",
        }}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
      />
    </Box>
  );
};

export const SearchField = ({
  id,
  label,
  value,
  placeholder,
  onChange,
  onReset,
  sx,
}: {
  id: string;
  label?: string | React.ReactNode;
  disabled?: boolean;
  value?: string;
  placeholder?: string;
  onReset?: () => void;
  sx?: BoxProps["sx"];
} & FieldProps) => {
  const { classes } = useStyles();
  return (
    <Box className={classes.searchField} sx={sx}>
      {label && id && (
        <label htmlFor={id}>
          <VisuallyHidden>{label}</VisuallyHidden>
        </label>
      )}
      <MuiInput
        startAdornment={
          <InputAdornment position="start">
            <Icon name="search" size={16} />
          </InputAdornment>
        }
        endAdornment={
          value && value !== "" && onReset ? (
            <InputAdornment position="end">
              <IconButton
                arial-label={
                  <Trans id="controls.search.clear">Clear search field</Trans>
                }
                sx={{ p: 0, cursor: "pointer" }}
                onClick={onReset}
              >
                <Icon name="clear" size={16} />
              </IconButton>
            </InputAdornment>
          ) : null
        }
        fullWidth
        id={id}
        size="small"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={classes.searchFieldInput}
      />
    </Box>
  );
};

export const FieldSetLegend = ({
  legendTitle,
}: {
  legendTitle: string | React.ReactNode;
}) => {
  const { classes } = useStyles();
  return (
    <Box component="legend" className={classes.fieldSetLegend}>
      {legendTitle}
    </Box>
  );
};
