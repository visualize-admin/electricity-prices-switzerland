import { useMemo } from "react";

import {
  LinesState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useChartTheme } from "src/components/charts-generic/use-chart-theme";
import { useInteraction } from "src/components/charts-generic/use-interaction";
import { useFormatDisplayNumber } from "src/domain/helpers";
import { palette } from "src/themes/palette";

export const pickHighlightDate = (
  xUniqueValues: Date[],
  highlightYear: number | undefined
): Date | undefined => {
  if (!xUniqueValues.length) return undefined;
  if (highlightYear == null || Number.isNaN(highlightYear)) {
    return xUniqueValues[xUniqueValues.length - 1];
  }
  const yearOf = (d: Date) => d.getFullYear();
  const exact = xUniqueValues.find((d) => yearOf(d) === highlightYear);
  if (exact) return exact;
  return xUniqueValues.reduce((best, d) =>
    Math.abs(yearOf(d) - highlightYear) < Math.abs(yearOf(best) - highlightYear)
      ? d
      : best
  );
};

type Point = { x: number; y: number };

// Lines are straight between points, so within [x0, x1] a line's y values are
// bounded by its points inside the range and where it crosses x0 and x1.
const lineYsWithin = (line: Point[], x0: number, x1: number) => {
  const ys = line.filter((p) => p.x >= x0 && p.x <= x1).map((p) => p.y);
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1];
    const b = line[i];
    for (const x of [x0, x1]) {
      if (a.x < x && x < b.x) {
        ys.push(a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x));
      }
    }
  }
  return ys;
};

/**
 * Vertical center for the highlight label so that it does not overlap the
 * lines. Moves the label up to the nearest free position, or down if there is
 * no room above, staying inside the chart. Only the y position changes.
 */
export const getHighlightLabelY = ({
  anchorY,
  labelX0,
  labelX1,
  labelHeight,
  lines,
  chartHeight,
  gap = 2,
}: {
  anchorY: number;
  labelX0: number;
  labelX1: number;
  labelHeight: number;
  /** Line points in chart coordinates, sorted by x */
  lines: Point[][];
  chartHeight: number;
  gap?: number;
}): number => {
  const obstacles = lines.flatMap((line) =>
    lineYsWithin(line, labelX0, labelX1)
  );
  const half = labelHeight / 2 + gap;
  const collisions = (y: number) =>
    obstacles.filter((o) => o > y - half && o < y + half);

  const search = (direction: "up" | "down") => {
    let y = anchorY;
    let hits = collisions(y);
    while (hits.length > 0) {
      const next =
        direction === "up"
          ? Math.min(...hits) - half
          : Math.max(...hits) + half;
      // Rounding can leave the label touching the line it was moved past,
      // which would hit it again and loop forever
      if (next === y) break;
      y = next;
      hits = collisions(y);
    }
    return y;
  };

  const up = search("up");
  if (up - labelHeight / 2 >= 0) return up;
  const down = search("down");
  if (down + labelHeight / 2 <= chartHeight) return down;
  return Math.min(
    Math.max(anchorY, labelHeight / 2),
    chartHeight - labelHeight / 2
  );
};

export const HighlightIndicator = (props: {
  /** When set (e.g. map URL `period`), highlight this year instead of the last datapoint. */
  highlightYear?: number;
}) => {
  const { highlightYear } = props;
  const {
    bounds,
    xScale,
    yScale,
    xUniqueValues,
    data,
    getX,
    getY,
    yAxisLabel,
    grouped,
  } = useChartState() as LinesState;
  const [{ interaction }] = useInteraction();
  const formatDisplay = useFormatDisplayNumber();
  const { annotationFontSize, fontFamily } = useChartTheme();

  // Recomputed only when the chart changes, not on hover
  const geometry = useMemo(() => {
    if (!xUniqueValues.length) return null;

    const highlightDate = pickHighlightDate(xUniqueValues, highlightYear);
    if (!highlightDate) return null;

    const xAnchor = xScale(highlightDate);

    const dataAtHighlightX = data.find(
      (d) => getX(d)?.getTime() === highlightDate.getTime()
    );
    if (!dataAtHighlightX) return null;

    const yValue = getY(dataAtHighlightX);
    if (yValue == null) return null;

    const yAnchor = yScale(yValue);
    const label = `${formatDisplay(yValue)}${
      yAxisLabel ? ` ${yAxisLabel}` : ""
    }`;
    // Put the label on the side with more room so it isn't clipped at the chart edge
    const labelOnRight = xAnchor < bounds.chartWidth / 2;
    // Approximate text box, SVG text is not measured before render
    const labelWidth = label.length * annotationFontSize * 0.6;
    const labelHeight = annotationFontSize * 1.2;
    const labelX0 = labelOnRight ? xAnchor + 10 : xAnchor - 10 - labelWidth;
    const lines = grouped.map(([, rows]) =>
      rows
        .map((d) => ({ x: getX(d), y: getY(d) }))
        .filter(
          (p): p is { x: Date; y: number } =>
            p.x !== undefined && p.y !== undefined && !isNaN(p.y)
        )
        .map((p) => ({ x: xScale(p.x), y: yScale(p.y) }))
        .sort((a, b) => a.x - b.x)
    );
    const labelY = getHighlightLabelY({
      anchorY: yAnchor,
      labelX0,
      labelX1: labelX0 + labelWidth,
      labelHeight,
      lines,
      chartHeight: bounds.chartHeight,
    });

    return { xAnchor, yAnchor, label, labelOnRight, labelY };
  }, [
    xUniqueValues,
    highlightYear,
    xScale,
    yScale,
    data,
    getX,
    getY,
    formatDisplay,
    yAxisLabel,
    bounds.chartWidth,
    bounds.chartHeight,
    annotationFontSize,
    grouped,
  ]);

  if (!geometry) return null;

  const { xAnchor, yAnchor, label, labelOnRight, labelY } = geometry;
  const lineColor = palette.secondary[300];

  return (
    <g
      transform={`translate(${bounds.margins.left}, ${bounds.margins.top})`}
      style={{ pointerEvents: "none" }}
    >
      <line
        x1={xAnchor}
        x2={xAnchor}
        y1={yAnchor}
        y2={bounds.chartHeight}
        stroke={lineColor}
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <circle
        cx={xAnchor}
        cy={yAnchor}
        r={5}
        fill="black"
        stroke="white"
        strokeWidth={2}
      />
      {interaction.visible ? null : (
        <text
          x={labelOnRight ? xAnchor + 10 : xAnchor - 10}
          y={labelY}
          textAnchor={labelOnRight ? "start" : "end"}
          dominantBaseline="middle"
          fontSize={annotationFontSize}
          fontFamily={fontFamily}
          fontWeight={700}
          fill={palette.secondary[800]}
          // White halo behind the text so it stays readable over a line
          stroke="white"
          strokeOpacity={1}
          strokeWidth={3}
          strokeLinejoin="round"
          paintOrder="stroke"
        >
          {label}
        </text>
      )}
    </g>
  );
};
