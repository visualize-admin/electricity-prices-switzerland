import { Box, Typography } from "@mui/material";

import { TrendIcon } from "src/components/trend-icon";
import { useFormatDisplayNumber } from "src/domain/helpers";
import { Trend } from "src/graphql/resolver-types";

const roundTo = (value: number, round?: number): number => {
  if (round === undefined) return value;
  const factor = 10 ** round;
  return Math.round(value * factor) / factor;
};

const UnitValueWithTrend: React.FC<{
  value: number;
  unit: string;
  trend: Trend | undefined | null;
  round?: number;
}> = ({ value, unit, trend, round }) => {
  const formatDisplay = useFormatDisplayNumber();
  const formatted = formatDisplay(roundTo(value, round));

  return (
    <Box display="inline-flex" alignItems="baseline" gap={1}>
      <span>
        <TrendIcon trend={trend} />
      </span>
      <Typography
        variant="h3"
        color="text.primary"
        component="span"
        fontWeight={700}
      >
        {formatted}
      </Typography>
      <Typography variant="caption" color="text.primary">
        {unit}
      </Typography>
    </Box>
  );
};

export default UnitValueWithTrend;
