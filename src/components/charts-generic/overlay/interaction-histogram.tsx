import * as React from "react";

import { GenericObservation } from "../../../domain/data";
import { HistogramState, useChartState } from "../use-chart-state";
import { useInteraction } from "../use-interaction";

export const InteractionHistogram = ({
  debug = false,
}: {
  debug?: boolean;
}) => {
  const [, dispatch] = useInteraction();

  const { bounds, xScale, bins } = useChartState() as HistogramState;
  const { margins, chartWidth, chartHeight } = bounds;

  const showTooltip = (bin: GenericObservation) => {
    dispatch({
      type: "INTERACTION_UPDATE",
      value: { interaction: { visible: true, d: bin } },
    });
  };
  const hideTooltip = () => {
    dispatch({
      type: "INTERACTION_HIDE",
    });
  };

  return (
    <>
      <g
        transform={`translate(0, ${(margins.annotations ?? 0) + margins.top})`}
      >
        {bins.map((b, i) =>
          b.x0 !== undefined && b.x1 !== undefined ? (
            <rect
              key={i}
              x={margins.left + xScale(b.x0)}
              y={0}
              width={xScale(b.x1) - xScale(b.x0)}
              height={chartHeight}
              fillOpacity={debug ? 0.2 : 0}
              fill="hotpink"
              stroke={debug ? "hotpink" : "none"}
              onMouseOut={hideTooltip}
              onMouseOver={() =>
                showTooltip(b as unknown as GenericObservation)
              }
            />
          ) : null
        )}
      </g>
      {debug && (
        <>
          <g transform={`translate(0, 0)`}>
            <rect
              x={0}
              y={0}
              width={margins.left + chartWidth + margins.right}
              height={margins.annotations}
              fillOpacity={0.2}
              fill="Orchid"
              stroke="Orchid"
            />
          </g>
          <g transform={`translate(0, ${margins.annotations})`}>
            <rect
              x={0}
              y={0}
              width={margins.left + chartWidth + margins.right}
              height={margins.top}
              fillOpacity={0.2}
              fill="LightSeaGreen"
              stroke="LightSeaGreen"
            />
          </g>
          <g
            transform={`translate(0, ${
              (margins.annotations ?? 0) + margins.top + chartHeight
            })`}
          >
            <rect
              x={0}
              y={0}
              width={margins.left + chartWidth + margins.right}
              height={margins.bottom}
              fillOpacity={0.2}
              fill="green"
              stroke="green"
            />
          </g>
        </>
      )}
    </>
  );
};
