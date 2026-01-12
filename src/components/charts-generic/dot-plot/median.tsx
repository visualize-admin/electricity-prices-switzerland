import { MedianDiamond } from "src/components/charts-generic/dot-plot/median-diamond.tsx";

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
        return <MedianDiamond x={x} y={y} yValue={yValue} />;
      })}
    </>
  );
};
