import { ReactNode } from "react";

import { useChartState } from "src/components/charts-generic/use-chart-state";

export const ChartSvg = ({
  children,
  width: widthProp,
  height: heightProp,
  style,
}: {
  children: ReactNode;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}) => {
  const { bounds } = useChartState();
  const { width, height } = bounds;
  return (
    <svg
      width={widthProp ?? width}
      height={heightProp ?? height}
      style={{ position: "absolute", left: 0, top: 0, ...style }}
    >
      {children}
    </svg>
  );
};
