import { Box, Typography } from "@mui/material";

import { TooltipValue } from "src/components/charts-generic/interaction/tooltip";
import {
  LegendItem,
  LegendSymbol,
} from "src/components/charts-generic/legends/color";

export const TooltipSingle = ({
  xValue,
  segment,
  yValue,
  color,
}: {
  xValue?: string;
  segment?: string;
  yValue?: string;
  color?: string;
}) => {
  return (
    <Box>
      <Box sx={{ alignItems: "center" }} display="flex">
        {color && <LegendSymbol color={color} symbol="square" />}
        {xValue && (
          <Typography variant="meta" sx={{ fontWeight: "bold" }}>
            {xValue}
          </Typography>
        )}
      </Box>
      {segment && <Typography variant="meta">{segment}</Typography>}
      {yValue && <Typography variant="meta">{yValue}</Typography>}
    </Box>
  );
};

export const TooltipMultiple = ({
  xValue,
  segmentValues,
}: {
  xValue?: string;
  segmentValues: TooltipValue[];
}) => {
  return (
    <Box>
      {xValue && (
        <Typography variant="meta" sx={{ fontWeight: "bold" }}>
          {xValue}
        </Typography>
      )}
      {segmentValues.map((segment, i) =>
        segment.color ? (
          <LegendItem
            key={i}
            item={`${segment.label}: ${segment.value}`}
            color={segment.color}
            symbol="square"
          />
        ) : null
      )}
    </Box>
  );
};

export const TooltipHistogram = ({
  firstLine,
  secondLine,
  thirdLine,
}: {
  firstLine?: string;
  secondLine?: string;
  thirdLine?: string;
}) => {
  return (
    <Box>
      {firstLine && (
        <Typography variant="meta" sx={{ fontWeight: "bold" }}>
          {firstLine}
        </Typography>
      )}
      {secondLine && <Typography variant="meta">{secondLine}</Typography>}
      {thirdLine && <Typography variant="meta">{thirdLine}</Typography>}
    </Box>
  );
};
