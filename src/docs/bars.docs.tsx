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
import { GroupedBarsChart } from "../components/charts-generic/bars/bars-grouped-state";
import { BarsGrouped } from "../components/charts-generic/bars/bars-grouped";

export default () => {
  const observations = zurichAndGeneva.filter(
    (d) => d.Kategorie === "H1" && d.Produkt === "standard"
  );
  const longer_simple = pivot_longer({
    data: observations.filter((d) => d.ID === 692 && d.Jahr === "2020"),
    cols: ["Total exkl. MWST", "Netznutzung", "Energie", "Abgabe", "KEV"],
    name_to: "priceComponent",
  }).map((d) => ({
    isTotal: d["priceComponent"] === "Total exkl. MWST",
    ...d,
  }));
  const longer_grouped = pivot_longer({
    data: observations.filter((d) => d.Jahr === "2020"),
    cols: ["Total exkl. MWST", "Netznutzung", "Energie", "Abgabe", "KEV"],
    name_to: "priceComponent",
  });

  return markdown`
> Bars Chart

  ${(
    <ReactSpecimen span={6}>
      <BarChart
        data={longer_simple}
        fields={{
          x: {
            componentIri: "value",
          },
          y: {
            componentIri: "priceComponent",
            sorting: { sortingType: "byMeasure", sortingOrder: "desc" },
          },
          // height: {
          //   componentIri: "isTotal",
          // },
        }}
        measures={[
          {
            iri: "value",
            label: "value",
            __typename: "Measure",
          },
        ]}
      >
        <ChartContainer>
          <ChartSvg>
            <Bars />
            {/* <AxisHeightBand /> */}
          </ChartSvg>
          {/* <Tooltip type="single" /> */}
        </ChartContainer>
      </BarChart>
    </ReactSpecimen>
  )}


  > Grouped Bars Chart

  ${(
    <ReactSpecimen span={6}>
      <GroupedBarsChart
        data={longer_grouped}
        fields={{
          x: {
            componentIri: "value",
          },
          y: {
            componentIri: "priceComponent",
            sorting: { sortingType: "byDimensionLabel", sortingOrder: "asc" },
          },
          segment: {
            componentIri: "ID",
            type: "grouped",
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
            iri: "ID",
            label: "ID",
            __typename: "NominalDimension",
          },
        ]}
      >
        <ChartContainer>
          <ChartSvg>
            <BarsGrouped />
            <AxisHeightBand />
          </ChartSvg>
        </ChartContainer>
      </GroupedBarsChart>
    </ReactSpecimen>
  )}

`;
};
