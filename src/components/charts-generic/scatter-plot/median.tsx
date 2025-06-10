import { palette } from "src/themes/palette";

import { useChartState } from "../use-chart-state";

import { ScatterPlotState } from "./scatter-plot-state";

export const ScatterPlotMedian = () => {
  const {
    medianValue: m,
    bounds,
    xScale,
  } = useChartState() as ScatterPlotState;

  const diamondSize = 8;

  if (!m) {
    return null;
  }

  const x = xScale(m);
  const y = bounds.chartHeight / 2 + bounds.margins.top;
  return (
    <rect
      x={x - diamondSize / 2}
      y={y - diamondSize / 2}
      width={diamondSize}
      height={diamondSize}
      color={palette.monochrome[800]}
      transform={`rotate(45, ${x}, ${y})`}
    />
  );
};
