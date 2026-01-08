import { memo } from "react";

import {
  RangePlotState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useInteraction } from "src/components/charts-generic/use-interaction";
import { GenericObservation } from "src/domain/data";

export const InteractionDotted = memo(
  ({
    debug = false,
    data: dataProp,
    id,
  }: {
    debug?: boolean;
    data?: GenericObservation[];
    id?: string;
  }) => {
    const [, dispatch] = useInteraction();

    const { data: dataContext, bounds, xScale, yScale, getX, getY } =
      useChartState() as RangePlotState;

    const data = dataProp ?? dataContext;
    const { margins, chartWidth } = bounds;

    const showTooltip = (d: GenericObservation, event: React.MouseEvent) => {
      const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      dispatch({
        type: "INTERACTION_UPDATE",
        value: {
          interaction: {
            visible: true,
            d,
            id,
            mouse: { x, y },
          },
        },
      });
    };

    const hideTooltip = () => {
      dispatch({
        type: "INTERACTION_HIDE",
      });
    };

    const dotRadius = 8;

    return (
      <>
        <g>
          {data.map((d, i) => (
            <circle
              key={i}
              cx={xScale(getX(d))}
              cy={(yScale(getY(d)) || 0) + yScale.bandwidth() / 2}
              r={dotRadius}
              fillOpacity={debug ? 0.3 : 0}
              fill={debug ? "hotpink" : "transparent"}
              stroke={debug ? "hotpink" : "none"}
              strokeWidth={debug ? 1 : 0}
              style={{ cursor: "pointer" }}
              onMouseOut={hideTooltip}
              onMouseOver={(event) => showTooltip(d, event)}
              onMouseMove={(event) => showTooltip(d, event)}
            />
          ))}
        </g>

        {debug && (
          <>
            <g>
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
            <g>
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
            <g>
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
  }
);
