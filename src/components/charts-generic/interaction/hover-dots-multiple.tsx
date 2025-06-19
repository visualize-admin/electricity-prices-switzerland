import { Box } from "@mui/material";
import * as React from "react";

import {
  LinesState,
  useChartState,
} from "src/components/charts-generic/use-chart-state";
import { useInteraction } from "src/components/charts-generic/use-interaction";
import { GenericObservation } from "src/domain/data";

export const HoverDotMultiple = () => {
  const [state] = useInteraction();
  const { visible, d } = state.interaction;

  return <>{visible && d && <HoverDots d={d} />}</>;
};

const HoverDots = ({ d }: { d: GenericObservation }) => {
  const { getAnnotationInfo, bounds } = useChartState() as LinesState;
  const { xAnchor, values } = getAnnotationInfo(d);

  return (
    <>
      {values &&
        values.map((value, i) => (
          <React.Fragment key={i}>
            <Box
              style={{
                backgroundColor: value.color,
                left: xAnchor + bounds.margins.left,
                top: value.yPos! + bounds.margins.top,
              }}
              sx={{
                position: "absolute",
                width: 6,
                height: 6,
                borderRadius: "50%",
                borderStyle: "solid",
                borderWidth: 1,
                borderColor: "secondary.100",
                transform: "translate3d(-50%, -50%, 0)",
                pointerEvents: "none",
              }}
            />
          </React.Fragment>
        ))}
    </>
  );
};
