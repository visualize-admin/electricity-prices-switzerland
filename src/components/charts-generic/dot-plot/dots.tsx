import { groupBy } from "lodash";
import { memo, useMemo } from "react";

import {
  DotPlotState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { GenericObservation } from "src/domain/data";
import { chartPalette, palette } from "src/themes/palette";

import { MEDIAN_DIAMOND_SIZE } from "../constants";
import { useInteraction } from "../use-interaction";

type DotProps = {
  compareWith?: string[];
  data?: GenericObservation[];
};

const MedianDiamond: React.FC<{
  x: number;
  y: number;
  yValue: unknown;
}> = ({ x, y, yValue }) => (
  <rect
    key={`median-${yValue}`}
    x={x - MEDIAN_DIAMOND_SIZE / 2}
    y={y - MEDIAN_DIAMOND_SIZE / 2}
    width={MEDIAN_DIAMOND_SIZE}
    height={MEDIAN_DIAMOND_SIZE}
    fill={palette.monochrome[800]}
    stroke={palette.background.paper}
    strokeWidth={1}
    transform={`rotate(45, ${x}, ${y})`}
  />
);

export const Dots = (props: DotProps) => {
  const {
    data: contextData,
    getX,
    getY,
    xScale,
    yScale,
    getHighlightEntity,
    highlightedValue,
    colors,
    getColor,
    medianValue,
  } = useChartState() as DotPlotState;

  const { compareWith, data: propsData } = props;

  const data = propsData ?? contextData;

  const [interaction] = useInteraction();
  const hovered = interaction.interaction?.d;

  const dotProps = useMemo(() => {
    return data.map((d) => ({
      d,
      cx: xScale(getX(d)),
      cy: (yScale(getY(d)) || 0) + yScale.bandwidth() / 2,
    }));
  }, [data, getX, getY, xScale, yScale]);

  const { true: regularDots = [], false: selectedDots = [] } = groupBy(
    dotProps,
    ({ d }) =>
      d !== hovered &&
      (!highlightedValue ||
        getHighlightEntity(d)?.toString() !== highlightedValue.toString())
  );

  const hoveredDot = dotProps.find(({ d }) => d === hovered);
  const medianX = medianValue ? xScale(medianValue) : null;

  return (
    <>
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
        hoveredDot &&
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
          return <MedianDiamond x={medianX} y={y} yValue={yValue} />;
        })}
    </>
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
