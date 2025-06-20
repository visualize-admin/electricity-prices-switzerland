import { t } from "@lingui/macro";
import { max, min } from "d3";

import {
  HistogramState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import { useFormatCurrency } from "src/domain/helpers";

export const HistogramMinMaxValues = () => {
  const { data, bounds, getX, xScale, xAxisLabel } =
    useChartState() as HistogramState;
  const { margins } = bounds;
  const { labelColor, domainColor, labelFontSize, fontFamily } =
    useChartTheme();
  const formatCurrency = useFormatCurrency();

  const minValue = min(data, (d) => getX(d));
  const maxValue = max(data, (d) => getX(d));
  return (
    <>
      {minValue && (
        <g
          transform={`translate(${margins.left + xScale(minValue)} ${
            margins.top
          })`}
        >
          <text
            x={0}
            y={bounds.chartHeight + margins.bottom * 0.1}
            dy={labelFontSize}
            style={{
              fontFamily,
              fill: domainColor,
              fontSize: labelFontSize,
              textAnchor: "start",
            }}
          >
            {formatCurrency(minValue)} {xAxisLabel}
          </text>
          <text
            x={0}
            y={bounds.chartHeight + margins.bottom * 0.1}
            dy={labelFontSize * 2.4}
            style={{
              fontFamily,
              fill: labelColor,
              fontSize: labelFontSize,
              textAnchor: "start",
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
            y={bounds.chartHeight + margins.bottom * 0.1}
            dy={labelFontSize}
            style={{
              fontFamily,
              fill: domainColor,
              fontSize: labelFontSize,
              textAnchor: "end",
            }}
          >
            {formatCurrency(maxValue)} {xAxisLabel}
          </text>
          <text
            x={0}
            y={bounds.chartHeight + margins.bottom * 0.1}
            dy={labelFontSize * 2.4}
            style={{
              fontFamily,
              fill: labelColor,
              fontSize: labelFontSize,
              textAnchor: "end",
            }}
          >
            {t({ id: "histogram.max", message: "Max" })}
          </text>
        </g>
      )}
    </>
  );
};
