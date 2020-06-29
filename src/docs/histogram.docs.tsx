import { markdown, ReactSpecimen } from "catalog";
import { Tooltip } from "../components/charts-generic/annotations/tooltip";
import {
  AxisHeightLinear,
  AxisHeightLinearDomain,
} from "../components/charts-generic/axis/axis-height-linear";
import {
  AxisWidthLinear,
  AxisWidthLinearDomain,
} from "../components/charts-generic/axis/axis-width-linear";
import {
  ChartContainer,
  ChartSvg,
} from "../components/charts-generic/containers";
import { HistogramColumns } from "../components/charts-generic/histogram/histogram";
import { Histogram } from "../components/charts-generic/histogram/histogram-state";
import { standardH12020 } from "./data/2020-standard-H1";

export default () => {
  return markdown`
> Histogram

  ${(
    <ReactSpecimen span={6}>
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
            <AxisWidthLinear />
            <AxisWidthLinearDomain />
            {/* <AxisWidthBand />
            <Columns />
            <AxisWidthBandDomain />
            <InteractionColumns /> */}
            <HistogramColumns />
          </ChartSvg>
          <Tooltip type="single" />
        </ChartContainer>
      </Histogram>
    </ReactSpecimen>
  )}
  `;
};
