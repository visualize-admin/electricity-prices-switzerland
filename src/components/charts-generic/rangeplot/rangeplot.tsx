import { max, median, min } from "d3-array";
import * as React from "react";
import { normalize } from "../../../lib/array";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";
import { DOT_RADIUS, RangePlotState } from "./rangeplot-state";
import { mkNumber, isNumber } from "../../../domain/helpers";
import { useInteraction } from "../use-interaction";
import { useTheme } from "../../../themes";

export const Range = ({ id }: { id: string }) => {
  const {
    bounds,
    xScale,
    getX,
    yScale,
    colors,
    rangeGroups,
  } = useChartState() as RangePlotState;

  const { margins, chartWidth } = bounds;

  return (
    <>
      <g
        transform={`translate(${margins.left}, ${
          margins.top + (margins.annotations ?? 0)
        })`}
      >
        {rangeGroups.map((row) => {
          const xMin = min(row[1], (d) => getX(d)) ?? 0;
          const xMax = max(row[1], (d) => getX(d));

          const clipPathId = `cut-off-range-${id}-${row[0]}`.replace(
            /\W+/g,
            "-"
          );

          return (
            <React.Fragment key={row[0]}>
              {xMin !== undefined &&
                xMax !== undefined &&
                isNumber(yScale(row[0])) && (
                  <>
                    <clipPath id={clipPathId}>
                      <rect
                        x={xScale(xMin)}
                        width={xScale(xMax) - xScale(xMin)}
                        height={DOT_RADIUS * 2}
                        fillOpacity={0.2}
                      />
                    </clipPath>
                    <g
                      key={row[0]}
                      transform={`translate(0, ${yScale(row[0]) as number})`}
                    >
                      <rect
                        x={0}
                        y={0}
                        width={chartWidth}
                        height={DOT_RADIUS * 2}
                        fill="url(#priceRange)"
                        fillOpacity={0.3}
                        clipPath={`url(#${clipPathId})`}
                      />
                    </g>
                  </>
                )}
            </React.Fragment>
          );
        })}
      </g>
      <defs>
        <linearGradient id="priceRange" x1="0%" y1="0%" x2="100%" y2="0%">
          {colors.range().map((color, i) => {
            const normalized = normalize(
              colors.domain()[i],
              colors.domain()[colors.domain().length - 1],
              colors.domain()[0]
            );
            return <stop key={color} offset={normalized} stopColor={color} />;
          })}
        </linearGradient>
      </defs>
    </>
  );
};

export const RangePoints = () => {
  const theme = useTheme();
  const {
    bounds,
    xScale,
    getX,
    getY,
    yScale,
    colors,
    rangeGroups,
  } = useChartState() as RangePlotState;
  const [interactionState, dispatch] = useInteraction();
  const { margins, chartWidth } = bounds;
  const {
    labelColor,
    labelFontSize,
    fontFamily,
    domainColor,
  } = useChartTheme();

  const cantonName =
    interactionState.interaction.d && getY(interactionState.interaction.d);

  return (
    <>
      <g
        transform={`translate(${margins.left}, ${
          margins.top + (margins.annotations ?? 0)
        })`}
      >
        {rangeGroups.map((row) => {
          const xMin = min(row[1], (d) => getX(d));
          const m = median(row[1], (d) => getX(d));
          const xMax = max(row[1], (d) => getX(d));

          return (
            <React.Fragment key={row[0]}>
              {cantonName === row[0] && (
                <g
                  transform={`translate(${-margins.left}, ${
                    yScale(row[0]) as number
                  })`}
                >
                  <rect
                    x={0}
                    y={0}
                    width={margins.left + chartWidth + margins.right}
                    height={DOT_RADIUS * 2}
                    fillOpacity={0.3}
                    fill={theme.colors.primaryLight}
                  />
                </g>
              )}
              {xMin !== undefined &&
                m !== undefined &&
                xMax !== undefined &&
                isNumber(yScale(row[0])) && (
                  <g
                    key={row[0]}
                    transform={`translate(0, ${yScale(row[0]) as number})`}
                  >
                    <circle
                      cx={xScale(xMin)}
                      cy={DOT_RADIUS}
                      r={DOT_RADIUS}
                      fill={colors(xMin)}
                    />
                    <circle
                      cx={xScale(xMax)}
                      cy={DOT_RADIUS}
                      r={DOT_RADIUS}
                      fill={colors(xMax)}
                    />
                    <line
                      x1={xScale(m)}
                      y1={0}
                      x2={xScale(m)}
                      y2={DOT_RADIUS * 2}
                      strokeWidth={1}
                      stroke={domainColor}
                      strokeDasharray="4 2"
                    />
                    <text
                      x={-15}
                      y={DOT_RADIUS}
                      style={{
                        fontFamily,
                        fill: cantonName === row[0] ? "#000" : labelColor,
                        fontSize: labelFontSize,
                        textAnchor: "end",
                        dominantBaseline: "central",
                      }}
                    >
                      {row[0]}
                    </text>
                  </g>
                )}
            </React.Fragment>
          );
        })}
      </g>
    </>
  );
};
