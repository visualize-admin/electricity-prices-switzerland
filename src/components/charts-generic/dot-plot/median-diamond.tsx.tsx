import { MEDIAN_DIAMOND_SIZE } from "src/components/charts-generic/constants";
import { palette } from "src/themes/palette";

export const MedianDiamond: React.FC<{
  x: number;
  y: number;
  yValue: unknown;
}> = ({ x, y, yValue }) => (
  <rect
    key={`median-${yValue}`}
    x={x - MEDIAN_DIAMOND_SIZE / 2}
    y={y - MEDIAN_DIAMOND_SIZE / 2}
    width={MEDIAN_DIAMOND_SIZE}
    height={MEDIAN_DIAMOND_SIZE}
    fill={palette.monochrome[800]}
    stroke={palette.background.paper}
    strokeWidth={1}
    transform={`rotate(45, ${x}, ${y})`}
  />
);
