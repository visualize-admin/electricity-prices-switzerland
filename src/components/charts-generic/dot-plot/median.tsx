import { palette } from "src/themes/palette";

import { MEDIAN_DIAMOND_SIZE } from "../constants";
import { DotPlotState, useChartState } from "../use-chart-state";

export const DotPlotMedian = () => {
  const { medianValue, xScale, yScale } = useChartState() as DotPlotState;

  if (!medianValue) {
    return null;
  }

  const x = xScale(medianValue);

  return (
    <>
      {yScale.domain().map((yValue) => {
        const y = (yScale(yValue) || 0) + yScale.bandwidth() / 2;
        return (
          <rect
            key={yValue}
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
      })}
    </>
  );
};
