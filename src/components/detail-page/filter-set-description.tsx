import * as React from "react";

import { getLocalizedLabel } from "src/domain/translation";

type FilterSet = {
  operator: string;
  municipality: string;
  canton: string;
  period: string;
  category: string;
  priceComponent: string;
  product: string;
};

export const FilterSetDescription = ({
  filters,
}: {
  filters: Partial<FilterSet>;
}) => {
  return Object.entries(filters).map(([key, value], i) => {
    if (!value) {
      return null;
    }

    return (
      <React.Fragment key={key}>
        {getLocalizedLabel({ id: key })}
        {": "}
        {getLocalizedLabel({
          id: value,
        })}
        {i < Object.keys(filters).length - 1 && ", "}
      </React.Fragment>
    );
  });
};
