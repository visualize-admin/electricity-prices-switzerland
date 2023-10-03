import { Stack, Typography } from "@mui/material";
import { merge } from "lodash";
import { useCallback } from "react";

import {
  Xplacement,
  Yplacement,
} from "src/components/charts-generic/interaction/tooltip";
import {
  TooltipBox,
  TooltipBoxProps,
} from "src/components/charts-generic/interaction/tooltip-box";
import {
  TooltipSingle,
  TooltipMultiple,
  MapTooltipContent,
} from "src/components/charts-generic/interaction/tooltip-content";
import { useColorScale } from "src/domain/data";

const tooltipBoxProps = {
  x: 0,
  y: 0,
  placement: {
    x: "right" as Xplacement,
    y: "top" as Yplacement,
  },
  style: { position: "static" },
  margins: { top: 100, left: 0, right: 0, bottom: 0 },
} as TooltipBoxProps;

export const Example = () => {
  const colorAccessor = useCallback((d) => d.value, []);

  const colorScale = useColorScale({
    observations: [],
    medianValue: 12,
    accessor: colorAccessor,
  });
  return (
    <Stack spacing={2} direction="column" position="relative">
      <div>
        <Typography variant="h5">Multiple</Typography>
        <TooltipBox
          {...merge({}, tooltipBoxProps, { style: { marginTop: 100 } })}
        >
          <TooltipMultiple
            xValue="La Chaux de Fonds"
            segmentValues={[
              {
                label: "Licht und Wasserwerk AG",
                value: "33.1",
                color: "orange",
                yPos: 0,
              },
              {
                label: "Industrial Light & Magic AG",
                value: "45.2",
                color: "turquoise",
                yPos: 0,
              },
            ]}
          />
        </TooltipBox>
      </div>
      <div>
        <Typography variant="h5">Single</Typography>

        <TooltipBox {...tooltipBoxProps}>
          <TooltipSingle
            xValue={"La Chaux de Fonds"}
            segment={"Licht und Wasserwerk AG"}
            yValue={"33.2"}
            color={"turquoise"}
          />
        </TooltipBox>
      </div>
      <TooltipBox {...tooltipBoxProps}>
        <MapTooltipContent
          colorScale={colorScale}
          {...{
            hovered: {
              x: 828,
              y: 489.20001220703125,
              id: "4495",
              type: "municipality",
            },
            tooltipContent: {
              id: "4495",
              name: "Hohentannen - Thurgau",
              observations: [
                {
                  period: "2024",
                  municipality: "4495",
                  municipalityLabel: "Hohentannen",
                  operator: "761",
                  operatorLabel: "Technische Gemeindebetriebe Bischofszell",
                  canton: "20",
                  cantonLabel: "Thurgau",
                  category: "H4",
                  value: 39.16381,
                  __typename: "OperatorObservation",
                },
                {
                  period: "2024",
                  municipality: "4495",
                  municipalityLabel: "Hohentannen",
                  operator: "385",
                  operatorLabel:
                    "Politische Gemeinde Hohentannen, Stromversorgung",
                  canton: "20",
                  cantonLabel: "Thurgau",
                  category: "H4",
                  value: 25.366667,
                  __typename: "OperatorObservation",
                },
              ],
            },
          }}
        />
      </TooltipBox>
    </Stack>
  );
};

export default {
  component: TooltipSingle,
  title: "Components / Tooltip",
};
