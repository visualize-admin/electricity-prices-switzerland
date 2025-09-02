import { Trans } from "@lingui/macro";
import {
  Box,
  BoxProps,
  IconButton,
  InputAdornment,
  NativeSelect,
  nativeSelectClasses,
  NativeSelectProps,
  OutlinedInput,
  Typography,
} from "@mui/material";
import React, { ReactNode } from "react";

import { VisuallyHidden } from "src/components/visually-hidden";
import { Icon } from "src/icons";

type Option = {
  value: string | $FixMe;
  label: string | $FixMe;
  disabled?: boolean;
};

type FieldProps = Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "id" | "name" | "value" | "checked" | "type"
>;

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
        fontSize: ["0.625rem", "0.75rem", "0.75rem"],
        border: 0,
        height: "auto !important",
        bgcolor: "transparent",
        ".MuiInputBase-root": {
          paddingLeft: "0px !important",
        },
        py: 0,
        pl: 0,
        pr: 0,
        minHeight: "unset",
        mr: 1, // Fix for Chrome which cuts of the label otherwise
        "&:focus": {
          bgcolor: "transparent",
          outline: "none",
          borderColor: "primary",
        },
        [`.${nativeSelectClasses.select}.${nativeSelectClasses.select}`]: {
          paddingRight: "12px",
        },
        [`.${nativeSelectClasses.icon}`]: {
          color: "text.primary",
          margin: -2,
          marginRight: -2,
          // width: 16,
          // height: 16,
          border: 0,
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
  label?: string | ReactNode;
  disabled?: boolean;
  value?: string;
  placeholder?: string;
  onReset?: () => void;
  sx?: BoxProps["sx"];
} & FieldProps) => {
  return (
    <OutlinedInput
      size="sm"
      sx={{
        color: "text.500",
        fontSize: "0.875rem",
        position: "relative",
        height: 44,
        borderColor: "monochrome.500",
        ...sx,
      }}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      endAdornment={
        <InputAdornment position="end" sx={{ mr: -2 }}>
          {value && value !== "" && onReset ? (
            <IconButton size="sm" sx={{ mr: 0 }} onClick={onReset}>
              <VisuallyHidden>
                <Trans id="controls.search.clear">Clear search field</Trans>
              </VisuallyHidden>
              <Icon name="clear" />
            </IconButton>
          ) : (
            <InputAdornment position="start">
              {label && id && (
                <label htmlFor={id}>
                  <VisuallyHidden>{label}</VisuallyHidden>
                </label>
              )}
              <Icon name="search" />
            </InputAdornment>
          )}
        </InputAdornment>
      }
    />
  );
};
