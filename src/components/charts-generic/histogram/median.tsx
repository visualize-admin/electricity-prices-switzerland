import * as React from "react";

import { useFormatCurrency } from "../../../domain/helpers";
import { getLocalizedLabel } from "../../../domain/translation";
import { HistogramState, useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";


export const HistogramMedian = ({ label }: { label: string }) => {
  const { data, medianValue, bounds, getX, xScale, yScale } =
    useChartState() as HistogramState;
  const { margins } = bounds;
  const { labelColor, domainColor, labelFontSize, fontFamily } =
    useChartTheme();
  const formatCurrency = useFormatCurrency();

  const m = medianValue;

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
            {formatCurrency(m)} {getLocalizedLabel({ id: "unit" })}
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
