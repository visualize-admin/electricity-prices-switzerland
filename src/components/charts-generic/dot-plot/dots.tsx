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

  const dotProps = useMemo(() => {
    return data.map((d) => ({
      d,
      cx: xScale(getX(d)),
      cy: (yScale(getY(d)) || 0) + yScale.bandwidth() / 2,
    }));
  }, [data, getX, getY, xScale, yScale]);

  const isHighlighted = (d: (typeof data)[number]) =>
    !!highlightedValue &&
    getHighlightEntity(d)?.toString() === highlightedValue.toString();

  const fillForDot = (d: (typeof data)[number]) =>
    compareWith?.includes("sunshine.select-all")
      ? palette.monochrome[200]
      : isHighlighted(d)
        ? chartPalette.categorical[0]
        : colors(getColor(d));

  /** Non-highlighted dots are slightly transparent; hover only increases opacity, not hue. */
  const opacityForDot = (d: (typeof data)[number]) => {
    if (d === hovered) return 1;
    return isHighlighted(d) ? 1 : 0.75;
  };

  const highlightedDotProps = dotProps.filter(({ d }) => isHighlighted(d));
  const hoveredDot = dotProps.find(({ d }) => d === hovered);
  const medianX = medianValue ? xScale(medianValue) : null;

  /** Paint hovered circle last so it stays on top without a separate fill override. */
  const dotPropsPaintOrder = useMemo(
    () =>
      [...dotProps].sort((a, b) => {
        if (a.d === hovered) return 1;
        if (b.d === hovered) return -1;
        return 0;
      }),
    [dotProps, hovered],
  );

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

      {dotPropsPaintOrder.map(({ cx, cy, d }, i) => (
        <Dot
          key={`dot-${i}`}
          cx={cx}
          cy={cy}
          color={fillForDot(d)}
          opacity={opacityForDot(d)}
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
