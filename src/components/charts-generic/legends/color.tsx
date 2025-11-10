import { Box, Button, Typography } from "@mui/material";
import { memo } from "react";
import { makeStyles } from "tss-react/mui";

import {
  ColumnsState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { Icon } from "src/icons";
import { IconArrowUp } from "src/icons/ic-arrow-up";

export type LegendSymbol =
  | "square"
  | "line"
  | "circle"
  | "diamond"
  | "triangle"
  | "arrow"
  | "dashed-line"
  | "dash-dot-line";

export const LegendColor = memo(({ symbol }: { symbol: LegendSymbol }) => {
  const { colors } = useChartState() as ColumnsState;

  return (
    <Box
      sx={{
        position: "relative",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        flexWrap: "wrap",
        minHeight: "20px",
      }}
      display="flex"
    >
      {colors.domain().map((item, i) => (
        <LegendItem key={i} item={item} color={colors(item)} symbol={symbol} />
      ))}
    </Box>
  );
});

const ARROW_WIDTH = 16;

export const LegendSymbol = ({
  symbol,
  color,
}: {
  symbol: LegendSymbol;
  color: string;
}) => {
  switch (symbol) {
    case "circle":
      return (
        <Box
          sx={{
            width: "0.5rem",
            minWidth: "0.5rem",
            height: "0.5rem",
            borderRadius: "50%",
            bgcolor: color,
            display: "inline-block",
          }}
        />
      );

    case "square":
      return (
        <Box
          sx={{
            width: "0.5rem",
            minWidth: "0.5rem",
            height: "0.5rem",
            bgcolor: color,
            display: "inline-block",
          }}
        />
      );

    case "line":
      return (
        <Box
          sx={{
            width: "1rem",
            minWidth: "0.5rem",
            height: "3px",
            bgcolor: color,
            display: "inline-block",
          }}
        />
      );

    case "diamond":
      return (
        <Box
          sx={{
            width: "0.5rem",
            minWidth: "0.5rem",
            height: "0.5rem",
            bgcolor: color,
            transform: "rotate(45deg)",
            transformOrigin: "center",
            display: "inline-block",
          }}
        />
      );

    case "triangle":
      return (
        <Box
          component="span"
          sx={{
            width: 0,
            height: 0,
            display: "inline-block",
            borderLeft: "0.25rem solid transparent",
            borderRight: "0.25rem solid transparent",
            borderBottom: `0.5rem solid ${color}`,
          }}
        />
      );

    case "dashed-line":
      return (
        <Box
          sx={{
            width: "1rem",
            minWidth: "0.5rem",
            height: "3px",
            display: "inline-block",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              left: "0",
              top: "0",
              width: "0.4rem",
              height: "3px",
              bgcolor: color,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              left: "0.6rem",
              top: "0",
              width: "0.4rem",
              height: "3px",
              bgcolor: color,
            }}
          />
        </Box>
      );

    case "arrow":
      return <Icon name="arrowdown" size={ARROW_WIDTH} />;

    case "dash-dot-line":
      return (
        <Box
          sx={{
            width: "1rem",
            minWidth: "0.5rem",
            height: "3px",
            display: "inline-block",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              left: "0",
              top: "0",
              width: "0.2rem",
              height: "3px",
              bgcolor: color,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              left: "0.4rem",
              top: "0",
              width: "0.6rem",
              height: "3px",
              bgcolor: color,
            }}
          />
        </Box>
      );

    default:
      return null;
  }
};

export const LegendItem = ({
  item,
  color,
  symbol,
}: {
  item: string;
  color: string;
  symbol: LegendSymbol;
}) => (
  <Box
    sx={{
      position: "relative",
      mt: 1,
      mr: 4,
      justifyContent: "flex-start",
      alignItems: "center",
      pl: 0,
      gap: 1,
      lineHeight: ["1rem", "1.125rem", "1.125rem"],
      fontWeight: "regular",
      fontSize: ["0.625rem", "0.75rem", "0.75rem"],
      color: "secondary.700",
    }}
    display="flex"
  >
    <LegendSymbol color={color} symbol={symbol} />
    {item}
  </Box>
);
const useStyles = makeStyles()(() => ({
  button: {
    cursor: "pointer",
    opacity: 1,
    minWidth: 0,
    padding: 0,
    "&:hover": {
      "--icon-opacity": 0.8,
    },
  },
  iconActive: {
    "--icon-opacity": 1,
  },
  iconInactive: {
    "--icon-opacity": 0,
  },
  icon: {
    width: 16,
    height: 16,
    display: "inline-block",
    transformOrigin: "center",
    transition: "opacity 0.1s ease-in-out, transform 0.2s ease-in-out",
    opacity: "var(--icon-opacity)",
  },
  iconAsc: {
    transform: "rotate(0deg)",
  },
  iconDesc: {
    transform: "rotate(180deg)",
  },
}));

export const SortableLegendItem = <T extends string>({
  item,
  color,
  value,
  handleClick,
  active,
  direction,
}: {
  item: string;
  color: string;
  value: T;
  active: boolean;
  direction: "asc" | "desc";
  handleClick: (value: T) => void;
}) => {
  const { classes, cx } = useStyles();

  return (
    <Button
      variant="text"
      endIcon={
        <IconArrowUp
          width={16}
          height={16}
          className={cx(
            classes.icon,

            active
              ? direction === "asc"
                ? classes.iconAsc
                : classes.iconDesc
              : undefined
          )}
        />
      }
      onClick={() => handleClick(value)}
      className={cx(
        classes.button,
        active ? classes.iconActive : classes.iconInactive
      )}
      sx={{
        color: color,
        "&:hover": {
          color: color,
        },
      }}
    >
      <Typography variant="caption" fontWeight={700}>
        {item}
      </Typography>
    </Button>
  );
};
