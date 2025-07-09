import { ReactNode } from "react";

import { TooltipBox } from "src/components/charts-generic/interaction/tooltip-box";
import {
  TooltipMultiple,
  TooltipSingle,
} from "src/components/charts-generic/interaction/tooltip-content";
import {
  HistogramState,
  LinesState,
  DotPlotState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useInteraction } from "src/components/charts-generic/use-interaction";
import { GenericObservation } from "src/domain/data";

import { LegendSymbol } from "../legends/color";

export const TRIANGLE_SIZE = 8;
export const TOOLTIP_OFFSET = 4;

export const Tooltip = ({
  type = "single",
  forceYAnchor,
}: {
  type: TooltipType;
  forceYAnchor?: boolean;
}) => {
  const [state] = useInteraction();
  const { visible, mouse, d } = state.interaction;

  return (
    <>
      {visible && d && (
        <TooltipInner
          d={d}
          mouse={mouse}
          forceYAnchor={forceYAnchor}
          type={type}
        />
      )}
    </>
  );
};

export type XPlacement = "left" | "center" | "right";
export type YPlacement = "top" | "middle" | "bottom";
export type TooltipPlacement = { x: XPlacement; y: YPlacement };
type TooltipType = "single" | "multiple" | "histogram";
export type TooltipValue = {
  label?: string;
  value: string;
  color?: string;
  yPos?: number;
  symbol?: LegendSymbol;
};
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
  forceYAnchor = false,
}: {
  d: GenericObservation;
  mouse?: { x: number; y: number };
  type: TooltipType;
  forceYAnchor?: boolean;
}) => {
  const { bounds, getAnnotationInfo } = useChartState() as
    | LinesState
    | HistogramState
    | DotPlotState;
  const { margins } = bounds;
  const { xAnchor, yAnchor, placement, xValue, tooltipContent, datum, values } =
    getAnnotationInfo(d);

  return (
    <TooltipBox
      x={xAnchor}
      y={
        mouse && values && values.length > 1
          ? forceYAnchor
            ? yAnchor
            : mouse.y
          : yAnchor
      }
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
