import { Fragment } from "react";

import { Bar } from "src/components/charts-generic/bars/bars-simple";
import {
  GroupedBarsState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import { EXPANDED_TAG } from "src/components/detail-page/price-components-bars";
import {
  getContrastColor,
  getTextWidth,
  useFormatCurrency,
} from "src/domain/helpers";
import { getLocalizedLabel } from "src/domain/translation";

export const BarsGroupedAxis = ({
  title,
  debug = false,
}: {
  title: string;
  debug?: boolean;
}) => {
  const { bounds } = useChartState() as GroupedBarsState;
  const { margins, chartWidth, chartHeight } = bounds;
  const {
    domainColor,
    axisLabelFontSize,
    axisLabelFontWeight,
    axisLabelColor,
  } = useChartTheme();

  return (
    <>
      {debug && (
        <>
          <rect
            x={0}
            y={0}
            width={margins.left + chartWidth + margins.right}
            height={margins.top}
            fill={"hotpink"}
            fillOpacity={0.3}
            stroke={"hotpink"}
          />
          <rect
            x={0}
            y={margins.top}
            width={margins.left + chartWidth + margins.right}
            height={chartHeight}
            fill={"LightSeaGreen"}
            fillOpacity={0.3}
            stroke={"LightSeaGreen"}
          />
        </>
      )}
      <g transform={`translate(${margins.left}, 0)`}>
        <line
          x1={0}
          y1={margins.top}
          x2={0}
          y2={margins.top + chartHeight}
          stroke={domainColor}
          strokeWidth={2}
        />
        {/* Price Component Title: */}
        <text
          x={0}
          y={margins.top}
          dy={-axisLabelFontSize}
          fontSize={axisLabelFontSize}
          fontWeight={axisLabelFontWeight}
          fill={axisLabelColor}
        >
          {title}
        </text>
      </g>
    </>
  );
};
export const BarsGrouped = () => {
  const {
    sortedData,
    bounds,
    xScale,
    yScale,
    getX,
    getSegment,
    getColor,
    getOpacity,
    colors,
    opacityScale,
  } = useChartState() as GroupedBarsState;
  const { margins } = bounds;
  const { markBorderColor } = useChartTheme();

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {sortedData.map((d, i) => (
        <Bar
          key={i}
          y={yScale(getSegment(d)) as number}
          x={0}
          width={
            !getSegment(d).includes(EXPANDED_TAG)
              ? xScale(Math.max(0, getX(d)))
              : 0
          }
          height={yScale.bandwidth()}
          color={colors(getColor(d))}
          fillOpacity={opacityScale(getOpacity(d))}
          stroke={markBorderColor}
        />
      ))}
    </g>
  );
};

export const BarsGroupedLabels = ({ title }: { title: string }) => {
  const {
    sortedData,
    bounds,
    yScale,
    getX,
    getSegment,
    getLabel,
    colors,
    xScale,
    getColor,
  } = useChartState() as GroupedBarsState;

  const { margins, chartWidth } = bounds;
  const { labelFontSize } = useChartTheme();
  const formatCurrency = useFormatCurrency();

  const paddingX = 6;
  const safeTitle = title.replace(/[^a-zA-Z0-9]/g, "-");

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      <defs>
        {sortedData.map((d, i) => {
          const segment = getSegment(d);
          const y = yScale(segment) as number;
          const width = !segment.includes(EXPANDED_TAG)
            ? xScale(Math.max(0, getX(d)))
            : 0;
          const height = yScale.bandwidth();

          const value = formatCurrency(getX(d));
          const unit = getLocalizedLabel({ id: "unit" });
          const label = getLabel(d);
          const fullText = !segment.includes(EXPANDED_TAG)
            ? `${value} ${unit} ${label}`
            : label;

          const textWidth = getTextWidth(fullText, { fontSize: labelFontSize });

          if (textWidth + paddingX <= width) return null;

          return (
            <Fragment key={`clip-${i}-${safeTitle}`}>
              <clipPath id={`clip-inside-${i}-${safeTitle}`}>
                <rect x={0} y={y} width={width} height={height} />
              </clipPath>
              <clipPath id={`clip-outside-${i}-${safeTitle}`}>
                <rect
                  x={width}
                  y={y}
                  width={chartWidth - width}
                  height={height}
                />
              </clipPath>
            </Fragment>
          );
        })}
      </defs>

      {sortedData.map((d, i) => {
        const segment = getSegment(d);
        const y = yScale(segment) as number;
        const height = yScale.bandwidth();
        const width = !segment.includes(EXPANDED_TAG)
          ? xScale(Math.max(0, getX(d)))
          : 0;

        const barColor = colors(getColor(d));
        const value = formatCurrency(getX(d));
        const unit = getLocalizedLabel({ id: "unit" });
        const label = getLabel(d);
        const fullText = !segment.includes(EXPANDED_TAG)
          ? `${value} ${unit} ${label}`
          : label;

        const textWidth = getTextWidth(fullText, { fontSize: labelFontSize });

        if (textWidth + paddingX <= width) {
          return (
            <text
              key={`label-${i}`}
              x={paddingX}
              y={y + height / 2}
              dominantBaseline="middle"
              style={{
                fontFamily: "Inter, sans-serif", // or use from theme
                fontSize: labelFontSize,
                fill: getContrastColor(barColor),
              }}
            >
              {!segment.includes(EXPANDED_TAG) && (
                <tspan fontWeight={700}>
                  {value} {unit}
                </tspan>
              )}{" "}
              {label}
            </text>
          );
        }

        return (
          <g key={`label-${i}`}>
            <text
              x={paddingX}
              y={y + height / 2}
              dominantBaseline="middle"
              clipPath={`url(#clip-inside-${i}-${safeTitle})`}
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: labelFontSize,
                fill: getContrastColor(barColor),
              }}
            >
              {!segment.includes(EXPANDED_TAG) && (
                <tspan fontWeight={700}>
                  {value} {unit}
                </tspan>
              )}{" "}
              {label}
            </text>

            <text
              x={paddingX}
              y={y + height / 2}
              dominantBaseline="middle"
              clipPath={`url(#clip-outside-${i}-${safeTitle})`}
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: labelFontSize,
                fill: "black",
              }}
            >
              {!segment.includes(EXPANDED_TAG) && (
                <tspan fontWeight={700}>
                  {value} {unit}
                </tspan>
              )}{" "}
              {label}
            </text>
          </g>
        );
      })}
    </g>
  );
};
