import { markdown, ReactSpecimen } from "catalog";
import { median } from "d3";

import {
  AnnotationX,
  AnnotationXLabel,
  AnnotationXDataPoint,
} from "../components/charts-generic/annotation/annotation-x";
import { AxisWidthLinear } from "../components/charts-generic/axis/axis-width-linear";
import {
  ChartContainer,
  ChartSvg,
} from "../components/charts-generic/containers";
import {
  Range,
  RangePoints,
} from "../components/charts-generic/rangeplot/rangeplot";
import { RangePlot } from "../components/charts-generic/rangeplot/rangeplot-state";
import { GenericObservation } from "../domain/data";

import { rangePlotData, annotationData } from "./data/boxplotdata";


export default () => {
  return markdown`
  ## With annotations

  ${(
    <ReactSpecimen span={6}>
      <RangePlot
        medianValue={median(rangePlotData, (d) => d["Total exkl. MWST"])}
        data={rangePlotData as GenericObservation[]}
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
            <Range id="ex1" />
            <AxisWidthLinear position="top" />
            <RangePoints />
            <AnnotationX /> <AnnotationXDataPoint />
          </ChartSvg>
          <AnnotationXLabel />
        </ChartContainer>
      </RangePlot>
    </ReactSpecimen>
  )}

## Base Range Plot

    ${(
      <ReactSpecimen span={6}>
        <RangePlot
          medianValue={median(rangePlotData, (d) => d["Total exkl. MWST"])}
          data={rangePlotData as GenericObservation[]}
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
              <Range id="ex2" />
              <AxisWidthLinear position="top" />
              <RangePoints />
            </ChartSvg>
          </ChartContainer>
        </RangePlot>
      </ReactSpecimen>
    )}
  `;
};
