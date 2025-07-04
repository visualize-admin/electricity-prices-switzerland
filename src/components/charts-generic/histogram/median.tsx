import {
  HistogramState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import { useFormatCurrency } from "src/domain/helpers";

export const HistogramMedian = ({ label }: { label: string }) => {
  const {
    medianValue: m,
    bounds,
    xScale,
    yScale,
    xAxisLabel,
    groupedBy,
  } = useChartState() as HistogramState;
  const { margins } = bounds;
  const { labelColor, domainColor, labelFontSize, fontFamily } =
    useChartTheme();
  const formatCurrency = useFormatCurrency();

  let medianX: number | undefined = undefined;
  if (m !== undefined) {
    medianX = xScale(m);
    if (groupedBy) {
      const binStart = Math.floor(m / groupedBy) * groupedBy;
      const binEnd = binStart + groupedBy;
      const binCenter = (binStart + binEnd) / 2;
      medianX = xScale(binCenter);
    }
  }

  return (
    <>
      {m !== undefined && medianX !== undefined && (
        <g transform={`translate(${margins.left} ${margins.top})`}>
          <line
            x1={medianX}
            y1={bounds.chartHeight + margins.bottom * 0.5}
            x2={medianX}
            y2={yScale(yScale.domain()[1])}
            stroke={domainColor}
            strokeDasharray="4px 2px"
          />
          <text
            x={medianX}
            y={bounds.chartHeight + margins.bottom * 0.5}
            dy={labelFontSize}
            style={{
              fontFamily,
              fill: domainColor,
              fontSize: labelFontSize,
              textAnchor: "middle",
            }}
          >
            {formatCurrency(m)} {xAxisLabel}
          </text>
          <text
            x={medianX}
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
