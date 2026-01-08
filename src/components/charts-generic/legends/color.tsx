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

const useLegendSymbolStyles = makeStyles()(() => ({
  root: {
    display: "inline-block",
  },
  sizeSmall: {
    width: "0.5rem",
    minWidth: "0.5rem",
    height: "0.5rem",
  },
  sizeLine: {
    width: "1rem",
    minWidth: "0.5rem",
    height: "3px",
  },
  circle: {
    borderRadius: "50%",
  },
  square: {},
  line: {},
  diamond: {
    transform: "rotate(45deg)",
    transformOrigin: "center",
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeft: "0.25rem solid transparent",
    borderRight: "0.25rem solid transparent",
  },
  dashedLine: {
    position: "relative",
  },
  dashSegment: {
    position: "absolute",
    top: 0,
    height: "3px",
  },
  dashSegment1: {
    left: 0,
    width: "0.4rem",
  },
  dashSegment2: {
    left: "0.6rem",
    width: "0.4rem",
  },
  dashDotSegment1: {
    left: 0,
    width: "0.2rem",
  },
  dashDotSegment2: {
    left: "0.4rem",
    width: "0.6rem",
  },
}));

export const LegendSymbol = ({
  symbol,
  color,
}: {
  symbol: LegendSymbol;
  color: string;
}) => {
  const { classes, cx } = useLegendSymbolStyles();

  switch (symbol) {
    case "circle":
      return (
        <div
          className={cx(classes.root, classes.sizeSmall, classes.circle)}
          style={{ backgroundColor: color }}
        />
      );

    case "square":
      return (
        <div
          className={cx(classes.root, classes.sizeSmall, classes.square)}
          style={{ backgroundColor: color }}
        />
      );

    case "line":
      return (
        <div
          className={cx(classes.root, classes.sizeLine, classes.line)}
          style={{ backgroundColor: color }}
        />
      );

    case "diamond":
      return (
        <div
          className={cx(classes.root, classes.sizeSmall, classes.diamond)}
          style={{ backgroundColor: color }}
        />
      );

    case "triangle":
      return (
        <span
          className={cx(classes.root, classes.triangle)}
          style={{ borderBottomColor: color }}
        />
      );

    case "dashed-line":
      return (
        <div className={cx(classes.root, classes.sizeLine, classes.dashedLine)}>
          <div
            className={cx(classes.dashSegment, classes.dashSegment1)}
            style={{ backgroundColor: color }}
          />
          <div
            className={cx(classes.dashSegment, classes.dashSegment2)}
            style={{ backgroundColor: color }}
          />
        </div>
      );

    case "arrow":
      return <Icon name="arrowdown" size={ARROW_WIDTH} />;

    case "dash-dot-line":
      return (
        <div className={cx(classes.root, classes.sizeLine, classes.dashedLine)}>
          <div
            className={cx(classes.dashSegment, classes.dashDotSegment1)}
            style={{ backgroundColor: color }}
          />
          <div
            className={cx(classes.dashSegment, classes.dashDotSegment2)}
            style={{ backgroundColor: color }}
          />
        </div>
      );

    default:
      return null;
  }
};

const useLegendItemStyles = makeStyles()(() => ({
  root: {
    position: "relative",
    marginTop: "0.5rem",
    marginRight: "2rem",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: 0,
    gap: "1rem",
    lineHeight: "1rem",
    fontWeight: 400,
    fontSize: "0.625rem",
    color: "#424242",
    "@media (min-width: 600px)": {
      lineHeight: "1.125rem",
      fontSize: "0.75rem",
    },
  },
}));

export const LegendItem = ({
  item,
  color,
  symbol,
}: {
  item: string;
  color: string;
  symbol: LegendSymbol;
}) => {
  const { classes } = useLegendItemStyles();

  return (
    <Box className={classes.root} display="flex">
      <LegendSymbol color={color} symbol={symbol} />
      {item}
    </Box>
  );
};

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
