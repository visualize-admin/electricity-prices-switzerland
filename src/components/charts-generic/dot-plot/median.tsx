import { palette } from "src/themes/palette";

import { DotPlotState, useChartState } from "../use-chart-state";

export const DotPlotMedian = () => {
  const { medianValue, xScale, yScale } = useChartState() as DotPlotState;

  const diamondSize = 8;

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
            x={x - diamondSize / 2}
            y={y - diamondSize / 2}
            width={diamondSize}
            height={diamondSize}
            fill={palette.monochrome[800]}
            transform={`rotate(45, ${x}, ${y})`}
          />
        );
      })}
    </>
  );
};
