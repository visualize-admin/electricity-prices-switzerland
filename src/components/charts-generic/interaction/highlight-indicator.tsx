import { Box } from "@mui/material";

import {
  LinesState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";

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

  return (
    <>
      {/* Dashed vertical line */}
      <Box
        position="absolute"
        width={0}
        borderLeft="1px dashed"
        borderColor="secondary.300"
        sx={{
          top: bounds.margins.top + yAnchor,
          left: xAnchor + bounds.margins.left,
          height: bounds.chartHeight - yAnchor,
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      />

      {/* Black dot at highlighted X/Y */}
      <Box
        position="absolute"
        width={10}
        height={10}
        borderRadius="50%"
        bgcolor="black"
        border="2px solid white"
        sx={{
          top: bounds.margins.top + yAnchor,
          left: xAnchor + bounds.margins.left,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};
