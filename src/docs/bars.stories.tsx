import { BarsGrouped as BarsGroupedComponent } from "../components/charts-generic/bars/bars-grouped";
import { GroupedBarsChart as GroupedBarsChartComponent } from "../components/charts-generic/bars/bars-grouped-state";
import { Bars as BarsComponent } from "../components/charts-generic/bars/bars-simple";
import { BarChart as BarChartComponent } from "../components/charts-generic/bars/bars-state";
import {
  ChartContainer,
  ChartSvg,
} from "../components/charts-generic/containers";
import { pivot_longer } from "../domain/helpers";

import { zurichAndGeneva } from "./fixtures";

const observations = zurichAndGeneva.filter(
  (d) => d.Kategorie === "H1" && d.Produkt === "standard"
);

const longer_simple = pivot_longer({
  data: observations.filter((d) => d.ID === 692 && d.Jahr === "2020"),
  cols: ["Total exkl. MWST", "Netznutzung", "Energie", "Abgabe", "KEV"],
  name_to: "priceComponent",
});

const longer_grouped = pivot_longer({
  data: observations.filter((d) => d.Jahr === "2020"),
  cols: ["Total exkl. MWST", "Netznutzung", "Energie", "Abgabe", "KEV"],
  name_to: "priceComponent",
});

export const Bars = () => {
  return (
    <BarChartComponent
      data={longer_simple}
      fields={{
        x: {
          componentIri: "value",
          domain: [0, 40],
        },
        y: {
          componentIri: "priceComponent",
          sorting: { sortingType: "byMeasure", sortingOrder: "desc" },
        },
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
          <BarsComponent />
        </ChartSvg>
      </ChartContainer>
    </BarChartComponent>
  );
};

export const GroupedBars = () => {
  return (
    <GroupedBarsChartComponent
      data={longer_grouped}
      fields={{
        x: {
          componentIri: "value",
          domain: [0, 40],
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
          <BarsGroupedComponent />
        </ChartSvg>
      </ChartContainer>
    </GroupedBarsChartComponent>
  );
};

export default {
  component: BarChartComponent,
  title: "Charts / Bars",
};
