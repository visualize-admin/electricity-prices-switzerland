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

import { boxPlotData } from "./data/boxplotdata";
import { AxisWidthLinear } from "../components/charts-generic/axis/axis-width-linear";

export default () => {
  return markdown`
> Range

  ${(
    <ReactSpecimen span={6}>
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
          </ChartSvg>
        </ChartContainer>
      </RangePlot>
    </ReactSpecimen>
  )}
  `;
};
