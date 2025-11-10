import { useTheme } from "@mui/material";

import {
  DotPlotState,
  StackedBarsState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { getTextWidth } from "src/domain/helpers";

import { useChartTheme } from "../use-chart-theme";

type AxisHeightCategoriesProps = {
  stretch?: boolean;
  hideXAxis?: boolean;
  highlightedCategory?: string;
};

export const AxisHeightCategories = ({
  stretch,
  hideXAxis = false,
  highlightedCategory,
}: AxisHeightCategoriesProps) => {
  const { yScale, bounds } = useChartState() as DotPlotState | StackedBarsState;
  const { labelFontSize } = useChartTheme();

  const theme = useTheme();
  // I do not know why we use 3 grays, ideally these would be in the palette
  const gray1 = "#e0e0e0";
  const gray2 = "#666";
  const gray3 = theme.palette.monochrome[200];

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
              x={stretch ? -(bounds.margins.left - textWidth) : -10}
              y={y + (stretch ? -10 : 0)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={labelFontSize}
              fill={gray2}
              fontWeight={highlightedCategory === category ? "bold" : "normal"}
            >
              {category}
            </text>
            {highlightedCategory === category && (
              <line
                x1={stretch ? -bounds.margins.left : -5}
                x2={stretch ? bounds.width - bounds.margins.left : 0}
                y1={y + labelFontSize / 2}
                y2={y + labelFontSize / 2}
                stroke={stretch ? gray3 : gray1}
                strokeWidth={1}
              />
            )}
            {!hideXAxis && (
              <line
                x1={stretch ? -bounds.margins.left : -5}
                x2={stretch ? bounds.width - bounds.margins.left : 0}
                y1={y}
                y2={y}
                stroke={stretch ? gray3 : gray1}
                strokeWidth={1}
              />
            )}
          </g>
        );
      })}
    </g>
  );
};
