import { t } from "@lingui/macro";
import { Box, Typography } from "@mui/material";

import { TooltipValue } from "src/components/charts-generic/interaction/tooltip";
import {
  LegendItem,
  LegendSymbol,
} from "src/components/charts-generic/legends/color";
import { peerGroupOperatorName } from "src/domain/sunshine";

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
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {xValue}
          </Typography>
        )}
      </Box>
      {segment && <Typography variant="caption">{segment}</Typography>}
      {yValue && <Typography variant="caption">{yValue}</Typography>}
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
        <Typography variant="caption" display="block" fontWeight={700}>
          {xValue}
        </Typography>
      )}
      {segmentValues.map((segment, i) =>
        segment.color ? (
          <LegendItem
            key={i}
            item={`${
              // FIXME: This is a workaround for the peer group operator name translation
              segment.label === peerGroupOperatorName
                ? t({
                    id: "progress-overtime-chart.operator-name.peer-group",
                    message: "Median peer group",
                  })
                : segment.label
            }: ${segment.value}`}
            color={segment.color}
            symbol={segment.symbol ?? "square"}
          />
        ) : null
      )}
    </Box>
  );
};
