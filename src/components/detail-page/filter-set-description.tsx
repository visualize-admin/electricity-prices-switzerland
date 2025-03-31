import { Box, Typography } from "@mui/material";
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
  return (
    <Typography
      variant="body1"
      sx={{ my: 4, color: "grey.800", fontWeight: "light" }}
    >
      {Object.entries(filters).map(([key, value], i) => {
        if (!value) {
          return null;
        }

        return (
          <React.Fragment key={key}>
            <Box component="span">{getLocalizedLabel({ id: key })}</Box>
            {": "}
            <Box component="span" sx={{ fontWeight: "bold" }}>
              {getLocalizedLabel({
                id: value,
              })}
            </Box>
            {i < Object.keys(filters).length - 1 && ", "}
          </React.Fragment>
        );
      })}
    </Typography>
  );
};
