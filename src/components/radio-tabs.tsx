import { Box } from "@mui/material";
import VisuallyHidden from "@reach/visually-hidden";
import { ChangeEventHandler, useCallback } from "react";

import Flex from "src/components/flex";
import { makeStyles } from "src/themes/makeStyles";

type RadioTabsVariants = "tabs" | "borderlessTabs" | "segmented";

interface RadioTabsProps<T> {
  name: string;
  options: { value: T; label: React.ReactNode }[];
  value: T;
  setValue: (value: T) => void;
  variant?: RadioTabsVariants;
}

const useStyles = makeStyles()((theme) => ({
  tabsActive: {
    display: "block",
    position: "relative",
    color: "primary.main",
    backgroundColor: "grey.100",
    flex: "1 0 auto",
    textAlign: "center",
    padding: theme.spacing(4, 2),
    fontSize: theme.typography.body2.fontSize,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: theme.palette.grey[500],
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightWidth: 0,
    ":last-of-type": {
      borderRightWidth: 1,
      borderRightColor: theme.palette.grey[100],
    },
    ":first-of-type": {
      borderLeftColor: theme.palette.grey[100],
    },
    "::before": {
      content: "''",
      display: "block",
      backgroundColor: theme.palette.primary.main,
      position: "absolute",
      top: 0,
      left: "-1px",
      right: "-1px",
      mt: "-1px",
      height: 4,
    },
  },
  tabsInactive: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    display: "block",
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.grey[200],
    flex: "1 1 auto",
    textAlign: "center",
    px: 2,
    py: 4,
    fontSize: theme.typography.body2.fontSize,
    borderColor: theme.palette.grey[500],
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    ":last-of-type": {
      borderRightWidth: 1,
    },
  },
  borderlessTabsActive: {
    display: "flex",
    position: "relative",
    color: "primary.main",
    backgroundColor: theme.palette.grey[100],
    flex: "1 1 auto",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(4, 2),
    fontSize: theme.typography.body2.fontSize,
    minWidth: "min-content",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: theme.palette.grey[500],
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightWidth: 0,
    ":last-of-type": {
      borderRightWidth: 1,
      borderRightColor: theme.palette.grey[100],
    },
    ":first-of-type": {
      borderLeftColor: theme.palette.grey[100],
    },
    "::before": {
      content: "''",
      display: "block",
      backgroundColor: theme.palette.primary.main,
      position: "absolute",
      top: 0,
      left: "-1px",
      right: "-1px",
      mt: "-1px",
      height: 4,
    },
  },
  borderlessTabsInactive: {
    display: "flex",
    cursor: "pointer",
    color: "secondary",
    alignItems: "center",
    backgroundColor: theme.palette.grey[200],
    flex: "1 1 auto",
    justifyContent: "center",
    minWidth: "min-content",
    textAlign: "center",
    padding: theme.spacing(4, 2),
    fontSize: theme.typography.body2.fontSize,
    borderColor: theme.palette.grey[500],
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    ":first-of-type": {
      borderLeftWidth: 0,
    },
    ":last-of-type": {
      borderRightWidth: 0,
    },
  },
  segmentedActive: {
    display: "block",
    position: "relative",
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.grey[100],
    flex: "1 0 auto",
    textAlign: "center",
    padding: theme.spacing(2),
    fontSize: theme.typography.body2.fontSize,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: theme.palette.grey[500],
    borderRightWidth: 0,

    ":last-of-type": {
      borderRightWidth: 1,
      borderTopRightRadius: "default",
      borderBottomRightRadius: "default",
    },
    ":first-of-type": {
      borderTopLeftRadius: "default",
      borderBottomLeftRadius: "default",
    },
  },
  segmentedInactive: {
    cursor: "pointer",
    display: "block",
    color: theme.palette.secondary.main,
    bgcolor: "grey.200",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    flex: "1 1 auto",
    textAlign: "center",
    padding: theme.spacing(2),
    fontSize: theme.typography.body2.fontSize,
    borderColor: theme.palette.grey[500],
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    ":last-of-type": {
      borderRightWidth: 1,
      borderTopRightRadius: "default",
      borderBottomRightRadius: "default",
    },
    ":first-of-type": {
      borderTopLeftRadius: "default",
      borderBottomLeftRadius: "default",
    },
  },
}));

export const RadioTabs = <T extends string>({
  name,
  options,
  value,
  setValue,
  variant = "tabs",
}: RadioTabsProps<T>) => {
  const onTabChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      if (e.currentTarget.checked) {
        setValue(e.currentTarget.value as T);
      }
    },
    [setValue]
  );

  const { classes } = useStyles();

  return (
    <Flex sx={{ justifyItems: "stretch" }}>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Box
            key={option.value}
            component="label"
            title={typeof option.label === "string" ? option.label : undefined}
            className={
              isActive
                ? classes[`${variant}Active`]
                : classes[`${variant}Inactive`]
            }
          >
            <VisuallyHidden>
              <input
                key={option.value}
                name={name}
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
    </Flex>
  );
};
