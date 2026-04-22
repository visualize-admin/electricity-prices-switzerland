import {
  LinesState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { palette } from "src/themes/palette";

const pickHighlightDate = (
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

export const HighlightIndicator = (props: {
  /** When set (e.g. map URL `period`), highlight this year instead of the last datapoint. */
  highlightYear?: number;
}) => {
  const { highlightYear } = props;
  const { bounds, xScale, yScale, xUniqueValues, data, getX, getY } =
    useChartState() as LinesState;

  if (!xUniqueValues.length) return null;

  const highlightDate = pickHighlightDate(xUniqueValues, highlightYear);
  if (!highlightDate) return null;

  const xAnchor = xScale(highlightDate);

  const dataAtHighlightX = data.find(
    (d) => getX(d)?.getTime() === highlightDate.getTime()
  );
  if (!dataAtHighlightX) return null;

  const yValue = getY(dataAtHighlightX);
  const yAnchor = yValue ? yScale(yValue) : 0;

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
    </g>
  );
};
