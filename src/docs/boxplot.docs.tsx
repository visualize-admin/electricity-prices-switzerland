import { markdown, ReactSpecimen } from "catalog";
import {
  AxisWidthLinear,
  AxisWidthLinearDomain,
} from "../components/charts-generic/axis/axis-width-linear";
import { BoxPlotRows } from "../components/charts-generic/boxplot/boxplot";
import { BoxPlot } from "../components/charts-generic/boxplot/boxplot-state";
import {
  ChartContainer,
  ChartSvg,
} from "../components/charts-generic/containers";

import { boxPlotData } from "./data/boxplotdata";

export default () => {
  return markdown`
> Boxplot

  ${(
    <ReactSpecimen span={6}>
      <BoxPlot
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
            {/* <AxisWidthLinear />
            <AxisWidthLinearDomain /> */}
            <BoxPlotRows />
          </ChartSvg>
        </ChartContainer>
      </BoxPlot>
    </ReactSpecimen>
  )}
  `;
};
