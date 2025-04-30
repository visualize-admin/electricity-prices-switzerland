import { Box } from "@mui/material";

import {
  TooltipPlacement,
  TooltipValue,
} from "src/components/charts-generic/interaction/tooltip";
import { LinesState } from "src/components/charts-generic/lines/lines-state";
import { useChartState } from "src/components/charts-generic/use-chart-state";
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
        sx={{
          width: 0,
          position: "absolute",
          borderWidth: 0.5,
          borderStyle: "solid",
          borderColor: "secondary[200]",
          pointerEvents: "none",
          transform: "translateX(-50%)",
        }}
      />
      <Box
        style={{
          left: xAnchor + margins.left,
          top: chartHeight + margins.top + 6,
        }}
        sx={{
          position: "absolute",
          fontWeight: "bold",
          bgcolor: "secondary.100",
          transform: "translateX(-50%)",
          px: 1,
          fontSize: "0.875rem",
          color: "secondary.800",
        }}
      >
        {xValue}
      </Box>
    </>
  );
};
