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

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof HistogramComponent> = {
  title: "Charts/Histogram",
  component: HistogramComponent,
};

export default meta;
type Story = StoryObj<typeof HistogramComponent>;

// Generate mock data for the histogram
const generateMockData = (count: number, mean: number, stdDev: number) => {
  // Simple normal distribution approximation
  const normalRandom = () => {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdDev + mean;
  };

  return Array.from({ length: count }, (_, i) => ({
    __typename: "OperatorObservation",
    value: normalRandom(),
    municipalityLabel: `Municipality ${(i % 20) + 1}`,
    operatorLabel: `Operator ${Math.floor(i / 20) + 1}`,
    muniOperator: `Municipality ${(i % 20) + 1}, Operator ${
      Math.floor(i / 20) + 1
    }`,
    municipality: `muni-${(i % 20) + 1}`,
    operator: `op-${Math.floor(i / 20) + 1}`,
    canton: `canton-${(i % 10) + 1}`,
    cantonLabel: `Canton ${(i % 10) + 1}`,
  }));
};

export const Histogram: Story = {
  render: () => {
    const mockData = generateMockData(100, 20, 5);
    const medianValue = 20; // Set the median to 20

    // Create some annotations for specific values
    const annotations = [
      {
        value: 15,
        muniOperator: "Zürich, EWZ",
        municipality: "zurich",
        operator: "ewz",
      },
      {
        value: 25,
        muniOperator: "Basel, IWB",
        municipality: "basel",
        operator: "iwb",
      },
      {
        value: 30,
        muniOperator: "Multiple municipalities (5)",
        municipality: "group",
        operator: "group",
      },
    ];

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
              <AxisWidthHistogramDomain />
              <AnnotationX />
              <HistogramColumns />
              <HistogramMedian label="CH Median" />
              <InteractionHistogram />
            </ChartSvg>
            <AnnotationXLabel />
          </ChartContainer>
          <Tooltip type="single" />
        </HistogramComponent>
      </Box>
    );
  },
};
