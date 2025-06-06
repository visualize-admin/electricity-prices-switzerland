import { useChartState } from "src/components/charts-generic/use-chart-state";
import { getTextWidth } from "src/domain/helpers";

import { ScatterPlotState } from "../scatter-plot/scatter-plot-state";
import { useChartTheme } from "../use-chart-theme";

export const AxisHeightCategories = ({ stretch }: { stretch?: boolean }) => {
  const { yScale, bounds } = useChartState() as ScatterPlotState;
  const { labelFontSize } = useChartTheme();

  return (
    <g transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}>
      {yScale.domain().map((category) => {
        const y = (yScale(category) || 0) + yScale.bandwidth() / 2;
        const textWidth = getTextWidth(category, { fontSize: labelFontSize });
        return (
          <g key={category}>
            <text
              x={stretch ? -(bounds.margins.left - textWidth) : -10}
              y={y + (stretch ? -10 : 0)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={labelFontSize}
              fill="#666"
            >
              {category}
            </text>
            <line
              x1={stretch ? -bounds.margins.left : -5}
              x2={stretch ? bounds.width - bounds.margins.left : 0}
              y1={y}
              y2={y}
              stroke={stretch ? "#e5e7eb" : "#e0e0e0"}
              strokeWidth={1}
            />
          </g>
        );
      })}
    </g>
  );
};
