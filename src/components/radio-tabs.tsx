import { Flex, Box } from "theme-ui";
import VisuallyHidden from "@reach/visually-hidden";
import { useCallback, ChangeEventHandler } from "react";

type RadioTabsVariants = "tabs" | "segmented";

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
      },
    },
    inactive: {
      display: "block",
      color: "secondary",
      bg: "monochrome200",
      flex: "1 0 auto",
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
      display: "block",
      color: "secondary",
      bg: "monochrome200",
      flex: "1 0 auto",
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
  const onTabChange = useCallback<ChangeEventHandler<HTMLInputElement>>((e) => {
    if (e.currentTarget.checked) {
      setValue(e.currentTarget.value as T);
    }
  }, []);

  const styles = STYLES[variant];

  return (
    <Flex sx={{ justifyItems: "stretch" }}>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Box
            key={option.value}
            as="label"
            sx={isActive ? styles.active : styles.inactive}
          >
            {isActive && variant === "tabs" && (
              <Box
                sx={{
                  display: "block",
                  bg: "primary",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  mt: "-1px",
                  width: "100%",
                  height: 4,
                }}
              />
            )}
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
