import { t } from "@lingui/macro";
import { Box } from "@mui/material";
import { useMemo } from "react";

import { Combobox, ComboboxItem } from "src/components/combobox";
import {
  categories,
  ElectricityCategory,
  periods,
  mapPriceComponents,
  products,
} from "src/domain/data";
import { useQueryStateEnergyPricesMap } from "src/domain/query-states";
import { getLocalizedLabel, TranslationKey } from "src/domain/translation";

export const ElectricitySelectors = () => {
  const [queryState, setQueryState] = useQueryStateEnergyPricesMap();
  const getItemLabel = (id: TranslationKey) => getLocalizedLabel({ id });
  const hGroup = getLocalizedLabel({ id: "H-group" });
  const cGroup = getLocalizedLabel({ id: "C-group" });
  const groupedCategories = useMemo((): ComboboxItem<ElectricityCategory>[] => {
    return categories.map((value) => ({
      value,
      group: value.startsWith("H") ? hGroup : cGroup,
    }));
  }, [cGroup, hGroup]);

  return (
    <Box
      component="fieldset"
      sx={{
        border: 0,
        flexDirection: "column",
        justifyContent: "flex-start",
        p: 0,
        m: 0,
        gap: 3,
        zIndex: 13,
      }}
      display="flex"
    >
      <Combobox
        id="year"
        label={t({ id: "selector.year", message: "Year" })}
        infoDialogSlug="help-year-electricity"
        items={periods}
        selectedItem={queryState.period ?? "2020"}
        setSelectedItem={(selectedItem) =>
          setQueryState({ period: selectedItem })
        }
      />
      <Combobox
        id="priceComponent"
        label={t({ id: "selector.priceComponent", message: "Price component" })}
        items={mapPriceComponents}
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
