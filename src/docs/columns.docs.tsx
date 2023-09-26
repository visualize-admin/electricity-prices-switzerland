import { markdown, ReactSpecimen } from "catalog";

import { AxisHeightLinear } from "../components/charts-generic/axis/axis-height-linear";
import {
  AxisWidthBand,
  AxisWidthBandDomain,
} from "../components/charts-generic/axis/axis-width-band";
import { ColumnsGrouped } from "../components/charts-generic/columns/columns-grouped";
import { GroupedColumnChart } from "../components/charts-generic/columns/columns-grouped-state";
import { Columns } from "../components/charts-generic/columns/columns-simple";
import { ColumnsStacked } from "../components/charts-generic/columns/columns-stacked";
import { StackedColumnsChart } from "../components/charts-generic/columns/columns-stacked-state";
import { ColumnChart } from "../components/charts-generic/columns/columns-state";
import {
  ChartContainer,
  ChartSvg,
} from "../components/charts-generic/containers";
import { Tooltip } from "../components/charts-generic/interaction/tooltip";
import { LegendColor } from "../components/charts-generic/legends/color";
import { InteractionColumns } from "../components/charts-generic/overlay/interaction-columns";
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
> Columns Chart

  ${(
    <ReactSpecimen span={6}>
      <ColumnChart
        data={observations.filter((d) => d.ID === 565)}
        fields={{
          x: {
            componentIri: "Jahr",
            sorting: { sortingType: "byDimensionLabel", sortingOrder: "asc" },
          },
          y: {
            componentIri: "Total exkl. MWST",
          },
        }}
        measures={[
          {
            iri: "Jahr",
            label: "Jahr",
            __typename: "Measure",
          },
        ]}
        aspectRatio={0.4}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear /> <AxisWidthBand />
            <Columns /> <AxisWidthBandDomain />
            <InteractionColumns />
          </ChartSvg>
          <Tooltip type="single" />
        </ChartContainer>
      </ColumnChart>
    </ReactSpecimen>
  )}

  > Grouped Columns Chart

  ${(
    <ReactSpecimen span={6}>
      <GroupedColumnChart
        data={observations}
        fields={{
          x: {
            componentIri: "Jahr",
            sorting: { sortingType: "byDimensionLabel", sortingOrder: "asc" },
          },
          y: {
            componentIri: "Total exkl. MWST",
          },
          segment: {
            componentIri: "ID",
            type: "grouped",
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
            <AxisHeightLinear /> <AxisWidthBand />
            <ColumnsGrouped /> <AxisWidthBandDomain />
            <InteractionColumns />
          </ChartSvg>
          <Tooltip type="multiple" />
        </ChartContainer>

        <LegendColor symbol="square" />
      </GroupedColumnChart>
    </ReactSpecimen>
  )}

  > Stacked Columns Chart

  ${(
    <ReactSpecimen span={6}>
      <StackedColumnsChart
        data={longer}
        fields={{
          x: {
            componentIri: "Jahr",
            sorting: { sortingType: "byDimensionLabel", sortingOrder: "asc" },
          },
          y: {
            componentIri: "value",
          },
          segment: {
            componentIri: "priceComponent",
            type: "stacked",
            palette: "set2",
          },
        }}
        measures={[
          {
            iri: "value",
            label: "Price (CHF)",
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
            <AxisHeightLinear /> <AxisWidthBand />
            <ColumnsStacked /> <AxisWidthBandDomain />
            <InteractionColumns />
          </ChartSvg>
          <Tooltip type="multiple" />
        </ChartContainer>

        <LegendColor symbol="square" />
      </StackedColumnsChart>
    </ReactSpecimen>
  )}

`;
};
