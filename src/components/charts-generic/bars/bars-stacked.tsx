import { Fragment } from "react";

import { Bar } from "src/components/charts-generic/bars/bars-simple";
import {
  StackedBarsState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useInteraction } from "src/components/charts-generic/use-interaction";

import { BAR_HEIGHT_SMALL } from "../constants";
import { useChartTheme } from "../use-chart-theme";

export const BarsStacked = () => {
  const {
    bounds,
    xScale,
    yScale,
    colors,
    opacityScale,
    stackedData,
    categories,
    getOpacity,
    data,
    getSegment,
    getCategory,
  } = useChartState() as StackedBarsState;

  const { margins } = bounds;
  const [interaction] = useInteraction();
  const hovered = interaction.interaction?.d;

  return (
    <g transform={`translate(${margins.left}, ${margins.top})`}>
      {stackedData.map((series) => {
        const segment = series.key;

        return (
          <Fragment key={`series-${segment}`}>
            {series.map((stackItem, categoryIndex) => {
              const category = categories[categoryIndex];

              const x0 = stackItem[0];
              const x1 = stackItem[1];

              const x = xScale(x0);
              const width = xScale(x1) - xScale(x0);
              const y = yScale(category) || 0;

              if (width <= 0) {
                return null;
              }

              const observation = data.find((obs) => {
                return (
                  getCategory(obs) === category && getSegment(obs) === segment
                );
              });

              const isHovered = hovered === observation;
              const fillOpacity = observation
                ? opacityScale(getOpacity(observation))
                : 1;

              return (
                <Bar
                  key={`${segment}-${category}-${categoryIndex}`}
                  x={x}
                  y={y}
                  width={width}
                  height={BAR_HEIGHT_SMALL}
                  color={colors(segment)}
                  fillOpacity={isHovered ? 1 : fillOpacity}
                />
              );
            })}
          </Fragment>
        );
      })}
    </g>
  );
};

export const BarsStackedAxis = ({ debug = false }: { debug?: boolean }) => {
  const { bounds } = useChartState() as StackedBarsState;
  const { margins, chartWidth, chartHeight } = bounds;
  const { domainColor } = useChartTheme();

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
      </g>
    </>
  );
};
