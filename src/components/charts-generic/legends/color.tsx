import { Box } from "@mui/material";
import { memo } from "react";

import {
  ColumnsState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";

export type LegendSymbol = "square" | "line" | "circle" | "diamond";

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
            height: "0.5rem",
            bgcolor: color,
            transform: "rotate(45deg)",
            transformOrigin: "center",
            display: "inline-block",
          }}
        />
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
      gap: "0.375rem",
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
