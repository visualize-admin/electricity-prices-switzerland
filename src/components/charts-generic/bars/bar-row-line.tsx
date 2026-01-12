import {
  StackedBarsState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";

export const BarRowLine = () => {
  const { bounds, yScale } = useChartState() as StackedBarsState;
  const { gridColor } = useChartTheme();

  const cy = yScale.bandwidth() / 2;

  return (
    <line
      x1={0}
      x2={bounds.chartWidth}
      y1={cy}
      y2={cy}
      stroke={gridColor}
      strokeWidth={1}
      fill="none"
    />
  );
};

export const MedianVerticalLine = ({ value }: { value: number }) => {
  const { xScale, yScale } = useChartState() as StackedBarsState;

  const x = xScale(value);
  const height = yScale.bandwidth();

  return (
    <line
      x1={x}
      x2={x}
      y1={0}
      y2={height}
      stroke="black"
      strokeWidth={2}
      fill="none"
    />
  );
};
