import { markdown, ReactSpecimen } from "catalog";
import { ColumnChart } from "../components/charts-generic/columns/columns-state";
import {
  ChartContainer,
  ChartSvg,
} from "../components/charts-generic/containers";
import { Columns } from "../components/charts-generic/columns/columns-simple";
import { InteractionColumns } from "../components/charts-generic/interaction/interaction-columns";
import { Tooltip } from "../components/charts-generic/annotations/tooltip";
import { observations, fields, measures } from "./fixtures";
import {
  AxisWidthBand,
  AxisWidthBandDomain,
} from "../components/charts-generic/axis/axis-width-band";
import { AxisHeightLinear } from "../components/charts-generic/axis/axis-height-linear";

export default () => markdown`
> Column Chart

  ${(
    <ReactSpecimen span={6}>
      <ColumnChart
        data={observations}
        fields={fields}
        measures={measures}
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


`;
