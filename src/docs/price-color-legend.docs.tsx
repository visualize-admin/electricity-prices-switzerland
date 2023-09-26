import { markdown, ReactSpecimen } from "catalog";

import { MapPriceColorLegend } from "../components/price-color-legend";

export default () => markdown`
>

  ${(
    <ReactSpecimen span={2}>
      <MapPriceColorLegend stats={[2.7, 14.2, 21.3]} />
    </ReactSpecimen>
  )}
`;
