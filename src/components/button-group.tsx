import { Box, BoxProps, Tooltip, Typography } from "@mui/material";
import { ChangeEventHandler, useCallback } from "react";

import { VisuallyHidden } from "src/components/visually-hidden";
import { WikiPageSlug } from "src/domain/wiki";

import { InfoDialogButton } from "./info-dialog";
import TooltipContent from "./tooltip-content";

type ButtonGroupOption<T> = {
  content?: string;
  value: T;
  label: string;
};

type ButtonGroupProps<T> = {
  id: string;
  options: ButtonGroupOption<T>[];
  value: T;
  setValue: (value: T) => void;
  label?: string;
  showLabel?: boolean;
  infoDialogSlug?: WikiPageSlug;
  fitLabelToContent?: boolean;
};

const STYLES = {
  tabs: {
    common: {
      display: "flex",
      flexShrink: 1,
      flexGrow: 0,
      minWidth: 0,
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      px: 4,
      py: 2.5,
      height: "40px",
      fontSize: "0.875rem",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "monochrome.200",
      borderRightWidth: 0,
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      overflow: "hidden",
      "&:first-of-type": {
        borderTopLeftRadius: "2px",
        borderBottomLeftRadius: "2px",
      },
      "&:last-of-type": {
        borderRightWidth: 1,
        borderTopRightRadius: "2px",
        borderBottomRightRadius: "2px",
      },
    },
    active: {
      color: "background.paper",
      bgcolor: "secondary.main",
      overflow: "visible",
      whiteSpace: "normal",
      textOverflow: "unset",
      minWidth: "fit-content",
    },
    inactive: {
      color: "text.primary",
      bgcolor: "background.paper",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "secondary.50",
      },
    },
  },
};

export const ButtonGroup = <T extends string>({
  id,
  options,
  value,
  setValue,
  label,
  showLabel = true,
  infoDialogSlug,
  fitLabelToContent = false,
  ...props
}: ButtonGroupProps<T> & BoxProps) => {
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
      display="flex"
      {...props}
      sx={{
        position: "relative",
        flexDirection: "column",
        gap: infoDialogSlug ? 0 : 2,
        ...props.sx,
      }}
    >
      {showLabel && label ? (
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
              color="text.primary"
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
      ) : null}

      <Box
        display="flex"
        sx={{
          width: "100%",
          flexWrap: "nowrap",
          overflow: "hidden",
          alignItems: "stretch",
        }}
      >
        {options.map((option) => {
          const isActive = option.value === value;
          const { label, content } = option;

          return (
            <Tooltip
              hidden={!label && !content}
              title={<TooltipContent title={label} content={content} />}
              arrow
              key={option.value}
              placement="top"
              slotProps={{
                tooltip: {
                  sx: {
                    padding: 0,
                  },
                },
              }}
            >
              <Box
                component="label"
                role="button"
                title=""
                sx={{
                  flexBasis: "100%",
                  ...STYLES.tabs.common,
                  ...(isActive ? STYLES.tabs.active : STYLES.tabs.inactive),
                  ...(fitLabelToContent
                    ? {
                        "& label": {
                          flexBasis: "content",
                        },
                      }
                    : {}),
                }}
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

                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>{label}</span>
                </span>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};
