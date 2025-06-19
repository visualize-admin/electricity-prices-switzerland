import {
  HistogramState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import { useFormatCurrency } from "src/domain/helpers";
import { RP_PER_KWH } from "src/domain/metrics";

export const HistogramMedian = ({ label }: { label: string }) => {
  const {
    medianValue: m,
    bounds,
    xScale,
    yScale,
  } = useChartState() as HistogramState;
  const { margins } = bounds;
  const { labelColor, domainColor, labelFontSize, fontFamily } =
    useChartTheme();
  const formatCurrency = useFormatCurrency();

  return (
    <>
      {m && (
        <g transform={`translate(${margins.left} ${margins.top})`}>
          <line
            x1={xScale(m)}
            y1={bounds.chartHeight + margins.bottom * 0.5}
            x2={xScale(m)}
            y2={yScale(yScale.domain()[1])}
            stroke={domainColor}
            strokeDasharray="4px 2px"
          />
          <text
            x={xScale(m)}
            y={bounds.chartHeight + margins.bottom * 0.5}
            dy={labelFontSize}
            style={{
              fontFamily,
              fill: domainColor,
              fontSize: labelFontSize,
              textAnchor: "middle",
            }}
          >
            {formatCurrency(m)} {RP_PER_KWH}
          </text>
          <text
            x={xScale(m)}
            y={bounds.chartHeight + margins.bottom * 0.5}
            dy={labelFontSize * 2.4}
            style={{
              fontFamily,
              fill: labelColor,
              fontSize: labelFontSize,
              textAnchor: "middle",
            }}
          >
            {label}
          </text>
        </g>
      )}
    </>
  );
};
