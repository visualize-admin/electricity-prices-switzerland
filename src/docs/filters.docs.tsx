import { Button } from "@theme-ui/components";
import { markdown, ReactSpecimen } from "catalog";
import { FilterSetDescription } from "../components/detail-page/filter-set-description";
const filters = {
  period: "2019",
  product: "H4",
  priceComponent: "Total exkl. MwSt.",
};

export default () => markdown`
>

  ${(
    <ReactSpecimen span={6}>
      <FilterSetDescription filters={filters} />
    </ReactSpecimen>
  )}
`;
