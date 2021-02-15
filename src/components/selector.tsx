import { Trans, t } from "@lingui/macro";
import { Flex, Text } from "theme-ui";
import { categories, periods, priceComponents, products } from "../domain/data";
import { getLocalizedLabel } from "../domain/translation";
import { useQueryStateSingle } from "../lib/use-query-state";
import { Combobox } from "./../components/combobox";
import { useI18n } from "./i18n-context";

export const Selector = () => {
  const [queryState, setQueryState] = useQueryStateSingle();
  const i18n = useI18n();
  const getItemLabel = (id: string) => getLocalizedLabel({ i18n, id });
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
      }}
    >
      <Text as="legend" variant="lead" sx={{ display: "contents" }}>
        <Trans id="selector.legend.select.parameters">
          Parameter auswählen
        </Trans>
      </Text>

      <Combobox
        id="year"
        label={i18n._(t("selector.year")`Jahr`)}
        items={periods}
        selectedItem={queryState.period ?? "2020"}
        setSelectedItem={(selectedItem) =>
          setQueryState({ period: selectedItem })
        }
      />
      <Combobox
        id="priceComponent"
        label={i18n._(t("selector.priceComponent")`Preiskomponente`)}
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
        label={i18n._(t("selector.category")`Kategorie`)}
        items={categories}
        getItemLabel={getItemLabel}
        selectedItem={queryState.category ?? "H4"}
        setSelectedItem={(selectedItem) =>
          setQueryState({ category: selectedItem })
        }
        infoDialogSlug="help-categories"
      />

      <Combobox
        id="product"
        label={i18n._(t("selector.product")`Produkt`)}
        items={products}
        getItemLabel={getItemLabel}
        selectedItem={queryState.product ?? "standard"}
        setSelectedItem={(selectedItem) =>
          setQueryState({ product: selectedItem })
        }
        infoDialogSlug="help-products"
      />
    </Flex>
  );
};
