import { Bar } from "src/components/charts-generic/bars/bars-simple";
import {
  GroupedBarsState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import { EXPANDED_TAG } from "src/components/detail-page/price-components-bars";
import { useFormatCurrency } from "src/domain/helpers";
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

export const BarsGroupedLabels = () => {
  const { sortedData, bounds, yScale, getX, getSegment, getLabel } =
    useChartState() as GroupedBarsState;
  const { margins } = bounds;
  const { axisLabelColor, labelFontSize, fontFamily } = useChartTheme();
  const formatCurrency = useFormatCurrency();

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {sortedData.map((d, i) => {
        return (
          <text
            key={i}
            style={{
              fontFamily,
              fill: axisLabelColor,
              fontSize: labelFontSize,
            }}
            x={0}
            y={yScale(getSegment(d)) as number}
            dx={6}
            dy={labelFontSize * 1.3}
          >
            {!getSegment(d).includes(EXPANDED_TAG) && (
              <>
                <tspan fontWeight={700}>
                  {formatCurrency(getX(d))} {getLocalizedLabel({ id: "unit" })}
                </tspan>{" "}
              </>
            )}
            {getLabel(d)}
          </text>
        );
      })}
    </g>
  );
};
