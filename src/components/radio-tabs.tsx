import { Box, Typography } from "@mui/material";
import { ChangeEventHandler, ReactNode, useCallback } from "react";

import { VisuallyHidden } from "src/components/visually-hidden";

import { InfoDialogButton } from "./info-dialog";

type RadioTabsProps<T> = {
  id: string;
  options: { value: T; label: ReactNode }[];
  value: T;
  setValue: (value: T) => void;
  label?: string;
  showLabel?: boolean;
  infoDialogSlug?: string;
};

const STYLES = {
  tabs: {
    active: {
      display: "block",
      position: "relative",
      color: "background.paper",
      bgcolor: "secondary.main",
      flex: "1 0 auto",
      textAlign: "center",
      px: 4,
      py: 2.5,
      fontSize: "1rem",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "monochrome.200",
      borderRightWidth: 0,
      "&:last-of-type": {
        borderRightWidth: 1,
      },
    },
    inactive: {
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      display: "block",
      color: "text.primary",
      bgcolor: "background.paper",
      flex: "1 1 auto",
      textAlign: "center",
      px: 4,
      py: 2.5,
      fontSize: "1rem",
      borderColor: "monochrome.200",
      borderStyle: "solid",
      borderRightWidth: 0,
      cursor: "pointer",
      "&: hover": {
        backgroundColor: "secondary.50",
      },
      "&:last-of-type": {
        borderRightWidth: 1,
      },
    },
  },
} as const;

export const RadioTabs = <T extends string>({
  id,
  options,
  value,
  setValue,
  label,
  showLabel = true,
  infoDialogSlug,
}: RadioTabsProps<T>) => {
  const onTabChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      if (e.currentTarget.checked) {
        setValue(e.currentTarget.value as T);
      }
    },
    [setValue]
  );

  return (
    <Box
      sx={{
        position: "relative",
        flexDirection: "column",
        gap: infoDialogSlug ? 0 : 2,
      }}
      display={"flex"}
    >
      <Box
        typography="meta"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {showLabel && (
          <Typography
            color={"text.primary"}
            variant="h6"
            component="label"
            htmlFor={`radio-tabs-${id}`}
          >
            {label}
          </Typography>
        )}
        {infoDialogSlug && label && (
          <InfoDialogButton iconOnly slug={infoDialogSlug} label={label} />
        )}
      </Box>
      <Box
        sx={{
          justifyItems: "stretch",
          borderRadius: 0.5,
          borderWidth: 1,
          borderColor: "monochrome.200",
        }}
        display="flex"
      >
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <Box
              key={option.value}
              component="label"
              title={
                typeof option.label === "string" ? option.label : undefined
              }
              sx={isActive ? STYLES.tabs.active : STYLES.tabs.inactive}
            >
              <VisuallyHidden>
                <input
                  key={option.value}
                  id={id}
                  type="radio"
                  value={option.value}
                  onChange={onTabChange}
                  checked={isActive}
                />
              </VisuallyHidden>
              {option.label}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
