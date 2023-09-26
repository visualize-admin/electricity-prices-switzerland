import * as React from "react";

import { useFormatCurrency } from "../../../domain/helpers";
import { getLocalizedLabel } from "../../../domain/translation";
import { RangePlotState, useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";

export const RangeplotMedian = ({ label }: { label: string }) => {
  const { data, medianValue, bounds, getX, xScale, yScale } =
    useChartState() as RangePlotState;
  const { margins } = bounds;
  const { labelColor, domainColor, labelFontSize, fontFamily } =
    useChartTheme();
  const formatCurrency = useFormatCurrency();

  const m = medianValue;

  return (
    <>
      {m && (
        <g
          transform={`translate(${margins.left}, ${
            margins.top + (margins.annotations ?? 0)
          })`}
        >
          <line
            x1={xScale(m)}
            y1={yScale(yScale.domain()[0])}
            x2={xScale(m)}
            y2={bounds.chartHeight + margins.bottom * 0.2}
            stroke={domainColor}
            strokeDasharray="4px 2px"
          />
          <text
            x={xScale(m)}
            y={bounds.chartHeight + margins.bottom * 0.2}
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
            y={bounds.chartHeight + margins.bottom * 0.2}
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
