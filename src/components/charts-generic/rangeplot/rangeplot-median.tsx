import { median } from "d3-array";
import * as React from "react";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";
import { useFormatCurrency } from "../../../domain/helpers";
import { useI18n } from "../../i18n-context";
import { getLocalizedLabel } from "../../../domain/translation";
import { RangePlotState } from "./rangeplot-state";

export const RangeplotMedian = ({ label }: { label: string }) => {
  const {
    data,
    bounds,
    getX,
    xScale,
    yScale,
  } = useChartState() as RangePlotState;
  const { margins } = bounds;
  const {
    labelColor,
    domainColor,
    labelFontSize,
    fontFamily,
  } = useChartTheme();
  const formatCurrency = useFormatCurrency();
  const i18n = useI18n();

  const m = median(data, (d) => getX(d));

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
            {formatCurrency(m)} {getLocalizedLabel({ i18n, id: "unit" })}
          </text>
          <text
            x={xScale(m)}
            y={bounds.chartHeight + margins.bottom * 0.2}
            dy={labelFontSize * 2}
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
