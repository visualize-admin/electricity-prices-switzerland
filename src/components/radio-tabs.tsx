import { Tab, Tabs, TabsProps, tabsClasses } from "@mui/material";
import { useCallback } from "react";

import { makeStyles } from "src/themes/makeStyles";

type RadioTabsVariants = "borderlessTabs" | "segmented";

interface RadioTabsProps<T> {
  name: string;
  options: { value: T; label: React.ReactNode }[];
  value: T;
  setValue: (value: T) => void;
  variant?: RadioTabsVariants;
}

const useStyles = makeStyles()(
  ({ palette: { grey, primary, secondary, text }, shape, spacing }) => ({
    root: {
      width: "100%",
      [`& .${tabsClasses.indicator}`]: {
        top: 0,
        height: 4,
      },

      [`& .${tabsClasses.flexContainer}`]: {
        width: "100%",
        height: "3rem",
      },
    },

    segmentedRoot: {
      [`& .${tabsClasses.indicator}`]: {
        display: "none",
      },
    },
    borderlessTabsRoot: {
      [`$ .${tabsClasses.flexContainer}`]: {
        width: "100%",
        height: "2rem",
      },
    },

    borderlessTabs: {
      backgroundColor: grey[200],
      borderColor: grey[500],
      borderWidth: 1,
      borderRightWidth: 0,
      borderStyle: "solid",
      color: text.secondary,
      display: "block",
      flex: "1 1 auto",
      fontSize: "1rem",
      overflow: "hidden",
      padding: spacing(0, 2),
      position: "relative",
      textAlign: "center",
      textOverflow: "ellipsis",
      minHeight: "auto",
      textTransform: "none",
      whiteSpace: "nowrap",
    },
    borderlessTabsActive: {
      borderBottomColor: "transparent",
      backgroundColor: grey[100],
      color: primary.main,
      flex: "1 0 auto",
      borderLeftWidth: 1,
      borderRightWidth: 0,

      "&:first-of-type": {
        borderLeftWidth: 0,
      },
    },

    segmented: {
      backroundColor: grey[200],
      borderColor: grey[500],
      borderStyle: "solid",
      borderWidth: 1,
      cursor: "pointer",
      color: secondary.main,
      display: "block",
      flex: "1 0 auto",
      fontSize: "1rem",
      padding: spacing(2),
      position: "relative",
      textAlign: "center",
      textTransform: "none",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      borderLeftWidth: 0,
      borderRightWidth: 0,
    },
    segmentedActive: {
      backgroundColor: grey[100],
      borderLeftWidth: 1,
      borderRightWidth: 1,
      color: primary.main,

      backroundColor: grey[200],
      flex: "1 1 auto",
    },
  })
);

export const RadioTabs = <T extends string>({
  options,
  value,
  setValue,
  variant = "borderlessTabs",
}: RadioTabsProps<T>) => {
  const onTabChange: TabsProps["onChange"] = useCallback(
    (e, value: T) => {
      setValue(value as T);
    },
    [setValue]
  );

  const { classes, cx } = useStyles();
  const rootClassName = `${variant}Root` as `${typeof variant}Root`;

  return (
    <Tabs
      value={value}
      onChange={onTabChange}
      className={cx(classes.root, classes[rootClassName])}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        const className = variant;
        const activeClassName = `${variant}Active` as `${typeof variant}Active`;

        return (
          <Tab
            key={option.value}
            label={typeof option.label === "string" ? option.label : undefined}
            value={option.value}
            className={cx(
              classes[className],
              isActive ? classes[activeClassName] : null
            )}
          />
        );
      })}
    </Tabs>
  );
};
