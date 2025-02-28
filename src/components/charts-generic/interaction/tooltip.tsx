import { ReactNode } from "react";

import { TooltipBox } from "src/components/charts-generic/interaction/tooltip-box";
import {
  TooltipMultiple,
  TooltipSingle,
} from "src/components/charts-generic/interaction/tooltip-content";
import { LinesState } from "src/components/charts-generic/lines/lines-state";
import {
  HistogramState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useInteraction } from "src/components/charts-generic/use-interaction";
import { GenericObservation } from "src/domain/data";

export const TRIANGLE_SIZE = 8;
export const TOOLTIP_OFFSET = 4;

export const Tooltip = ({ type = "single" }: { type: TooltipType }) => {
  const [state] = useInteraction();
  const { visible, mouse, d } = state.interaction;
  return (
    <>{visible && d && <TooltipInner d={d} mouse={mouse} type={type} />}</>
  );
};

export type Xplacement = "left" | "center" | "right";
export type Yplacement = "top" | "middle" | "bottom";
export type TooltipPlacement = { x: Xplacement; y: Yplacement };

export type TooltipType = "single" | "multiple" | "histogram";
export interface TooltipValue {
  label?: string;
  value: string;
  color?: string;
  yPos?: number;
}

type TooltipCommon = {
  xAnchor: number;
  yAnchor: number;
  placement: TooltipPlacement;
  xValue: string;
  tooltipContent?: ReactNode;
};
export type Tooltip = TooltipCommon & {
  values?: TooltipValue[];
  datum?: TooltipValue;
};

const TooltipInner = ({
  d,
  mouse,
  type,
}: {
  d: GenericObservation;
  mouse?: { x: number; y: number };
  type: TooltipType;
}) => {
  const { bounds, getAnnotationInfo } = useChartState() as
    | LinesState
    | HistogramState;
  const { margins } = bounds;
  const { xAnchor, yAnchor, placement, xValue, tooltipContent, datum, values } =
    getAnnotationInfo(d);

  return (
    <TooltipBox
      x={xAnchor}
      y={mouse && values && values.length > 1 ? mouse.y : yAnchor}
      placement={placement}
      margins={margins}
    >
      {tooltipContent ? (
        tooltipContent
      ) : type === "multiple" && values ? (
        <TooltipMultiple xValue={xValue} segmentValues={values} />
      ) : type === "single" && datum ? (
        <TooltipSingle
          xValue={xValue}
          segment={datum.label}
          yValue={datum.value}
          color={datum.color}
        />
      ) : null}
    </TooltipBox>
  );
};
