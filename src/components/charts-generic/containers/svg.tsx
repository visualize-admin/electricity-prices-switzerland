import { ReactNode } from "react";

import { useChartState } from "src/components/charts-generic/use-chart-state";

export const ChartSvg = ({ children }: { children: ReactNode }) => {
  const { bounds } = useChartState();
  const { width, height } = bounds;
  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      {children}
    </svg>
  );
};
