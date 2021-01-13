import { median } from "d3-array";
import * as React from "react";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";
import { HistogramState } from "./histogram-state";
import { useFormatCurrency } from "../../../domain/helpers";
import { useI18n } from "../../i18n-context";
import { getLocalizedLabel } from "../../../domain/translation";

export const HistogramMedian = ({ label }: { label: string }) => {
  const {
    data,
    bounds,
    getX,
    xScale,
    yScale,
  } = useChartState() as HistogramState;
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
        <g transform={`translate(${margins.left} ${margins.top})`}>
          <line
            x1={xScale(m)}
            y1={bounds.chartHeight + 38}
            x2={xScale(m)}
            y2={yScale(yScale.domain()[1])}
            stroke={domainColor}
            strokeDasharray="4px 2px"
          />
          <text
            x={xScale(m)}
            y={bounds.chartHeight + 54}
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
            y={bounds.chartHeight + 70}
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
