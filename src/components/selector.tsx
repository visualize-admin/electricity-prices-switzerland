import { Trans } from "@lingui/macro";
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
        bg: "primaryLight",
        px: 2,
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
        label={<Trans id="selector.year">Jahr</Trans>}
        items={periods}
        selectedItem={queryState.period ?? "2020"}
        setSelectedItem={(selectedItem) =>
          setQueryState({ period: selectedItem })
        }
      />
      <Combobox
        id="priceComponent"
        label={<Trans id="selector.priceComponent">Preiskomponente</Trans>}
        items={priceComponents}
        getItemLabel={getItemLabel}
        selectedItem={queryState.priceComponent ?? "total"}
        setSelectedItem={(selectedItem) =>
          setQueryState({ priceComponent: selectedItem })
        }
      />

      <Combobox
        id="category"
        label={<Trans id="selector.category">Kategorie</Trans>}
        items={categories}
        getItemLabel={getItemLabel}
        selectedItem={queryState.category ?? "H4"}
        setSelectedItem={(selectedItem) =>
          setQueryState({ category: selectedItem })
        }
      />

      <Combobox
        id="product"
        label={<Trans id="selector.product">Produkt</Trans>}
        items={products}
        getItemLabel={getItemLabel}
        selectedItem={queryState.product ?? "standard"}
        setSelectedItem={(selectedItem) =>
          setQueryState({ product: selectedItem })
        }
      />
    </Flex>
  );
};
