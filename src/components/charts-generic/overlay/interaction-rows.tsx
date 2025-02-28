import {
  RangePlotState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useInteraction } from "src/components/charts-generic/use-interaction";
import { GenericObservation } from "src/domain/data";

export const InteractionRows = ({ debug = false }: { debug?: boolean }) => {
  const [, dispatch] = useInteraction();

  const { rangeGroups, bounds, yScale } = useChartState() as RangePlotState;
  const { margins, chartWidth, chartHeight } = bounds;

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
      <g
        transform={`translate(0, ${(margins.annotations ?? 0) + margins.top})`}
      >
        {rangeGroups.map((row) => (
          <rect
            key={row[0]}
            x={0}
            y={yScale(row[0])}
            width={margins.left + chartWidth + margins.right}
            height={yScale.bandwidth()}
            fillOpacity={debug ? 0.2 : 0}
            fill="hotpink"
            stroke={debug ? "hotpink" : "none"}
            onMouseOut={hideTooltip}
            onMouseOver={() => showTooltip(row[1][0])}
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
