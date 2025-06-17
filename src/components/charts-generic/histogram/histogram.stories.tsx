import { Box } from "@mui/material";

import { AnnotationX, AnnotationXLabel } from "../annotation/annotation-x";
import { AxisHeightLinear } from "../axis/axis-height-linear";
import { AxisWidthHistogramDomain } from "../axis/axis-width-histogram";
import { ChartContainer, ChartSvg } from "../containers";
import { Tooltip } from "../interaction/tooltip";
import { InteractionHistogram } from "../overlay/interaction-histogram";

import { HistogramColumns } from "./histogram";
import { HistogramMinMaxValues } from "./histogram-min-max-values";
import { Histogram as HistogramComponent } from "./histogram-state";
import { HistogramMedian } from "./median";
import { mockData } from "./mock";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof HistogramComponent> = {
  title: "Charts/Histogram",
  component: HistogramComponent,
};

export default meta;
type Story = StoryObj<typeof HistogramComponent>;

export const Histogram: Story = {
  render: () => {
    const medianValue = 20; // Set the median to 20

    // Create some annotations for specific values
    const annotations = [mockData[0], mockData[1], mockData[2]];

    return (
      <Box sx={{ width: "100%", maxWidth: "800px", m: 5 }}>
        <HistogramComponent
          data={mockData}
          medianValue={medianValue}
          aspectRatio={0.3}
          xAxisLabel="Price"
          yAxisLabel="Number of municipalities"
          xAxisUnit=" Rp./kWh"
          fields={{
            x: {
              componentIri: "value",
            },
            label: {
              componentIri: "muniOperator",
            },
            annotation: annotations,
          }}
          measures={[
            {
              iri: "value",
              label: "Price value",
              __typename: "Measure",
            },
          ]}
        >
          <ChartContainer>
            <ChartSvg>
              <AxisHeightLinear />
              <HistogramMinMaxValues />
              <AnnotationX />
              <HistogramColumns />
              <HistogramMedian label="CH Median" />
              <AxisWidthHistogramDomain />
              <InteractionHistogram />
            </ChartSvg>
            <Tooltip type="single" />
            <AnnotationXLabel />
          </ChartContainer>
        </HistogramComponent>
      </Box>
    );
  },
};
