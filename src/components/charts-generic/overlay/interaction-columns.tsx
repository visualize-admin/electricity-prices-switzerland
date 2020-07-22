import * as React from "react";
import { GenericObservation } from "../../../domain/data";
import { useChartState } from "../use-chart-state";
import { useInteraction } from "../use-interaction";
import { ColumnsState } from "../columns/columns-state";

export const InteractionColumns = () => {
  const [, dispatch] = useInteraction();

  const {
    sortedData,
    bounds,
    getX,
    xScaleInteraction,
  } = useChartState() as ColumnsState;
  const { margins, chartHeight } = bounds;

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
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {sortedData.map((d, i) => (
        <rect
          key={i}
          x={xScaleInteraction(getX(d)) as number}
          y={0}
          width={xScaleInteraction.bandwidth()}
          height={chartHeight}
          fill="hotpink"
          fillOpacity={0}
          stroke="none"
          onMouseOut={hideTooltip}
          onMouseOver={() => showTooltip(d)}
        />
      ))}
    </g>
  );
};
