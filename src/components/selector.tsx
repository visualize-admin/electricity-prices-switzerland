import { Trans, t } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import { useMemo } from "react";

import { Combobox } from "src/components/combobox";
import {
  categories,
  periods,
  priceComponents,
  products,
} from "src/domain/data";
import { getLocalizedLabel } from "src/domain/translation";
import { useQueryStateSingle } from "src/lib/use-query-state";

export const Selector = () => {
  const [queryState, setQueryState] = useQueryStateSingle();
  const getItemLabel = (id: string) => getLocalizedLabel({ id });
  const groupedCategories = useMemo(() => {
    return [
      { type: "header", title: getItemLabel("H-group") },
      ...categories.filter((x) => x.startsWith("H")),
      { type: "header", title: getItemLabel("C-group") },
      ...categories.filter((x) => x.startsWith("C")),
    ] as React.ComponentProps<typeof Combobox>["items"];
  }, []);
  return (
    <Box
      component="fieldset"
      sx={{
        border: 0,
        flexDirection: "column",
        justifyContent: "flex-start",
        bgcolor: "muted.colored",
        px: 4,
        py: 4,
        gap: "0.325rem",
        zIndex: 13,
      }}
      display="flex"
    >
      <Typography
        component="legend"
        variant="lead"
        sx={{ display: "contents" }}
      >
        <Trans id="selector.legend.select.parameters">
          Liste und Karte filtern
        </Trans>
      </Typography>
      <Combobox
        id="year"
        label={t({ id: "selector.year", message: `Jahr` })}
        items={periods}
        selectedItem={queryState.period ?? "2020"}
        setSelectedItem={(selectedItem) =>
          setQueryState({ period: selectedItem })
        }
      />
      <Combobox
        id="priceComponent"
        label={t({ id: "selector.priceComponent", message: `Preiskomponente` })}
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
        label={t({ id: "selector.category", message: `Kategorie` })}
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
        label={t({ id: "selector.product", message: `Produkt` })}
        items={products}
        getItemLabel={getItemLabel}
        selectedItem={queryState.product ?? "standard"}
        setSelectedItem={(selectedItem) =>
          setQueryState({ product: selectedItem })
        }
        infoDialogSlug="help-products"
      />
      <Typography variant="lead" sx={{ mt: 4 }}>
        <Trans id="selector.results">Suchergebnisse:</Trans>
      </Typography>
    </Box>
  );
};
