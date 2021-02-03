import * as React from "react";
import { GenericObservation } from "../../../domain/data";
import { useChartState } from "../use-chart-state";
import { useInteraction } from "../use-interaction";
import { DOT_RADIUS, RangePlotState } from "../rangeplot/rangeplot-state";
import { isNumber } from "../../../domain/helpers";

export const InteractionRows = () => {
  const [, dispatch] = useInteraction();

  const {
    rangeGroups,
    bounds,
    getX,
    yScale,
  } = useChartState() as RangePlotState;
  const { margins, chartWidth } = bounds;

  const showTooltip = (d: GenericObservation) => {
    dispatch({
      type: "INTERACTION_UPDATE",
      value: { interaction: { visible: true, d } },
    });
  };
  const hideTooltip = () => {
    dispatch({
      type: "INTERACTION_HIDE",
    });
  };
  return (
    <>
      <g transform={`translate(${margins.left}, ${margins.top})`}>
        {rangeGroups.map((row, i) => (
          <rect
            key={row[0]}
            x={0}
            y={
              (yScale(row[0]) || yScale.bandwidth() * i + margins.top) -
              yScale.bandwidth() / 2
            }
            width={chartWidth}
            height={yScale.bandwidth()}
            fillOpacity={0}
            onMouseOut={hideTooltip}
            onMouseOver={() => showTooltip(row[1][0])}
          />
        ))}
      </g>
    </>
  );
};
