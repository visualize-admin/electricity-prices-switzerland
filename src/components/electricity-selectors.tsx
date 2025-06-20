import { Trans, t } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import { ComponentProps, useMemo } from "react";

import { Combobox } from "src/components/combobox";
import {
  categories,
  periods,
  priceComponents,
  products,
} from "src/domain/data";
import { getLocalizedLabel } from "src/domain/translation";
import { useQueryStateEnergyPricesMap } from "src/domain/query-states";

export const ElectricitySelectors = () => {
  const [queryState, setQueryState] = useQueryStateEnergyPricesMap();
  const getItemLabel = (id: string) => getLocalizedLabel({ id });
  const groupedCategories = useMemo(() => {
    return [
      { type: "header", title: getItemLabel("H-group") },
      ...categories.filter((x) => x.startsWith("H")),
      { type: "header", title: getItemLabel("C-group") },
      ...categories.filter((x) => x.startsWith("C")),
    ] as ComponentProps<typeof Combobox>["items"];
  }, []);

  return (
    <Box
      component="fieldset"
      sx={{
        border: 0,
        flexDirection: "column",
        justifyContent: "flex-start",
        px: 6,
        pt: 6,
        pb: 4,
        gap: 4,
        zIndex: 13,
      }}
      display="flex"
    >
      <Typography
        component="legend"
        variant="body2"
        fontWeight={700}
        sx={{ display: "contents" }}
      >
        <Trans id="selector.legend.select.parameters">
          Filter list and map
        </Trans>
      </Typography>
      <Combobox
        id="year"
        label={t({ id: "selector.year", message: "Year" })}
        items={periods}
        selectedItem={queryState.period ?? "2020"}
        setSelectedItem={(selectedItem) =>
          setQueryState({ period: selectedItem })
        }
      />
      <Combobox
        id="priceComponent"
        label={t({ id: "selector.priceComponent", message: "Price component" })}
        items={priceComponents}
        getItemLabel={getItemLabel}
        selectedItem={queryState.priceComponent ?? "total"}
        setSelectedItem={(selectedItem) =>
          setQueryState({ priceComponent: selectedItem })
        }
        infoDialogSlug="help-price-components"
      />
      <Combobox
        id="category"
        label={t({ id: "selector.category", message: "Category" })}
        items={groupedCategories}
        getItemLabel={getItemLabel}
        selectedItem={queryState.category ?? "H4"}
        setSelectedItem={(selectedItem) =>
          setQueryState({ category: selectedItem })
        }
        infoDialogSlug="help-categories"
      />
      <Combobox
        id="product"
        label={t({ id: "selector.product", message: "Product" })}
        items={products}
        getItemLabel={getItemLabel}
        selectedItem={queryState.product ?? "standard"}
        setSelectedItem={(selectedItem) =>
          setQueryState({ product: selectedItem })
        }
        infoDialogSlug="help-products"
      />
    </Box>
  );
};
