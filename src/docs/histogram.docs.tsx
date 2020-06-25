import { markdown, ReactSpecimen } from "catalog";
import { Tooltip } from "../components/charts-generic/annotations/tooltip";
import {
  AxisHeightLinear,
  AxisHeightLinearDomain,
} from "../components/charts-generic/axis/axis-height-linear";
import {
  AxisWidthBand,
  AxisWidthBandDomain,
} from "../components/charts-generic/axis/axis-width-band";
import { Columns } from "../components/charts-generic/columns/columns-simple";
import { ColumnChart } from "../components/charts-generic/columns/columns-state";
import {
  ChartContainer,
  ChartSvg,
} from "../components/charts-generic/containers";
import { InteractionColumns } from "../components/charts-generic/interaction/interaction-columns";
import { pivot_longer } from "../domain/helpers";
import { zurichAndGeneva } from "./fixtures";
import { standard2020 } from "./data/standard-2020";
import { HistogramColumns } from "../components/charts-generic/histogram/histogram";
import { Histogram } from "../components/charts-generic/histogram/histogram-state";
import {
  AxisWidthLinear,
  AxisWidthLinearDomain,
} from "../components/charts-generic/axis/axis-width-linear";
export default () => {
  const data = standard2020.filter(
    (d) => d.Jahr === "2020" && d.Kategorie === "H4"
  );
  console.table(data);
  console.log(data.length);

  return markdown`
> Histogram

  ${(
    <ReactSpecimen span={6}>
      <Histogram
        data={data}
        fields={{
          x: {
            componentIri: "Total exkl. MWST",
          },
        }}
        measures={[
          {
            iri: "Total exkl. MWST",
            label: "Total exkl. MWST",
            __typename: "Measure",
          },
        ]}
        aspectRatio={0.4}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear />
            <AxisHeightLinearDomain />
            <AxisWidthLinear />
            <AxisWidthLinearDomain />
            {/* <AxisWidthBand />
            <Columns />
            <AxisWidthBandDomain />
            <InteractionColumns /> */}
            <HistogramColumns />
          </ChartSvg>
          <Tooltip type="single" />
        </ChartContainer>
      </Histogram>
    </ReactSpecimen>
  )}


  `;
};
