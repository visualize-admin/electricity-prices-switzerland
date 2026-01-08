import { ReactNode } from "react";

import { PlotBounds } from "src/components/charts-generic/plot-bounds";
import { useChartState } from "src/components/charts-generic/use-chart-state";

export const ChartSvg = ({
  children,
  width: widthProp,
  height: heightProp,
  style,
  debug = false,
}: {
  children: ReactNode;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  debug?: boolean;
}) => {
  const { bounds } = useChartState();
  const { width, height } = bounds;
  return (
    <svg
      width={widthProp ?? width}
      height={heightProp ?? height}
      style={{ position: "absolute", left: 0, top: 0, ...style }}
    >
      {debug ? <PlotBounds /> : null}
      {children}
    </svg>
  );
};
