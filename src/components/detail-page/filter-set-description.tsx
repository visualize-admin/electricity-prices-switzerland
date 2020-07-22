import { Trans } from "@lingui/macro";
import { Text } from "@theme-ui/components";
import * as React from "react";
import { getLocalizedLabel } from "../../domain/translation";

type FilterSet = {
  provider?: string;
  municipality?: string;
  canton?: string;
  period?: string;
  category?: string;
  priceComponent?: string | React.ReactNode;
  product?: string;
};

export const FilterSetDescription = ({
  filters,
}: {
  filters: Partial<FilterSet>;
}) => {
  return (
    <Text variant="paragraph1" color="monochrome800" sx={{ my: 2 }}>
      {Object.keys(filters).map((filterKey, i) => (
        <>
          <span>{getLocalizedLabel(filterKey)}</span> (
          <span>{filters[filterKey as keyof FilterSet]}</span>)
          {i < Object.keys(filters).length - 1 && ", "}
        </>
      ))}
    </Text>
  );
};
