import { markdown, ReactSpecimen } from "catalog";
import { Ruler } from "../components/charts-generic/annotations/ruler";
import { Tooltip } from "../components/charts-generic/annotations/tooltip";
import { Areas } from "../components/charts-generic/areas/areas";
import { AreaChart } from "../components/charts-generic/areas/areas-state";
import { AxisHeightLinear } from "../components/charts-generic/axis/axis-height-linear";
import {
  AxisTime,
  AxisTimeDomain,
} from "../components/charts-generic/axis/axis-width-time";
import {
  ChartContainer,
  ChartSvg,
} from "../components/charts-generic/containers";
import { InteractionHorizontal } from "../components/charts-generic/interaction/interaction-horizontal";
import { LegendColor } from "../components/charts-generic/legends/color";
import { zurichAndGeneva } from "./fixtures";

export default () => {
  const observations = zurichAndGeneva.filter(
    (d) => d.Kategorie === "H1" && d.Produkt === "standard"
  );
  console.log(observations);

  return markdown`
> Area Chart

  ${(
    <ReactSpecimen span={6}>
      <AreaChart
        data={observations}
        fields={{
          x: {
            componentIri: "Jahr",
          },
          y: {
            componentIri: "Total exkl. MWST",
          },
          segment: {
            componentIri: "ID",
            palette: "set2",
          },
        }}
        measures={[
          {
            iri: "Jahr",
            label: "Jahr",
            __typename: "Measure",
          },
        ]}
        dimensions={[
          {
            iri: "ID",
            label: "ID",
            values: [
              {
                value: "565",
                label: "ewz Elektrizitätswerk der Stadt Zürich (Zürich)",
                __typename: "DimensionValue",
              },
              {
                value: "692",
                label: "Services Industriels de Genève SIG",
                __typename: "DimensionValue",
              },
            ],
            __typename: "NominalDimension",
          },
        ]}
        aspectRatio={0.4}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisTime /> <AxisHeightLinear />
            <Areas /> <AxisTimeDomain />
            <InteractionHorizontal />
          </ChartSvg>
          <Tooltip type={"multiple"} />
          <Ruler />
        </ChartContainer>
        <LegendColor symbol="square" />
      </AreaChart>
    </ReactSpecimen>
  )}

`;
};
