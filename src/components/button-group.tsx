import { Box, BoxProps, Tooltip, Typography } from "@mui/material";
import { ChangeEventHandler, useCallback } from "react";
import { makeStyles } from "tss-react/mui";

import { VisuallyHidden } from "src/components/visually-hidden";
import { WikiPageSlug } from "src/domain/types";
import { palette } from "src/themes/palette";

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
  tabProps?: BoxProps;
  wrapOnMobile?: boolean;
};

const useStyles = makeStyles<{ wrapOnMobile: boolean }>()(
  (theme, { wrapOnMobile }) => ({
    tabsContainer: {
      display: "flex",
      width: "100%",
      flexWrap: "nowrap",
      overflow: "hidden",
      alignItems: "stretch",
      ...(wrapOnMobile && {
        [theme.breakpoints.down("sm")]: {
          flexDirection: "column",
        },
      }),
    },
    tab: {
      display: "flex",
      flexShrink: 1,
      flexGrow: 0,
      minWidth: 0,
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: theme.spacing(2.5, 4),
      height: "40px",
      fontSize: "0.875rem",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: theme.palette.monochrome[200],
      borderRightWidth: 0,
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      overflow: "hidden",
      flexBasis: "100%",
      "&:first-of-type": {
        borderTopLeftRadius: "2px",
        borderBottomLeftRadius: "2px",
      },
      "&:last-of-type": {
        borderRightWidth: 1,
        borderTopRightRadius: "2px",
        borderBottomRightRadius: "2px",
      },
      ...(wrapOnMobile && {
        [theme.breakpoints.down("sm")]: {
          borderRightWidth: 1,
          borderBottomWidth: 0,
          "&:first-of-type": {
            borderTopLeftRadius: "2px",
            borderTopRightRadius: "2px",
            borderBottomLeftRadius: 0,
          },
          "&:last-of-type": {
            borderBottomWidth: 1,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: "2px",
            borderBottomRightRadius: "2px",
          },
        },
      }),
    },
    tabActive: {
      color: theme.palette.background.paper,
      backgroundColor: theme.palette.secondary.main,
      overflow: "visible",
      whiteSpace: "normal",
      textOverflow: "unset",
      minWidth: "fit-content",
    },
    tabInactive: {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.paper,
      cursor: "pointer",
      "&:hover": {
        backgroundColor: palette.secondary[50],
      },
    },
    fitLabelToContent: {
      "& label": {
        flexBasis: "content",
      },
    },
  })
);

export const ButtonGroup = <T extends string>({
  id,
  options,
  value,
  setValue,
  label,
  showLabel = true,
  infoDialogSlug,
  fitLabelToContent = false,
  tabProps,
  wrapOnMobile = false,
  ...props
}: ButtonGroupProps<T> & BoxProps) => {
  const { classes, cx } = useStyles({ wrapOnMobile });
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
      position="relative"
      flexDirection="column"
      maxWidth="100%"
      overflow="hidden"
      sx={{
        gap: infoDialogSlug ? 0 : 2,
        ...props.sx,
      }}
    >
      {showLabel && label ? (
        <Box
          typography="meta"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
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

      <Box className={classes.tabsContainer} {...tabProps}>
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
                className={cx(
                  classes.tab,
                  isActive ? classes.tabActive : classes.tabInactive,
                  fitLabelToContent && classes.fitLabelToContent
                )}
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
