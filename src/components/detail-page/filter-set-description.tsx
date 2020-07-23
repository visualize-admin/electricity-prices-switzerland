import { Trans } from "@lingui/macro";
import { Text } from "@theme-ui/components";
import * as React from "react";
import { getLocalizedLabel } from "../../domain/translation";
import { useI18n } from "../i18n-context";

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
  const i18n = useI18n();
  return (
    <Text
      variant="paragraph1"
      sx={{ my: 6, color: "monochrome800", fontWeight: "light" }}
    >
      {Object.keys(filters).map((filterKey, i) => (
        <React.Fragment key={filterKey}>
          <span>{getLocalizedLabel({ i18n, id: filterKey })}</span> (
          <span>{filters[filterKey as keyof FilterSet]}</span>)
          {i < Object.keys(filters).length - 1 && ", "}
        </React.Fragment>
      ))}
    </Text>
  );
};
