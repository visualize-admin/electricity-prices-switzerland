import { markdown, ReactSpecimen } from "catalog";
import {
  AxisWidthLinear,
  AxisWidthLinearDomain,
} from "../components/charts-generic/axis/axis-width-linear";
import { RangePlotRows } from "../components/charts-generic/rangeplot/rangeplot";
import { RangePlot } from "../components/charts-generic/rangeplot/rangeplot-state";
import {
  ChartContainer,
  ChartSvg,
} from "../components/charts-generic/containers";

import { boxPlotData } from "./data/boxplotdata";

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
            <AxisWidthLinear />
            <AxisWidthLinearDomain />
            <RangePlotRows />
          </ChartSvg>
        </ChartContainer>
      </RangePlot>
    </ReactSpecimen>
  )}
  `;
};
