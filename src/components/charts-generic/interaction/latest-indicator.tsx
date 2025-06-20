import { Box } from "@mui/material";

import {
  LinesState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";

export const LatestIndicator = () => {
  const { bounds, xScale, yScale, xUniqueValues, data, getX, getY } =
    useChartState() as LinesState;

  if (!xUniqueValues.length) return null;

  const latestXValue = xUniqueValues[xUniqueValues.length - 1];
  const xAnchor = xScale(latestXValue);

  // Find latest Y based on data matching latest X
  const dataAtLatestX = data.find(
    (d) => getX(d).getTime() === latestXValue.getTime()
  );
  if (!dataAtLatestX) return null;

  const yValue = getY(dataAtLatestX);
  const yAnchor = yScale(yValue);

  return (
    <>
      {/* Dashed vertical line */}
      <Box
        sx={{
          position: "absolute",
          top: bounds.margins.top + yAnchor,
          left: xAnchor + bounds.margins.left,
          height: bounds.chartHeight - yAnchor,
          width: 0,
          borderLeft: "1px dashed",
          borderColor: "secondary.300",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      />

      {/* Black dot at latest X/Y */}
      <Box
        sx={{
          position: "absolute",
          top: bounds.margins.top + yAnchor,
          left: xAnchor + bounds.margins.left,
          width: 10,
          height: 10,
          borderRadius: "50%",
          bgcolor: "black",
          border: "2px solid white",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};
