import { Box } from "@mui/material";
import { memo } from "react";

import {
  ColumnsState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";

export type LegendSymbol = "square" | "line" | "circle";

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
  return (
    <Box
      sx={{
        content: "''",
        position: "relative",
        display: "block",
        width: ".5rem",
        height: symbol === "square" || symbol === "circle" ? `.5rem` : 3,
        borderRadius: symbol === "circle" ? "50%" : 0,
        bgcolor: color,
      }}
    />
  );
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
