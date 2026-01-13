import { Box } from "@mui/material";

import {
  TooltipPlacement,
  TooltipValue,
} from "src/components/charts-generic/interaction/tooltip";
import {
  LinesState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useInteraction } from "src/components/charts-generic/use-interaction";
import { Margins } from "src/components/charts-generic/use-width";
import { GenericObservation } from "src/domain/data";

export const Ruler = () => {
  const [state] = useInteraction();
  const { visible, d } = state.interaction;

  return <>{visible && d && <RulerInner d={d} />}</>;
};

const RulerInner = ({ d }: { d: GenericObservation }) => {
  const { getAnnotationInfo, bounds } = useChartState() as LinesState;
  const { xAnchor, yAnchor, xValue, datum, placement, values } =
    getAnnotationInfo(d);

  return (
    <RulerContent
      xValue={xValue}
      values={values}
      chartHeight={bounds.chartHeight}
      margins={bounds.margins}
      xAnchor={xAnchor}
      yAnchor={yAnchor}
      datum={datum!}
      placement={placement}
    />
  );
};

const RulerContent = ({
  xValue,
  chartHeight,
  margins,
  xAnchor,
}: {
  xValue: string;
  values: TooltipValue[] | undefined;
  chartHeight: number;
  margins: Margins;
  xAnchor: number;
  yAnchor: number;
  datum: TooltipValue;
  placement: TooltipPlacement;
}) => {
  return (
    <>
      <Box
        style={{
          height: chartHeight,
          left: xAnchor + margins.left,
          top: margins.top,
        }}
        width={0}
        position="absolute"
        borderColor="secondary[200]"
        sx={{
          borderWidth: 0.5,
          borderStyle: "solid",
          pointerEvents: "none",
          transform: "translateX(-50%)",
        }}
      />
      <Box
        style={{
          left: xAnchor + margins.left,
          top: chartHeight + margins.top + 6,
        }}
        position="absolute"
        fontWeight={700}
        bgcolor="background.paper"
        px={1}
        fontSize="0.875rem"
        color="secondary.800"
        sx={{
          transform: "translateX(-50%)",
        }}
      >
        {xValue}
      </Box>
    </>
  );
};
