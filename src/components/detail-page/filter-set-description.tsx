import { Text, Box } from "@theme-ui/components";
import * as React from "react";

import { getLocalizedLabel } from "../../domain/translation";
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
  return (
    <Text
      variant="paragraph1"
      sx={{ my: 4, color: "monochrome800", fontWeight: "light" }}
    >
      {Object.entries(filters).map(([key, value], i) => {
        if (!value) {
          return null;
        }

        return (
          <React.Fragment key={key}>
            <Box as="span">{getLocalizedLabel({ id: key })}</Box>
            {": "}
            <Box as="span" sx={{ fontWeight: "bold" }}>
              {getLocalizedLabel({
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
