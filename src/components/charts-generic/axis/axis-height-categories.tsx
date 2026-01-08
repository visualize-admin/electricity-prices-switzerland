import { useTheme } from "@mui/material";

import {
  DotPlotState,
  StackedBarsState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { getTextWidth } from "src/domain/helpers";

import { useChartTheme } from "../use-chart-theme";

type AxisHeightCategoriesProps = {
  hideXAxis?: boolean;
  highlightedCategory?: string;
};

export const AxisHeightCategories = ({
  hideXAxis = false,
  highlightedCategory,
}: AxisHeightCategoriesProps) => {
  const { yScale, bounds } = useChartState() as DotPlotState | StackedBarsState;
  const { labelFontSize } = useChartTheme();

  const theme = useTheme();

  const textFill = theme.palette.monochrome[500];
  const lineAndTicksFill = theme.palette.monochrome[200];

  return (
    <g transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}>
      {yScale.domain().map((category) => {
        const y = (yScale(category) || 0) + yScale.bandwidth() / 2;
        const textWidth = getTextWidth(category, {
          fontSize: labelFontSize,
          fontWeight: highlightedCategory === category ? "bold" : "normal",
        });
        return (
          <g key={category}>
            <text
              x={-(bounds.margins.left - textWidth)}
              y={y - 10}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={labelFontSize}
              fill={textFill}
              fontWeight={highlightedCategory === category ? "bold" : "normal"}
            >
              {category}
            </text>
            {highlightedCategory === category && (
              <line
                x1={-bounds.margins.left}
                x2={bounds.width - bounds.margins.left}
                y1={y + labelFontSize / 2}
                y2={y + labelFontSize / 2}
                stroke={lineAndTicksFill}
                strokeWidth={1}
              />
            )}
            {!hideXAxis && (
              <line
                x1={-bounds.margins.left}
                x2={bounds.width - bounds.margins.left}
                y1={y}
                y2={y}
                stroke={lineAndTicksFill}
                strokeWidth={1}
              />
            )}
          </g>
        );
      })}
    </g>
  );
};
