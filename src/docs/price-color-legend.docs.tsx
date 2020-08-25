import { markdown, ReactSpecimen } from "catalog";
import { PriceColorLegend } from "../components/price-color-legend";

export default () => markdown`
>

  ${(
    <ReactSpecimen span={2}>
      <PriceColorLegend stats={[2.7, 14.2, 21.3]} />
    </ReactSpecimen>
  )}
`;
