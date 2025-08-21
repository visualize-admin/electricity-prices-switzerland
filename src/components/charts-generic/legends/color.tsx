import { Box, Typography } from "@mui/material";
import { memo } from "react";

import {
  ColumnsState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { Icon } from "src/icons";

export type LegendSymbol =
  | "square"
  | "line"
  | "circle"
  | "diamond"
  | "triangle"
  | "arrow";

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

export const ARROW_WIDTH = 16;
export const SORTABLE_EXTERNAL_GAP = 16;
export const SORTABLE_INTERNAL_GAP = 4;

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

    case "arrow":
      return <Icon name="arrowdown" size={ARROW_WIDTH} />;

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

export const SortableLegendItem = <T extends string>({
  item,
  color,
  value,
  handleClick,
  state,
}: {
  item: string;
  color: string;
  value: T;
  state: T;
  handleClick: (value: T) => void;
}) => (
  <Box
    sx={{
      all: "unset",
      display: "flex",
      position: "relative",
      mr: `${SORTABLE_EXTERNAL_GAP}px`,
      justifyContent: "flex-start",
      alignItems: "center",
      pl: 0,
      gap: `${SORTABLE_INTERNAL_GAP}px`,
      color,
      cursor: value === state ? "default" : "pointer",
      opacity: value !== state ? 0.7 : 1,
      textDecoration: value === state ? "underline" : "none",
      textDecorationThickness: value === state ? "1.5px" : "0px",
      textUnderlineOffset: value === state ? "4px" : "0px",
    }}
    component={"button"}
    onClick={() => handleClick(value)}
  >
    <Typography variant="caption" fontWeight={700}>
      {item}
    </Typography>
  </Box>
);
