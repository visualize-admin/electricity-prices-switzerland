import { Bar } from "src/components/charts-generic/bars/bars-simple";
import {
  GroupedBarsState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import { EXPANDED_TAG } from "src/components/detail-page/price-components-bars-utils";

import { BAR_HEIGHT, LABEL_PADDING } from "../constants";

export const BarsGroupedAxis = ({
  title,
  debug = false,
}: {
  title: string;
  debug?: boolean;
}) => {
  const { bounds } = useChartState() as GroupedBarsState;
  const { margins, chartWidth, chartHeight } = bounds;
  const { axisLabelFontSize, axisLabelFontWeight, axisLabelColor } =
    useChartTheme();

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
        {/* Price Component Title: */}
        <text
          x={0}
          y={margins.top - LABEL_PADDING}
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
          height={BAR_HEIGHT}
          color={colors(getColor(d))}
          fillOpacity={opacityScale(getOpacity(d))}
          stroke={markBorderColor}
        />
      ))}
    </g>
  );
};

export const BarsGroupedLabels = () => {
  const { sortedData, bounds, yScale, getSegment, labelsBySegment } =
    useChartState() as GroupedBarsState;

  const { margins } = bounds;
  const { labelFontSize } = useChartTheme();
  const labelLineHeight = labelFontSize + 2;

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {sortedData.map((d, i) => {
        const segment = getSegment(d);
        const y = yScale(segment) as number;
        const { prefix, lines } = labelsBySegment[segment] ?? {
          prefix: "",
          lines: [""],
        };
        const extra = (lines.length - 1) * labelLineHeight;

        return (
          <text
            key={`label-${i}`}
            x={0}
            y={y - LABEL_PADDING + labelFontSize / 2 - extra}
            fontFamily="Inter, sans-serif"
            fontSize={labelFontSize}
            fill="black"
          >
            {lines.map((line, lineIndex) => {
              const rest =
                lineIndex === 0 && prefix && line.startsWith(prefix)
                  ? line.slice(prefix.length)
                  : null;
              return (
                <tspan
                  key={lineIndex}
                  x={0}
                  dy={lineIndex === 0 ? 0 : labelLineHeight}
                >
                  {rest !== null ? (
                    <>
                      <tspan fontWeight={700}>{prefix}</tspan>
                      {rest}
                    </>
                  ) : (
                    line
                  )}
                </tspan>
              );
            })}
          </text>
        );
      })}
    </g>
  );
};
