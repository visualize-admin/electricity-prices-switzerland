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

import { Icon } from "../icons";

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
}) => (
  <Box
    component="label"
    typography="body2"
    htmlFor={htmlFor}
    sx={{
      color: disabled ? "grey.600" : "grey.700",
      fontSize: smaller ? "0.85rem" : "1.15rem",
      pb: smaller ? 1 : 0,
      mr: 4,
      display: "flex",
      alignItems: "center",
      flexGrow: 1,
    }}
  >
    {children}
    {label && (
      <Box
        sx={{
          maxWidth: "88%",
          textAlign: "left",
          pr: 1,
          visibility: showLabel ? "visible" : "hidden",
        }}
      >
        {label}
      </Box>
    )}
  </Box>
);

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
}: { label: React.ReactNode; disabled?: boolean } & FieldProps) => (
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
} & SelectProps) => (
  <Box sx={{ color: "grey.700", pb: 2 }}>
    {label && (
      <Label htmlFor={id} disabled={disabled} smaller>
        {label}
      </Label>
    )}
    <MuiSelect
      sx={{
        borderColor: "grey.500",
        fontSize: "1rem",
        bgcolor: "grey.100",
        pt: 2,
        pb: 2,
        pl: 2,
        pr: 5,
        height: "40px",
        color: disabled ? "grey.500" : "grey.700",
        textOverflow: "ellipsis",
      }}
      id={id}
      name={id}
      onChange={onChange}
      value={value}
      disabled={disabled}
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
} & SelectProps) => (
  <Box sx={{ color: "grey.800" }}>
    {label && (
      <Label htmlFor={id} smaller>
        {label}
      </Label>
    )}
    <MuiSelect
      sx={{
        borderColor: "transparent",
        fontSize: ["0.625rem", "0.75rem", "0.75rem"],
        fontFamily: "body",
        backgroundColor: "transparent",
        py: 0,
        pl: 1,
        pr: 4,
        mr: 1, // Fix for Chrome which cuts of the label otherwise
        ":focus": {
          outline: "none",
          borderColor: "primary.main",
        },
      }}
      id={id}
      name={id}
      onChange={onChange}
      value={value}
    >
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value || undefined}>
          {opt.label}
        </MenuItem>
      ))}
    </MuiSelect>
  </Box>
);

export const Input = ({
  label,
  name,
  value,
  onChange,
}: {
  label?: string | React.ReactNode;
  disabled?: boolean;
} & FieldProps) => (
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
  return (
    <Box
      sx={{
        color: "grey.700",
        fontSize: "1rem",
        position: "relative",
        ...sx,
      }}
    >
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
        sx={{
          flexGrow: 1,
          borderColor: "grey.500",
          bgcolor: "grey.100",
          ":focus": { outline: "none", borderColor: "primary.main" },
        }}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {value && value !== "" && onReset && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            right: 0,
            mt: "-8px",
            mr: 2,
          }}
        >
          <IconButton
            arial-label={
              <Trans id="controls.search.clear">Clear search field</Trans>
            }
            sx={{ p: 0, cursor: "pointer" }}
            onClick={onReset}
          >
            <Icon name="clear" size={16} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export const FieldSetLegend = ({
  legendTitle,
}: {
  legendTitle: string | React.ReactNode;
}) => (
  <Box
    sx={{
      fontFamily: "body",
      lineHeight: ["1rem", "1.125rem", "1.125rem"],
      fontWeight: "regular",
      fontSize: ["0.625rem", "0.75rem", "0.75rem"],
      mb: 1,
      color: "grey.600",
    }}
    component="legend"
  >
    {legendTitle}
  </Box>
);
