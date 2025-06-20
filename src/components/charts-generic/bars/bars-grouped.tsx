import { Bar } from "src/components/charts-generic/bars/bars-simple";
import {
  GroupedBarsState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import { EXPANDED_TAG } from "src/components/detail-page/price-components-bars";
import { useFormatCurrency } from "src/domain/helpers";
import { useFlag } from "src/utils/flags";

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
  const { sortedData, bounds, yScale, getX, getSegment, getLabel, xAxisLabel } =
    useChartState() as GroupedBarsState;

  const { margins } = bounds;
  const { labelFontSize } = useChartTheme();
  const formatCurrency = useFormatCurrency();

  const dynamicTariffsFlag = useFlag("dynamicElectricityTariffs");

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {sortedData.map((d, i) => {
        const segment = getSegment(d);
        const y = yScale(segment) as number;

        const value = formatCurrency(getX(d));
        const label = getLabel(d);

        const isDynamic = dynamicTariffsFlag;
        const dynamicText = isDynamic
          ? `(${formatCurrency(d.min as number)} - ${formatCurrency(
              d.max as number
            )}, dynamic)`
          : "";

        return (
          <text
            key={`label-${i}`}
            x={0}
            y={y - LABEL_PADDING}
            fontFamily="Inter, sans-serif"
            fontSize={labelFontSize}
            fill="black"
          >
            {!segment.includes(EXPANDED_TAG) && (
              <tspan fontWeight={700}>
                {value} {xAxisLabel} {dynamicText}
              </tspan>
            )}{" "}
            {label}
          </text>
        );
      })}
    </g>
  );
};
