import { memo, useMemo } from "react";

import {
  DotPlotState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { chartPalette, palette } from "src/themes/palette";

import { MEDIAN_DIAMOND_SIZE } from "../constants";
import { useInteraction } from "../use-interaction";

type DotProps = {
  compareWith?: string[];
};

export const Dots = (props: DotProps) => {
  const {
    data,
    getX,
    getY,
    xScale,
    yScale,
    bounds,
    getHighlightEntity,
    highlightedValue,
    colors,
    getColor,
    medianValue,
  } = useChartState() as DotPlotState;

  const { compareWith } = props;

  const [interaction] = useInteraction();
  const hovered = interaction.interaction?.d;

  const dotProps = useMemo(() => {
    return data.map((d) => ({
      d,
      cx: xScale(getX(d)),
      cy: (yScale(getY(d)) || 0) + yScale.bandwidth() / 2,
    }));
  }, [data, getX, getY, xScale, yScale]);

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

  const medianX = medianValue ? xScale(medianValue) : null;

  return (
    <g transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}>
      {/* Regular dots */}
      {regularDots.map(({ cx, cy, d }, i) => (
        <Dot
          key={`regular-${i}`}
          cx={cx}
          cy={cy}
          color={
            !compareWith?.includes("sunshine.select-all")
              ? colors(getColor(d))
              : palette.monochrome[200]
          }
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
      {selectedDots.map((dot, i) => (
        <Dot
          key={`selected-${i}`}
          cx={dot.cx}
          cy={dot.cy}
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
          color={
            selectedDots.find((dot) => dot.d === hoveredDot.d)
              ? chartPalette.categorical[0]
              : colors(getColor(hoveredDot.d))
          }
          opacity={1}
        />
      )}

      {/* Median diamonds */}
      {medianX &&
        yScale.domain().map((yValue) => {
          const y = (yScale(yValue) || 0) + yScale.bandwidth() / 2;
          return (
            <rect
              key={`median-${yValue}`}
              x={medianX - MEDIAN_DIAMOND_SIZE / 2}
              y={y - MEDIAN_DIAMOND_SIZE / 2}
              width={MEDIAN_DIAMOND_SIZE}
              height={MEDIAN_DIAMOND_SIZE}
              fill={palette.monochrome[800]}
              transform={`rotate(45, ${medianX}, ${y})`}
            />
          );
        })}
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
