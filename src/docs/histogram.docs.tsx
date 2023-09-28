import { markdown, ReactSpecimen } from "catalog";
import { median } from "d3-array";

import {
  AnnotationX,
  AnnotationXLabel,
} from "../components/charts-generic/annotation/annotation-x";
import {
  AxisHeightLinear,
  AxisHeightLinearDomain,
} from "../components/charts-generic/axis/axis-height-linear";
import {
  AxisWidthHistogram,
  AxisWidthHistogramDomain,
} from "../components/charts-generic/axis/axis-width-histogram";
import {
  ChartContainer,
  ChartSvg,
} from "../components/charts-generic/containers";
import { HistogramColumns } from "../components/charts-generic/histogram/histogram";
import { Histogram } from "../components/charts-generic/histogram/histogram-state";
import { HistogramMedian } from "../components/charts-generic/histogram/median";
import { GenericObservation } from "../domain/data";

import { standardH12020 } from "./data/2020-standard-H1";

export default () => {
  return markdown`
## Base Histogram

  ${(
    <ReactSpecimen span={6}>
      <Histogram
        medianValue={median(standardH12020, (d) => d["Total exkl. MWST"])}
        data={standardH12020 as GenericObservation[]}
        fields={{
          x: {
            componentIri: "Total exkl. MWST",
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
        aspectRatio={0.4}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear />
            <AxisHeightLinearDomain />
            <AxisWidthHistogram />
            <AxisWidthHistogramDomain />
            <HistogramColumns />
            <HistogramMedian label="CH Median" />
          </ChartSvg>
        </ChartContainer>
      </Histogram>
    </ReactSpecimen>
  )}

  ## With annotations

  ${(
    <ReactSpecimen span={6}>
      <Histogram
        medianValue={median(standardH12020, (d) => d["Total exkl. MWST"])}
        data={standardH12020 as GenericObservation[]}
        fields={{
          x: {
            componentIri: "Total exkl. MWST",
          },
          label: {
            componentIri: "Netzbetreiber",
          },
          annotation: [
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
          ],
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
            <AnnotationX />
            <HistogramColumns />
            <AxisWidthHistogramDomain />
            <HistogramMedian label="CH Median" />
          </ChartSvg>
          <AnnotationXLabel />
        </ChartContainer>
      </Histogram>
    </ReactSpecimen>
  )}
  `;
};
