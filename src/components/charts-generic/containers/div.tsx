import { ReactNode } from "react";

import { useChartState } from "src/components/charts-generic/use-chart-state";

export const ChartContainer = ({ children }: { children: ReactNode }) => {
  const { bounds } = useChartState();
  const { width, height } = bounds;
  return <div style={{ position: "relative", width, height }}>{children}</div>;
};
