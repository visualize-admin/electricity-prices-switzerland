import { Trans } from "@lingui/macro";
import VisuallyHidden from "@reach/visually-hidden";
import {
  Box,
  BoxProps,
  Button,
  Checkbox as RebassCheckbox,
  Input as ThemeUiInput,
  Label as ThemeUiLabel,
  Radio as ThemeUiRadio,
  Select as ThemeUiSelect,
  SelectProps,
} from "@theme-ui/components";
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
  <ThemeUiLabel
    htmlFor={htmlFor}
    sx={{
      color: disabled ? "grey[600]" : "grey[700]",
      fontSize: smaller ? [2, 2, 2] : [4, 4, 4],
      pb: smaller ? 1 : 0,
      mr: 4,
      display: "flex",
      alignItems: "center",
    }}
  >
    {children}
    {label && (
      <Box
        sx={{
          maxWidth: "88%",
          textAlign: "left",
          fontFamily: "body",
          pr: 1,
          visibility: showLabel ? "visible" : "hidden",
        }}
      >
        {label}
      </Box>
    )}
  </ThemeUiLabel>
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
        <ThemeUiRadio
          name={name}
          id={`${name}-${value}`}
          value={value}
          onChange={onChange}
          checked={checked}
          disabled={disabled}
          size={20}
          sx={{
            color: checked && !disabled ? "primary" : "grey[500]",
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
    <RebassCheckbox
      sx={{
        // size: 20,
        color: checked && !disabled ? "primary" : "grey[500]",
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
  <Box sx={{ color: "grey[700]", pb: 2 }}>
    {label && (
      <Label htmlFor={id} disabled={disabled} smaller>
        {label}
      </Label>
    )}
    <ThemeUiSelect
      sx={{
        borderColor: "grey[500]",
        fontSize: "1rem",
        bg: "grey[100]",
        pt: 2,
        pb: 2,
        pl: 2,
        pr: 5,
        height: "40px",
        color: disabled ? "grey[500]" : "grey[700]",
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
    </ThemeUiSelect>
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
  <Box sx={{ color: "grey[800]" }}>
    {label && (
      <Label htmlFor={id} smaller>
        {label}
      </Label>
    )}
    <ThemeUiSelect
      sx={{
        borderColor: "transparent",
        fontSize: ["0.625rem", "0.75rem", "0.75rem"],
        fontFamily: "body",
        bg: "transparent",
        py: 0,
        pl: 1,
        pr: 4,
        mr: 1, // Fix for Chrome which cuts of the label otherwise
        ":focus": {
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
    </ThemeUiSelect>
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
  <Box sx={{ color: "grey[700]", fontSize: "1rem" }}>
    {label && name && (
      <Label htmlFor={name} smaller>
        {label}
      </Label>
    )}
    <ThemeUiInput
      sx={{ borderColor: "grey[500]", bg: "grey[100]", height: "40px" }}
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
      sx={{ color: "grey[700]", fontSize: "1rem", position: "relative", ...sx }}
    >
      {label && id && (
        <label htmlFor={id}>
          <VisuallyHidden>{label}</VisuallyHidden>
        </label>
      )}
      <Box
        aria-hidden="true"
        sx={{ position: "absolute", top: "50%", mt: "-8px", ml: 2 }}
      >
        <Icon name="search" size={16} />
      </Box>
      <ThemeUiInput
        sx={{
          flexGrow: 1,
          borderColor: "grey[500]",
          bg: "grey[100]",
          px: 6,
          ":focus": { outline: "none", borderColor: "primary" },
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
          <Button
            variant="reset"
            sx={{ p: 0, cursor: "pointer" }}
            onClick={onReset}
          >
            <VisuallyHidden>
              <Trans id="controls.search.clear">Clear search field</Trans>
            </VisuallyHidden>
            <Box
              aria-hidden="true"
              sx={{ borderRadius: "circle", bg: "grey[600]" }}
            >
              <Icon name="clear" size={16} />
            </Box>
          </Button>
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
      color: "grey[600]",
    }}
    component="legend"
  >
    {legendTitle}
  </Box>
);
