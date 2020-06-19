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
import { pivot_longer } from "../domain/helpers";

export default () => {
  const observations = zurichAndGeneva.filter(
    (d) => d.Kategorie === "H1" && d.Produkt === "standard" && d.ID === 565
  );
  const longer = pivot_longer({
    data: observations,
    cols: ["Netznutzung", "Energie", "Abgabe", "KEV"],
    name_to: "priceComponent",
  });

  return markdown`
> Area Chart

  ${(
    <ReactSpecimen span={6}>
      <AreaChart
        data={longer}
        fields={{
          x: {
            componentIri: "Jahr",
          },
          y: {
            componentIri: "value",
          },
          segment: {
            componentIri: "priceComponent",
            palette: "set2",
          },
        }}
        measures={[
          {
            iri: "value",
            label: "value",
            __typename: "Measure",
          },
        ]}
        dimensions={[
          {
            iri: "Jahr",
            label: "Jahr",
            __typename: "TemporalDimension",
          },
          {
            iri: "priceComponent",
            label: "priceComponent",
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
