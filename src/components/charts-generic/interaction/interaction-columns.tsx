import * as React from "react";
import { Observation } from "../../../domain/data";
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

  const showTooltip = (d: Observation) => {
    dispatch({
      type: "ANNOTATION_UPDATE",
      value: { annotation: { visible: true, d } },
    });
  };
  const hideTooltip = () => {
    dispatch({
      type: "ANNOTATION_HIDE",
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