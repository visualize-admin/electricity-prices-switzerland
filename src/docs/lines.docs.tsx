import { markdown, ReactSpecimen } from "catalog";

import { AxisHeightLinear } from "../components/charts-generic/axis/axis-height-linear";
import {
  AxisTime,
  AxisTimeDomain,
} from "../components/charts-generic/axis/axis-width-time";
import {
  ChartContainer,
  ChartSvg,
} from "../components/charts-generic/containers";
import { HoverDotMultiple } from "../components/charts-generic/interaction/hover-dots-multiple";
import { Ruler } from "../components/charts-generic/interaction/ruler";
import { Tooltip } from "../components/charts-generic/interaction/tooltip";
import { LegendColor } from "../components/charts-generic/legends/color";
import { Lines } from "../components/charts-generic/lines/lines";
import { LineChart } from "../components/charts-generic/lines/lines-state";
import { InteractionHorizontal } from "../components/charts-generic/overlay/interaction-horizontal";

import { zurichAndGeneva } from "./fixtures";

export default () => {
  const observations = zurichAndGeneva.filter(
    (d) => d.Kategorie === "H1" && d.Produkt === "standard"
  );

  return markdown`
> Line Chart

  ${(
    <ReactSpecimen span={6}>
      <LineChart
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
            __typename: "NominalDimension",
          },
        ]}
        aspectRatio={0.4}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear /> <AxisTime /> <AxisTimeDomain />
            <Lines />
            <InteractionHorizontal />
          </ChartSvg>

          <Ruler />

          <HoverDotMultiple />

          <Tooltip type={"multiple"} />
        </ChartContainer>
        <LegendColor symbol="line" />
      </LineChart>
    </ReactSpecimen>
  )}

`;
};
