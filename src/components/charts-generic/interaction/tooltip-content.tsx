import { Box, Text } from "@theme-ui/components";
import { Flex } from "theme-ui";
import { LegendItem, LegendSymbol } from "../legends/color";
import { TooltipValue } from "./tooltip";

// Generic
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
      <Flex sx={{ alignItems: "center" }}>
        {color && <LegendSymbol color={color} symbol="square" />}
        {xValue && (
          <Text variant="meta" sx={{ fontWeight: "bold" }}>
            {xValue}
          </Text>
        )}
      </Flex>
      {segment && <Text variant="meta">{segment}</Text>}
      {yValue && <Text variant="meta">{yValue}</Text>}
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
        <Text variant="meta" sx={{ fontWeight: "bold" }}>
          {xValue}
        </Text>
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

// Chart Specific
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
        <Text variant="meta" sx={{ fontWeight: "bold" }}>
          {firstLine}
        </Text>
      )}
      {secondLine && <Text variant="meta">{secondLine}</Text>}
      {thirdLine && <Text variant="meta">{thirdLine}</Text>}
    </Box>
  );
};
