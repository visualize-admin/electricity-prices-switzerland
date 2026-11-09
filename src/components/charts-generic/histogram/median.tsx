import {
  HistogramState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import { useFormatDisplayNumber } from "src/domain/helpers";

export const HistogramMedian = ({
  label,
  labelOffset = 0,
}: {
  label: string;
  labelOffset?: number;
}) => {
  const {
    medianValue: m,
    bounds,
    xScale,
    yScale,
    xAxisUnit,
    groupedBy,
    binMeta,
    bandScale,
  } = useChartState() as HistogramState;
  const { margins } = bounds;
  const { labelColor, domainColor, labelFontSize, fontFamily } =
    useChartTheme();
  const formatDisplay = useFormatDisplayNumber();
  const labelY = bounds.chartHeight + margins.bottom * 0.5 + labelOffset;

  let medianX: number | undefined;

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
            y1={labelY}
            x2={medianX}
            y2={yScale(yScale.domain()[1])}
            stroke={domainColor}
            strokeDasharray="4px 2px"
          />
          <text
            x={medianX}
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
              fontWeight: 700,

              textAnchor: "middle",
            }}
          >
            {formatDisplay(m)} {xAxisUnit}
          </text>
          <text
            x={medianX}
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
