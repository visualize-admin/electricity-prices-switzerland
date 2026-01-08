import {
  DotPlotState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";

export const DotRowLine = () => {
  const { bounds, yScale } = useChartState() as DotPlotState;
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
