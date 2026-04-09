import { memo, useMemo } from "react";

import { MedianDiamond } from "src/components/charts-generic/dot-plot/median-diamond.tsx";
import {
  DotPlotState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { GenericObservation } from "src/domain/data";
import { chartPalette, palette } from "src/themes/palette";

import { useInteraction } from "../use-interaction";

type DotProps = {
  compareWith?: string[];
  data?: GenericObservation[];
};

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

  const svgDots = useMemo(() => {
    const isHighlighted = (d: (typeof data)[number]) =>
      !!highlightedValue &&
      getHighlightEntity(d)?.toString() === highlightedValue.toString();

    const rows = data.map((d) => {
      const cx = xScale(getX(d));
      const cy = (yScale(getY(d)) || 0) + yScale.bandwidth() / 2;
      const highlighted = isHighlighted(d);
      const isHovered = d === hovered;
      const fill = compareWith?.includes("sunshine.select-all")
        ? palette.monochrome[200]
        : highlighted
          ? chartPalette.categorical[0]
          : colors(getColor(d));
      const opacity = isHovered ? 1 : highlighted ? 1 : 0.75;

      return { d, cx, cy, fill, opacity, isHovered, isHighlighted: highlighted };
    });

    return [...rows].sort(
      (a, b) => Number(a.isHovered) - Number(b.isHovered),
    );
  }, [
    colors,
    compareWith,
    data,
    getColor,
    getHighlightEntity,
    getX,
    getY,
    highlightedValue,
    hovered,
    xScale,
    yScale,
  ]);

  const highlightedDotProps = svgDots.filter((x) => x.isHighlighted);
  const hoveredDot = svgDots.find((x) => x.isHovered);
  const medianX = medianValue ? xScale(medianValue) : null;

  return (
    <>
      {/* Connector lines from hovered dot to highlighted series */}
      {hovered &&
        hoveredDot &&
        highlightedValue &&
        highlightedDotProps.map(({ d, cx }, i) => (
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

      {svgDots.map(({ cx, cy, fill, opacity }, i) => (
        <Dot
          key={`dot-${i}`}
          cx={cx}
          cy={cy}
          color={fill}
          opacity={opacity}
        />
      ))}

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
