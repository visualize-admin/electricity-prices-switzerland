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
    binMeta,
    bandScale,
  } = useChartState() as HistogramState;
  const { margins } = bounds;
  const { labelColor, domainColor, labelFontSize, fontFamily } =
    useChartTheme();
  const formatCurrency = useFormatCurrency();

  let medianX: number | undefined ;

  if (m !== undefined && groupedBy && binMeta && bandScale) {
    const bin = binMeta.find((b) => !b.isNoData && m >= b.x0 && m <= b.x1);
    if (bin) {
      const label = bin.label ?? "";
      medianX = (bandScale(label) ?? 0) + bandScale.bandwidth() / 2;
    }
  } else if (m !== undefined) {
    medianX = xScale(m);
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
              fontWeight: 700,

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
              fontWeight: 700,
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
