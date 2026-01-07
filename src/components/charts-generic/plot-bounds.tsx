import {
  HistogramState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";

export const PlotBounds = () => {
  const { bounds } = useChartState() as HistogramState;

  // Draw debug rect
  return (
    <rect
      x={bounds.margins.left}
      y={bounds.margins.top}
      width={bounds.width - bounds.margins.left - bounds.margins.right}
      height={bounds.height - bounds.margins.top - bounds.margins.bottom}
      fill="none"
      stroke="red"
      strokeWidth={1}
    />
  );
};
