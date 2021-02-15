import { min, max } from "d3-array";
import * as React from "react";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";
import { HistogramState } from "./histogram-state";
import { useFormatCurrency } from "../../../domain/helpers";
import { t } from "@lingui/macro";
import { getLocalizedLabel } from "../../../domain/translation";
import { useI18n } from "../../i18n-context";

export const HistogramMinMaxValues = () => {
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
            {formatCurrency(minValue)} {getLocalizedLabel({ i18n, id: "unit" })}
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
            {i18n._(t("histogram.min")`Min`)}
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
            {formatCurrency(maxValue)} {getLocalizedLabel({ i18n, id: "unit" })}
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
            {i18n._(t("histogram.max")`Max`)}
          </text>
        </g>
      )}
    </>
  );
};
