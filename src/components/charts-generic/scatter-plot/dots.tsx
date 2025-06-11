import { memo, useMemo } from "react";

import { useChartState } from "src/components/charts-generic/use-chart-state";
import { chartPalette, palette } from "src/themes/palette";

import { useInteraction } from "../use-interaction";

import { ScatterPlotState } from "./scatter-plot-state";

export const Dots = () => {
  const { data, getX, getY, xScale, yScale, bounds, getHighlightEntity } =
    useChartState() as ScatterPlotState;

  const [interaction] = useInteraction();
  const hovered = interaction.interaction?.d;

  const dotProps = useMemo(() => {
    return data.map((d) => ({
      d,
      cx: xScale(getX(d)),
      cy: (yScale(getY(d)) || 0) + yScale.bandwidth() / 2,
    }));
  }, [data, getX, getY, xScale, yScale]);

  const highlightedValue = useMemo(() => {
    return data.length > 0 ? getHighlightEntity(data[0]) : null;
  }, [data, getHighlightEntity]);

  const regularDots = dotProps.filter(
    ({ d }) =>
      d !== hovered &&
      (!highlightedValue ||
        getHighlightEntity(d)?.toString() !== highlightedValue.toString())
  );

  const selectedDots = dotProps.filter(
    ({ d }) =>
      highlightedValue &&
      getHighlightEntity(d)?.toString() === highlightedValue.toString()
  );

  const hoveredDot = dotProps.find(({ d }) => d === hovered);

  return (
    <g transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}>
      {/* Regular dots */}
      {regularDots.map(({ cx, cy }, i) => (
        <Dot
          key={`regular-${i}`}
          cx={cx}
          cy={cy}
          color={palette.monochrome[200]}
          opacity={0.75}
        />
      ))}

      {/* Connector lines under selected/hovered */}
      {hovered &&
        selectedDots.map(({ d, cx }, i) => (
          <line
            key={`connector-${i}`}
            x1={xScale(getX(hovered))}
            x2={cx}
            y1={(yScale(getY(d)) || 0) + yScale.bandwidth() / 2}
            y2={(yScale(getY(d)) || 0) + yScale.bandwidth() / 2}
            stroke={palette.monochrome[800]}
            strokeWidth={1}
            fill="none"
          />
        ))}

      {/* Selected dots */}
      {selectedDots.map(({ cx, cy }, i) => (
        <Dot
          key={`selected-${i}`}
          cx={cx}
          cy={cy}
          color={chartPalette.categorical[0]}
          opacity={1}
        />
      ))}

      {/* Hovered dot */}
      {hoveredDot && (
        <Dot
          key="hovered"
          cx={hoveredDot.cx}
          cy={hoveredDot.cy}
          color={chartPalette.categorical[2]}
          opacity={1}
        />
      )}
    </g>
  );
};

const Dot = memo(
  ({
    cx,
    cy,
    color,
    opacity,
  }: {
    cx: number;
    cy: number;
    color: string;
    opacity: number;
  }) => <circle cx={cx} cy={cy} r={8} fill={color} opacity={opacity} />,
  (prev, next) =>
    prev.cx === next.cx &&
    prev.cy === next.cy &&
    prev.color === next.color &&
    prev.opacity === next.opacity
);
