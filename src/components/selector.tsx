import { useTranslation } from "next-i18next";
import { useMemo } from "react";
import { Flex, Text } from "theme-ui";
import { categories, periods, priceComponents, products } from "../domain/data";
import { getLocalizedLabel } from "../domain/translation";
import { useQueryStateSingle } from "../lib/use-query-state";
import { Combobox } from "./../components/combobox";

export const Selector = () => {
  const { t } = useTranslation();
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
    <Flex
      as="fieldset"
      sx={{
        flexDirection: "column",
        justifyContent: "flex-start",
        bg: "mutedColored",
        px: 4,
        py: 4,

        zIndex: 13,
        "> div": { mt: 3 },
        "> div:last-of-type": { mt: 6 },
      }}
    >
      <Text as="legend" variant="lead" sx={{ display: "contents" }}>
        {t("selector.legend.select.parameters", "Liste und Karte filtern")}
      </Text>
      <Combobox
        id="year"
        label={t("selector.year", `Jahr`)}
        items={periods}
        selectedItem={queryState.period ?? "2020"}
        setSelectedItem={(selectedItem) =>
          setQueryState({ period: selectedItem })
        }
      />
      <Combobox
        id="priceComponent"
        label={t("selector.priceComponent", `Preiskomponente`)}
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
        label={t("selector.category", `Kategorie`)}
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
        label={t("selector.product", `Produkt`)}
        items={products}
        getItemLabel={getItemLabel}
        selectedItem={queryState.product ?? "standard"}
        setSelectedItem={(selectedItem) =>
          setQueryState({ product: selectedItem })
        }
        infoDialogSlug="help-products"
      />
      <Text variant="lead">{t("selector.results", "Suchergebnisse:")}</Text>
    </Flex>
  );
};
