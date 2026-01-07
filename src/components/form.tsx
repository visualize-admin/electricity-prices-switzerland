import { Trans } from "@lingui/macro";
import {
  BoxProps,
  IconButton,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";
import React, { ReactNode } from "react";

import { VisuallyHidden } from "src/components/visually-hidden";
import { Icon } from "src/icons";

type FieldProps = Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "id" | "name" | "value" | "checked" | "type"
>;

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
        <InputAdornment position="end">
          {value && value !== "" && onReset ? (
            <IconButton size="sm" sx={{ mr: -2 }} onClick={onReset}>
              <VisuallyHidden>
                <Trans id="controls.search.clear">Clear search field</Trans>
              </VisuallyHidden>
              <Icon name="clear" />
            </IconButton>
          ) : (
            <>
              {label && id && (
                <label htmlFor={id}>
                  <VisuallyHidden>{label}</VisuallyHidden>
                </label>
              )}
              <Icon name="search" />
            </>
          )}
        </InputAdornment>
      }
    />
  );
};
