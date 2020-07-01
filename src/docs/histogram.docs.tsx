import { markdown, ReactSpecimen } from "catalog";
import { Tooltip } from "../components/charts-generic/interaction/tooltip";
import {
  AxisHeightLinear,
  AxisHeightLinearDomain,
} from "../components/charts-generic/axis/axis-height-linear";

import {
  ChartContainer,
  ChartSvg,
} from "../components/charts-generic/containers";
import {
  HistogramColumns,
  HistogramAnnotation,
} from "../components/charts-generic/histogram/histogram";
import { Histogram } from "../components/charts-generic/histogram/histogram-state";
import { standardH12020 } from "./data/2020-standard-H1";
import { Median } from "../components/charts-generic/histogram/median";
import {
  AxisWidthHistogram,
  AxisWidthHistogramDomain,
} from "../components/charts-generic/axis/axis-width-histogram";
import { AnnotationProvider } from "../components/charts-generic/use-annotation";

export default () => {
  return markdown`
## Base Histogram

  ${(
    <ReactSpecimen span={6}>
      <AnnotationProvider d={undefined}>
        <Histogram
          data={standardH12020}
          fields={{
            x: {
              componentIri: "Total exkl. MWST",
            },
          }}
          measures={[
            {
              iri: "Total exkl. MWST",
              label: "Total exkl. MWST",
              __typename: "Measure",
            },
          ]}
          aspectRatio={0.4}
        >
          <ChartContainer>
            <ChartSvg>
              <AxisHeightLinear />
              <AxisHeightLinearDomain />
              <AxisWidthHistogram />
              <AxisWidthHistogramDomain />
              <HistogramAnnotation />
              <HistogramColumns />
              <Median label="CH Median" />
            </ChartSvg>
            <Tooltip type="single" />
          </ChartContainer>
        </Histogram>
      </AnnotationProvider>
    </ReactSpecimen>
  )}

  ## With annotations

  ${(
    <ReactSpecimen span={6}>
      <AnnotationProvider
        d={[
          {
            ID: 3,
            Netzbetreiber: "Administration Communale Courchapoix",
            "VSE-ID": "10819012345",
            Kategorie: "H1",
            Netznutzung: 17.0975,
            Energie: 8.6,
            Abgabe: 1.2,
            KEV: 2.3,
            "Total exkl. MWST": 29.1975,
            Jahr: "2020",
            Produkt: "standard",
          },
          {
            ID: 757,
            Netzbetreiber: "Technische Betriebe Weinfelden AG",
            "VSE-ID": "10269012345",
            Kategorie: "H1",
            Netznutzung: 15.9256,
            Energie: 7.6197,
            Abgabe: 0,
            KEV: 2.3,
            "Total exkl. MWST": 25.8453,
            Jahr: "2020",
            Produkt: "standard",
          },
        ]}
      >
        <Histogram
          data={standardH12020}
          fields={{
            x: {
              componentIri: "Total exkl. MWST",
            },
          }}
          measures={[
            {
              iri: "Total exkl. MWST",
              label: "Total exkl. MWST",
              __typename: "Measure",
            },
          ]}
          aspectRatio={0.4}
        >
          <ChartContainer>
            <ChartSvg>
              <AxisHeightLinear />
              <AxisHeightLinearDomain />
              <AxisWidthHistogram />
              <AxisWidthHistogramDomain />
              <HistogramAnnotation />
              <HistogramColumns />
              <Median label="CH Median" />
            </ChartSvg>
            <Tooltip type="single" />
          </ChartContainer>
        </Histogram>
      </AnnotationProvider>
    </ReactSpecimen>
  )}
  `;
};
