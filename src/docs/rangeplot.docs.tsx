import { markdown, ReactSpecimen } from "catalog";

import {
  Range,
  RangePoints,
  RangeAnnotation,
} from "../components/charts-generic/rangeplot/rangeplot";
import { RangePlot } from "../components/charts-generic/rangeplot/rangeplot-state";
import {
  ChartContainer,
  ChartSvg,
} from "../components/charts-generic/containers";

import { rangePlotData, annotationData } from "./data/boxplotdata";
import { AxisWidthLinear } from "../components/charts-generic/axis/axis-width-linear";
import { AnnotationProvider } from "../components/charts-generic/use-annotation";

export default () => {
  return markdown`

  ## Base Range Plot

  ${(
    <ReactSpecimen span={6}>
      <AnnotationProvider d={undefined}>
        <RangePlot
          data={rangePlotData}
          fields={{
            x: {
              componentIri: "Total exkl. MWST",
            },
            y: {
              componentIri: "Jahr",
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
              <RangeAnnotation />
            </ChartSvg>
          </ChartContainer>
        </RangePlot>
      </AnnotationProvider>
    </ReactSpecimen>
  )}
  ## With annotations

  ${(
    <ReactSpecimen span={6}>
      <AnnotationProvider d={annotationData}>
        <RangePlot
          data={rangePlotData}
          fields={{
            x: {
              componentIri: "Total exkl. MWST",
            },
            y: {
              componentIri: "Jahr",
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
              <RangeAnnotation />
            </ChartSvg>
          </ChartContainer>
        </RangePlot>
      </AnnotationProvider>
    </ReactSpecimen>
  )}
  `;
};
