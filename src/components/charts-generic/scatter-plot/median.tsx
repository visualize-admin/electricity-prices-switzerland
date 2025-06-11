import { palette } from "src/themes/palette";

import { useChartState } from "../use-chart-state";

import { ScatterPlotState } from "./scatter-plot-state";

export const ScatterPlotMedian = () => {
  const { medianValue, bounds, xScale, yScale } =
    useChartState() as ScatterPlotState;

  const diamondSize = 8;

  if (!medianValue) {
    return null;
  }

  const x = xScale(medianValue);

  return (
    <g transform={`translate(${bounds.margins.left}, ${bounds.margins.top})`}>
      {yScale.domain().map((yValue) => {
        const y = (yScale(yValue) || 0) + yScale.bandwidth() / 2;
        return (
          <rect
            key={yValue}
            x={x - diamondSize / 2}
            y={y - diamondSize / 2}
            width={diamondSize}
            height={diamondSize}
            fill={palette.monochrome[800]}
            transform={`rotate(45, ${x}, ${y})`}
          />
        );
      })}
    </g>
  );
};
