import { FilterSetDescription } from "../components/detail-page/filter-set-description";
const filters = {
  period: "2019",
  product: "H4",
  priceComponent: "Total exkl. MwSt.",
};

export const Filters = () => <FilterSetDescription filters={filters} />;

export default {
  title: "Components / Filters",
  component: FilterSetDescription,
};
