import VisuallyHidden from "@reach/visually-hidden";
import { ChangeEventHandler, useCallback } from "react";
import { Box, Flex } from "theme-ui";

type RadioTabsVariants = "tabs" | "borderlessTabs" | "segmented";

interface RadioTabsProps<T> {
  name: string;
  options: { value: T; label: React.ReactNode }[];
  value: T;
  setValue: (value: T) => void;
  variant?: RadioTabsVariants;
}

const STYLES = {
  tabs: {
    active: {
      display: "block",
      position: "relative",
      color: "primary",
      bg: "monochrome100",
      flex: "1 0 auto",
      textAlign: "center",
      px: 2,
      py: 4,
      fontSize: 4,
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "monochrome500",
      borderTopColor: "transparent",
      borderBottomColor: "transparent",
      borderRightWidth: 0,
      ":last-of-type": {
        borderRightWidth: 1,
        borderRightColor: "monochrome100",
      },
      ":first-of-type": {
        borderLeftColor: "monochrome100",
      },
      "::before": {
        content: "''",
        display: "block",
        bg: "primary",
        position: "absolute",
        top: 0,
        left: "-1px",
        right: "-1px",
        mt: "-1px",
        height: 4,
      },
    },
    inactive: {
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      display: "block",
      color: "secondary",
      bg: "monochrome200",
      flex: "1 1 auto",
      textAlign: "center",
      px: 2,
      py: 4,
      fontSize: 4,
      borderColor: "monochrome500",
      borderStyle: "solid",
      borderWidth: 1,
      borderRightWidth: 0,
      ":last-of-type": {
        borderRightWidth: 1,
      },
    },
  },
  borderlessTabs: {
    active: {
      display: "flex",
      position: "relative",
      color: "primary",
      bg: "monochrome100",
      flex: "1 1 auto",
      textAlign: "center",
      justifyContent: "center",
      alignItems: "center",
      px: 2,
      py: 4,
      fontSize: 4,
      minWidth: "min-content",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "monochrome500",
      borderTopColor: "transparent",
      borderBottomColor: "transparent",
      borderRightWidth: 0,
      ":last-of-type": {
        borderRightWidth: 1,
        borderRightColor: "monochrome100",
      },
      ":first-of-type": {
        borderLeftColor: "monochrome100",
      },
      "::before": {
        content: "''",
        display: "block",
        bg: "primary",
        position: "absolute",
        top: 0,
        left: "-1px",
        right: "-1px",
        mt: "-1px",
        height: 4,
      },
    },
    inactive: {
      display: "flex",
      cursor: "pointer",
      color: "secondary",
      alignItems: "center",
      bg: "monochrome200",
      flex: "1 1 auto",
      justifyContent: "center",
      minWidth: "min-content",
      textAlign: "center",
      px: 2,
      py: 4,
      fontSize: 4,
      borderColor: "monochrome500",
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
  },
  segmented: {
    active: {
      display: "block",
      position: "relative",
      color: "primary",
      bg: "monochrome100",
      flex: "1 0 auto",
      textAlign: "center",
      p: 2,
      fontSize: 3,
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "monochrome500",
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
    inactive: {
      cursor: "pointer",
      display: "block",
      color: "secondary",
      bg: "monochrome200",
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      flex: "1 1 auto",
      textAlign: "center",
      p: 2,
      fontSize: 3,
      borderColor: "monochrome500",
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
  },
} as const;

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

  const styles = STYLES[variant];

  return (
    <Flex sx={{ justifyItems: "stretch" }}>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Box
            key={option.value}
            as="label"
            title={typeof option.label === "string" ? option.label : undefined}
            sx={isActive ? styles.active : styles.inactive}
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
