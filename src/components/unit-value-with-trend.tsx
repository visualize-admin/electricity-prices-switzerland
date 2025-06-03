import { Box, Typography } from "@mui/material";

import { TrendIcon } from "src/components/trend-icon";

const UnitValueWithTrend: React.FC<{
  value: number;
  unit: string;
  trend: "stable" | "increasing" | "decreasing";
}> = ({ value, unit, trend }) => {
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
        {value}
      </Typography>
      <Typography variant="caption" color="text.primary">
        {unit}
      </Typography>
    </Box>
  );
};

export default UnitValueWithTrend;
