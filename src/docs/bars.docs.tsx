import { markdown, ReactSpecimen } from "catalog";
import { Tooltip } from "../components/charts-generic/annotations/tooltip";
import { AxisHeightBand } from "../components/charts-generic/axis/axis-height-band";
import { Bars } from "../components/charts-generic/bars/bars-simple";
import { BarChart } from "../components/charts-generic/bars/bars-state";
import {
  ChartContainer,
  ChartSvg,
} from "../components/charts-generic/containers";
import { pivot_longer } from "../domain/helpers";
import { zurichAndGeneva } from "./fixtures";

export default () => {
  const observations = zurichAndGeneva.filter(
    (d) => d.Kategorie === "H1" && d.Produkt === "standard"
  );
  const longer = pivot_longer({
    data: observations.filter((d) => d.ID === 692),
    cols: ["Netznutzung", "Energie", "Abgabe", "KEV"],
    name_to: "priceComponent",
  });

  return markdown`
> Bars Chart

  ${(
    <ReactSpecimen span={6}>
      <BarChart
        data={observations.filter((d) => d.ID === 565)}
        fields={{
          x: {
            componentIri: "Total exkl. MWST",
          },
          y: {
            componentIri: "Jahr",
            sorting: { sortingType: "byDimensionLabel", sortingOrder: "asc" },
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
            <Bars />
            <AxisHeightBand />
          </ChartSvg>
        </ChartContainer>
      </BarChart>
    </ReactSpecimen>
  )}

`;
};
