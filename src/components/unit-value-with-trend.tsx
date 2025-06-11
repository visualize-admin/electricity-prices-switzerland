import { Box, Typography } from "@mui/material";

import { TrendIcon } from "src/components/trend-icon";

const roundTo = (value: number, round?: number): number => {
  if (round === undefined) return value;
  const factor = Math.pow(10, round);
  return Math.round(value * factor) / factor;
};

const UnitValueWithTrend: React.FC<{
  value: number;
  unit: string;
  trend: "stable" | "increasing" | "decreasing";
  round?: number;
}> = ({ value, unit, trend, round }) => {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "baseline", gap: 1 }}>
      <span>
        <TrendIcon trend={trend} />
      </span>
      <Typography
        variant="h3"
        color="text.primary"
        component="span"
        fontWeight={700}
      >
        {roundTo(value, round)}
      </Typography>
      <Typography variant="caption" color="text.primary">
        {unit}
      </Typography>
    </Box>
  );
};

export default UnitValueWithTrend;
