import * as React from "react";
import { useFormatCurrency } from "../../../domain/helpers";
import { getLocalizedLabel } from "../../../domain/translation";
import { EXPANDED_TAG } from "../../detail-page/price-components-bars";
import { useI18n } from "../../i18n-context";
import { BAR_AXIS_OFFSET, BAR_SPACE_ON_TOP } from "../constants";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";
import { GroupedBarsState } from "./bars-grouped-state";
import { Bar } from "./bars-simple";

export const BarsGrouped = () => {
  const {
    bounds,
    xScale,
    yScaleCollapsed,
    getX,
    getY,
    // yScale,
    getSegment,
    getColor,
    getOpacity,
    colors,
    opacityScale,
    grouped,
  } = useChartState() as GroupedBarsState;
  const { margins } = bounds;
  const {
    domainColor,
    markBorderColor,
    axisLabelFontSize,
    axisLabelFontWeight,
    axisLabelColor,
  } = useChartTheme();

  const i18n = useI18n();

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {grouped.map((segment, i) => {
        return (
          <g key={`${segment[0]}-${i}`}>
            <g
              transform={`translate(0, ${BAR_SPACE_ON_TOP - BAR_AXIS_OFFSET})`}
            >
              {segment[1].map((d, i) => {
                return (
                  <>
                    <Bar
                      key={i}
                      y={yScaleCollapsed(getSegment(d)) as number}
                      x={0}
                      width={
                        !getSegment(d).includes(EXPANDED_TAG)
                          ? xScale(Math.max(0, getX(d)))
                          : 0
                      }
                      height={yScaleCollapsed.bandwidth()}
                      color={colors(getColor(d))}
                      fillOpacity={opacityScale(getOpacity(d))}
                      stroke={markBorderColor}
                    />
                  </>
                );
              })}
            </g>
            <line
              x1={0}
              y1={BAR_SPACE_ON_TOP - BAR_AXIS_OFFSET * 2}
              x2={0}
              y2={0}
              stroke={domainColor}
            />
            <text
              x={0}
              y={BAR_SPACE_ON_TOP * (1 / 2)}
              fontSize={axisLabelFontSize}
              fontWeight={axisLabelFontWeight}
              fill={axisLabelColor}
            >
              {/* FIXME: the label shouldn't be localized here */}
              {getLocalizedLabel({ i18n, id: segment[0] })}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export const BarsGroupedLabels = () => {
  const {
    bounds,
    yScaleCollapsed,
    getX,
    getSegment,
    getLabel,
    grouped,
  } = useChartState() as GroupedBarsState;
  const { margins } = bounds;
  const { axisLabelColor, labelFontSize, fontFamily } = useChartTheme();
  const formatCurrency = useFormatCurrency();
  const i18n = useI18n();

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {grouped.map((segment, i) => {
        return (
          <g
            key={`${segment[0]}-${i}`}
            transform={`translate(0, ${BAR_SPACE_ON_TOP - BAR_AXIS_OFFSET})`}
          >
            {segment[1].map((d, i) => {
              return (
                <text
                  key={i}
                  style={{
                    fontFamily,
                    fill: axisLabelColor,
                    fontSize: labelFontSize,
                  }}
                  x={0}
                  y={yScaleCollapsed(getSegment(d)) as number}
                  dx={6}
                  dy={labelFontSize * 1.5}
                >
                  {!getSegment(d).includes(EXPANDED_TAG) && (
                    <>
                      <tspan fontWeight="bold">
                        {formatCurrency(getX(d))}{" "}
                        {getLocalizedLabel({ i18n, id: "unit" })}
                      </tspan>{" "}
                    </>
                  )}
                  {getLabel(d)}
                </text>
              );
            })}
          </g>
        );
      })}
    </g>
  );
};
