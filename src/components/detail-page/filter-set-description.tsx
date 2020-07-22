import { Trans } from "@lingui/macro";
import { Text } from "@theme-ui/components";
import * as React from "react";

interface Filterset {
  provider?: string;
  municipality?: string;
  canton?: string;
  period?: string;
  category?: string;
  priceComponent?: string;
  product?: string;
}

export const FilterSetDescription = (filters: Filterset) => {
  return (
    <Text variant="paragraph1" color="monochrome800" sx={{ my: 2 }}>
      {Object.keys(filters).map((filterKey, i) => (
        <>
          <span>{getLocalizedLabel(filterKey)}</span> (
          <span>{filters[filterKey]}</span>)
          {i < Object.keys(filters).length - 1 && ", "}
        </>
      ))}
    </Text>
  );
};

const getLocalizedLabel = (filterKey: string) => {
  switch (filterKey) {
    case "period":
      return <Trans id="filters.year">Jahr</Trans>;
    case "category":
      return <Trans id="filters.category">Kategorie</Trans>;
    case "product":
      return <Trans id="filters.product">Produkt</Trans>;
    case "priceComponent":
      return <Trans id="filters.price.component">PreisKomponent</Trans>;
    default:
      return null;
  }
};
