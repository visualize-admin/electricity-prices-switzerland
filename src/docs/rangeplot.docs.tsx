import { markdown, ReactSpecimen } from "catalog";

import {
  Range,
  RangePoints,
} from "../components/charts-generic/rangeplot/rangeplot";
import { RangePlot } from "../components/charts-generic/rangeplot/rangeplot-state";
import {
  ChartContainer,
  ChartSvg,
} from "../components/charts-generic/containers";

import { rangePlotData, annotationData } from "./data/boxplotdata";
import { AxisWidthLinear } from "../components/charts-generic/axis/axis-width-linear";
import { AnnotationX } from "../components/charts-generic/annotation/annotation-x";

export default () => {
  return markdown`

  ## Base Range Plot

  ${(
    <ReactSpecimen span={6}>
      <RangePlot
        data={rangePlotData}
        fields={{
          x: {
            componentIri: "Total exkl. MWST",
          },
          y: {
            componentIri: "Jahr",
          },
          label: {
            componentIri: "Netzbetreiber",
          },
        }}
        measures={[
          {
            iri: "Total exkl. MWST",
            label: "Total exkl. MWST",
            __typename: "Measure",
          },
        ]}
      >
        <ChartContainer>
          <ChartSvg>
            <Range />
            <AxisWidthLinear position="top" />
            <RangePoints />
          </ChartSvg>
        </ChartContainer>
      </RangePlot>
    </ReactSpecimen>
  )}
  ## With annotations

  ${(
    <ReactSpecimen span={6}>
      <RangePlot
        data={rangePlotData}
        fields={{
          x: {
            componentIri: "Total exkl. MWST",
          },
          y: {
            componentIri: "Jahr",
          },
          label: {
            componentIri: "Netzbetreiber",
          },
          annotation: annotationData,
        }}
        measures={[
          {
            iri: "Total exkl. MWST",
            label: "Total exkl. MWST",
            __typename: "Measure",
          },
        ]}
      >
        <ChartContainer>
          <ChartSvg>
            <Range />
            <AxisWidthLinear position="top" />
            <RangePoints />
            <AnnotationX />
          </ChartSvg>
        </ChartContainer>
      </RangePlot>
    </ReactSpecimen>
  )}
  `;
};
