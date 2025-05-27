import { Box, Typography } from "@mui/material";

const UnitValueWithTrend: React.FC<{
  value: number;
  unit: string;
  trend: "stable" | "increasing" | "decreasing";
}> = ({ value, unit, trend }) => {
  // TODO
  const trendIcon = {
    stable: "↔️",
    increasing: "📈",
    decreasing: "📉",
  }[trend];

  return (
    <Box sx={{ display: "inline-flex", alignItems: "baseline", gap: 1 }}>
      <span>{trendIcon}</span>
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
