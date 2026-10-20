import { t } from "@lingui/macro";
import { max, min } from "d3";

import {
  HistogramState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import { useFormatDisplayNumber } from "src/domain/helpers";

export const HistogramMinMaxValues = ({
  labelOffset = 0,
  centerLabels = false,
}: {
  labelOffset?: number;
  centerLabels?: boolean;
}) => {
  const { data, bounds, getX, xScale, xAxisUnit } =
    useChartState() as HistogramState;
  const { margins } = bounds;
  const { labelColor, domainColor, labelFontSize, fontFamily } =
    useChartTheme();
  const formatDisplay = useFormatDisplayNumber();
  const labelY = bounds.chartHeight + margins.bottom * 0.1 + labelOffset;

  const minValue = min(data, (d) => getX(d));
  const maxValue = max(data, (d) => getX(d));
  return (
    <>
      {minValue !== undefined && (
        <g
          transform={`translate(${margins.left + xScale(minValue)} ${
            margins.top
          })`}
        >
          <text
            x={0}
            y={labelY}
            dy={labelFontSize}
            stroke="white"
            strokeWidth={3}
            strokeLinejoin="round"
            paintOrder="stroke"
            style={{
              fontFamily,
              fill: domainColor,
              fontSize: labelFontSize,
              textAnchor: centerLabels ? "middle" : "start",
            }}
          >
            {formatDisplay(minValue)} {xAxisUnit}
          </text>
          <text
            x={0}
            y={labelY}
            dy={labelFontSize * 2.4}
            stroke="white"
            strokeWidth={3}
            strokeLinejoin="round"
            paintOrder="stroke"
            style={{
              fontFamily,
              fill: labelColor,
              fontSize: labelFontSize,
              textAnchor: centerLabels ? "middle" : "start",
            }}
          >
            {t({ id: "histogram.min", message: "Min" })}
          </text>
        </g>
      )}
      {maxValue && (
        <g
          transform={`translate(${margins.left + xScale(maxValue)} ${
            margins.top
          })`}
        >
          <text
            x={0}
            y={labelY}
            dy={labelFontSize}
            stroke="white"
            strokeWidth={3}
            strokeLinejoin="round"
            paintOrder="stroke"
            style={{
              fontFamily,
              fill: domainColor,
              fontSize: labelFontSize,
              textAnchor: centerLabels ? "middle" : "end",
            }}
          >
            {formatDisplay(maxValue)} {xAxisUnit}
          </text>
          <text
            x={0}
            y={labelY}
            dy={labelFontSize * 2.4}
            stroke="white"
            strokeWidth={3}
            strokeLinejoin="round"
            paintOrder="stroke"
            style={{
              fontFamily,
              fill: labelColor,
              fontSize: labelFontSize,
              textAnchor: centerLabels ? "middle" : "end",
            }}
          >
            {t({ id: "histogram.max", message: "Max" })}
          </text>
        </g>
      )}
    </>
  );
};
