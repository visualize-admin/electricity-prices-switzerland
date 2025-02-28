import { Trans } from "@lingui/macro";
import {
  Box,
  BoxProps,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputBase,
  Checkbox as MuiCheckbox,
  Radio as MuiRadio,
  Select as MuiSelect,
  NativeSelect,
  NativeSelectProps,
  OutlinedInput,
  SelectProps,
  Typography,
} from "@mui/material";
import * as React from "react";

import VisuallyHidden from "src/components/VisuallyHidden";
import { Icon } from "src/icons";

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
  <Typography
    variant="inherit"
    component="label"
    display="block"
    htmlFor={htmlFor}
    sx={{
      color: disabled ? "grey.600" : "grey.700",
      fontSize: smaller ? "0.75rem" : "1rem",
      pb: smaller ? 1 : 0,
      mr: 4,
      display: "flex",
      width: "100%",
      alignItems: "center",
      lineHeight: 1,
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
  </Typography>
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
      <FormControlLabel
        disabled={disabled}
        label={label}
        control={
          <MuiRadio
            name={name}
            id={`${name}-${value}`}
            value={value}
            onChange={onChange}
            checked={checked}
            disabled={disabled}
            sx={{
              color: checked && !disabled ? "primary" : "grey.500",
            }}
          />
        }
      />
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
  <FormControlLabel
    label={label}
    htmlFor={`${name}-${label}`}
    control={
      <MuiCheckbox
        sx={{
          color: checked && !disabled ? "primary" : "grey.500",
        }}
        id={`${name}-${label}`}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
    }
    disabled={disabled}
  />
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
        <option
          key={opt.value}
          disabled={opt.disabled}
          value={opt.value || undefined}
        >
          {opt.label}
        </option>
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
} & NativeSelectProps) => (
  <Box sx={{ color: "grey.800" }}>
    {label && (
      <Label htmlFor={id} smaller>
        {label}
      </Label>
    )}
    <NativeSelect
      disableUnderline
      sx={{
        borderColor: "transparent",
        fontSize: ["0.625rem", "0.75rem", "0.75rem"],
        borderBottom: 0,
        bgcolor: "transparent",
        py: 0,
        pl: 1,
        pr: 4,
        mr: 1, // Fix for Chrome which cuts of the label otherwise
        "&:focus": {
          bgcolor: "transparent",
          outline: "none",
          borderColor: "primary",
        },
      }}
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
    <InputBase
      sx={{ borderColor: "grey.500", bgcolor: "grey.100", height: "40px" }}
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
    <OutlinedInput
      size="small"
      sx={{ color: "grey.700", fontSize: "1rem", position: "relative", ...sx }}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      startAdornment={
        <InputAdornment position="start">
          {label && id && (
            <label htmlFor={id}>
              <VisuallyHidden>{label}</VisuallyHidden>
            </label>
          )}
          <Icon name="search" size={16} />
        </InputAdornment>
      }
      endAdornment={
        <InputAdornment position="end" sx={{ mr: -2 }}>
          {value && value !== "" && onReset && (
            <IconButton size="small" sx={{ mr: 0 }} onClick={onReset}>
              <VisuallyHidden>
                <Trans id="controls.search.clear">Clear search field</Trans>
              </VisuallyHidden>
              <Icon name="clear" size={16} />
            </IconButton>
          )}
        </InputAdornment>
      }
    />
  );
};

export const FieldSetLegend = ({
  legendTitle,
}: {
  legendTitle: string | React.ReactNode;
}) => (
  <Box
    sx={{
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
