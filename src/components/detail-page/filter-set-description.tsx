import { Trans } from "@lingui/macro";
import { Text, Box } from "@theme-ui/components";
import * as React from "react";
import { getLocalizedLabel } from "../../domain/translation";
import { useI18n } from "../i18n-context";

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
  const i18n = useI18n();
  return (
    <Text
      variant="paragraph1"
      sx={{ my: 4, color: "monochrome800", fontWeight: "light" }}
    >
      {Object.entries(filters).map(([key, value], i) => {
        console.log(key);
        if (!value) {
          return null;
        }

        return (
          <React.Fragment key={key}>
            <Box as="span">{getLocalizedLabel({ i18n, id: key })}</Box>
            {": "}
            <Box as="span" sx={{ fontWeight: "bold" }}>
              {getLocalizedLabel({
                i18n,
                id: value,
              })}
            </Box>
            {i < Object.keys(filters).length - 1 && ", "}
          </React.Fragment>
        );
      })}
    </Text>
  );
};
