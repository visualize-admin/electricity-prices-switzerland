import * as React from "react";

import {
  ElectricityCategory,
  PriceComponent,
  PriceProduct,
} from "src/domain/data";
import { getLocalizedLabel } from "src/domain/translation";

type FilterSet = {
  period: string;
  category: ElectricityCategory;
  priceComponent: PriceComponent;
  product: PriceProduct;
};

type ObjectEntry<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];

export const FilterSetDescription = ({
  filters,
}: {
  filters: Partial<FilterSet>;
}) => {
  return Object.entries(filters).map((entry_, i) => {
    const entry = entry_ as ObjectEntry<FilterSet>;
    if (!entry) {
      return null;
    }

    return (
      <React.Fragment key={entry[0]}>
        {getLocalizedLabel({ id: entry[0] })}
        {": "}
        {entry[0] === "period"
          ? entry[1]
          : getLocalizedLabel({
              id: entry[1],
            })}
        {i < Object.keys(filters).length - 1 && ", "}
      </React.Fragment>
    );
  });
};
