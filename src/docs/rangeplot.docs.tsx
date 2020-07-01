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

import { boxPlotData } from "./data/boxplotdata";
import { AxisWidthLinear } from "../components/charts-generic/axis/axis-width-linear";
import { AnnotationProvider } from "../components/charts-generic/use-annotation";

export default () => {
  return markdown`

  > Range

  ${(
    <ReactSpecimen span={6}>
      <AnnotationProvider
        d={[
          {
            ID: 5,
            Netzbetreiber: "AEW Energie AG",
            "VSE-ID": "10117012345",
            Kategorie: "C5",
            Netznutzung: 4.7089,
            Energie: 7.7915,
            Abgabe: 0.24,
            KEV: 0.45,
            "Total exkl. MWST": 13.1904,
            Jahr: "2010",
            Produkt: "standard",
          },
        ]}
      >
        <RangePlot
          data={boxPlotData}
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
