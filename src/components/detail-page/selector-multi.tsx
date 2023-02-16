import { useTranslation } from "next-i18next";
import { useMemo } from "react";
import { Flex, Text } from "theme-ui";
import { Combobox, ComboboxMulti } from "../../components/combobox";
import { categories, Entity, periods, products } from "../../domain/data";
import { getLocalizedLabel } from "../../domain/translation";
import { useQueryState } from "../../lib/use-query-state";
import {
  CantonsCombobox,
  MunicipalitiesCombobox,
  OperatorsCombobox,
} from "../query-combobox";

export const SelectorMulti = ({
  entity = "municipality",
}: {
  entity?: Entity;
}) => {
  const { t } = useTranslation();
  const [queryState, setQueryState] = useQueryState();
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
        "> div": { mt: 4 },
        "> fieldset": { mt: 4 },
      }}
    >
      <Text as="legend" variant="lead" sx={{ display: "contents" }}>
        {t("selector.legend.select.parameters", "Parameter auswählen")}
      </Text>

      <>
        {entity === "operator" ? (
          <OperatorsCombobox
            label={t(
              "selector.compareoperators",
              "Netzbetreiber zum Vergleich"
            )}
            selectedItems={queryState.operator ?? []}
            setSelectedItems={(items) => setQueryState({ operator: items })}
          />
        ) : entity === "municipality" ? (
          <MunicipalitiesCombobox
            label={t(
              "selector.comparemunicipalities",
              "Gemeinden zum Vergleich"
            )}
            selectedItems={queryState.municipality ?? []}
            setSelectedItems={(items) => setQueryState({ municipality: items })}
          />
        ) : (
          <CantonsCombobox
            label={t("selector.comparecantons", "Kantone zum Vergleich")}
            selectedItems={queryState.canton ?? []}
            setSelectedItems={(items) => setQueryState({ canton: items })}
          />
        )}
        <ComboboxMulti
          id="periods"
          label={t("selector.years", "Jahre")}
          items={periods}
          selectedItems={queryState.period}
          minSelectedItems={1}
          setSelectedItems={(items) => setQueryState({ period: items })}
        />
        <Combobox
          id="categories"
          label={t("selector.category", `Kategorie`)}
          items={groupedCategories}
          getItemLabel={getItemLabel}
          selectedItem={queryState.category[0]}
          setSelectedItem={(selectedItem) =>
            setQueryState({ category: [selectedItem] })
          }
          infoDialogSlug="help-categories"
        />
        <Combobox
          id="products"
          label={t("selector.product", `Produkt`)}
          items={products}
          getItemLabel={getItemLabel}
          selectedItem={queryState.product[0]}
          setSelectedItem={(selectedItem) =>
            setQueryState({ product: [selectedItem] })
          }
          infoDialogSlug="help-products"
        />
      </>
    </Flex>
  );
};
