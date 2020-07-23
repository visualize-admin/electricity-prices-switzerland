import { Trans } from "@lingui/macro";
import { Flex, Text } from "theme-ui";
import { ComboboxMulti, Combobox } from "../../components/combobox";
import {
  categories,
  periods,
  products,
  municipalities,
} from "../../domain/data";
import { useQueryState } from "../../lib/use-query-state";
import { useI18n } from "../i18n-context";
import { getLocalizedLabel } from "../../domain/translation";

export const SelectorMulti = () => {
  const [queryState, setQueryState] = useQueryState();
  const i18n = useI18n();
  const getItemLabel = (id: string) => getLocalizedLabel({ i18n, id });
  return (
    <Flex
      as="fieldset"
      sx={{
        flexDirection: "column",
        justifyContent: "flex-start",
        bg: "primaryLight",
        m: 4,
        px: 5,
        py: 6,
        zIndex: 13,
        borderRadius: "default",
        "> div": { mt: 4 },
        "> fieldset": { mt: 4 },
      }}
    >
      <Text as="legend" variant="lead" sx={{ display: "contents" }}>
        <Trans id="selector.legend.select.parameters">
          Parameter auswählen
        </Trans>
      </Text>

      <>
        <ComboboxMulti
          id="municipality"
          label={<Trans id="selector.municipality">Gemeinde</Trans>}
          items={municipalities} // FIXME: municipalities
          // FIXME: should be possible to have no item selected:
          selectedItems={queryState.municipality ?? ["261"]}
          minSelectedItems={0}
          setSelectedItems={(items) => setQueryState({ municipality: items })}
        />
        <ComboboxMulti
          id="periods"
          label={<Trans id="selector.year">Jahr</Trans>}
          items={periods}
          selectedItems={queryState.period}
          minSelectedItems={1}
          setSelectedItems={(items) => setQueryState({ period: items })}
        />
        <Combobox
          id="categories"
          label={<Trans id="selector.category">Kategorie</Trans>}
          items={categories}
          getItemLabel={getItemLabel}
          selectedItem={queryState.category[0]}
          setSelectedItem={(selectedItem) =>
            setQueryState({ category: [selectedItem] })
          }
        />
        <Combobox
          id="products"
          label={<Trans id="selector.product">Produkt</Trans>}
          items={products}
          getItemLabel={getItemLabel}
          selectedItem={queryState.product[0]}
          setSelectedItem={(selectedItem) =>
            setQueryState({ product: [selectedItem] })
          }
        />
      </>
    </Flex>
  );
};
